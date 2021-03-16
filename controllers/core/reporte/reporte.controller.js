const { response } = require('express');
const dayjs = require('dayjs');
const logger = require('../../../helpers/logger');
const { getMessage } = require('../../../helpers/messages');
const ObjectId = require('mongoose').Types.ObjectId;
const ISODate = require('mongoose').Types.ISODate;
// const AuditTask from './AuditTask'
// const AuditTask = require('mongoose').;
const OperacionFinanciera = require('../../../models/core/registro/operacion-financiera.model');
const OperacionFinancieraDetalle = require('../../../models/core/registro/operacion-financiera-detalle.model');
const Persona = require('../../../models/core/registro/persona.model');

const consultar_saldo_credito = async(req, res) => {

    // const { analista } = req.body;
    // const usuario = req.params.usuario;
    // const analista = '5fba86a0221345141849a492';
    const analista = req.params.analista;
    // const analista = req.params.analista;
    // const analista = req.params.analista;
    // const ip = requestIp.getClientIp(req).replace("::ffff:", "");

    const now = dayjs();
    // const desde = req.query.desde || "2001-01-01";
    const desde = new Date(req.params.desde).toISOString();
    // const desde = dayjs("01/01/2021");
    // const hasta = req.query.hasta || now.format("YYYY-MM-DD");
    const hasta = new Date(req.params.hasta).toISOString();
    // const hasta = now;

    try {

        // const operaciones = await OperacionFinanciera.find({
        //     "analista": analista,
        //     "estado": 'Vigente',
        //     "es_vigente": true,
        //     "es_borrado": false
        // });

        // console.log(desde)
        // console.log(ISODate("2020-12-31T05:00:00:00Z"))
        // console.log(hasta)

        const lista_operacion_financiera = await OperacionFinanciera.aggregate(
            [{
                    $match: {
                        "analista": new ObjectId(analista),
                        "estado": 'Vigente',
                        "producto.es_prestamo": true,
                        "es_vigente": true,
                        "es_borrado": false
                    }
                },
                {
                    $project: {
                        "_id": 1,
                        "persona": 1,
                        "analista": 1,
                        "producto.codigo": 1,
                        "producto.codigo_programacion": 1,
                        "monto_capital": 1,
                        "monto_ahorro_inicial": 1,
                        "fecha_inicio": 1,
                        "fecha_fin": 1,
                        "p_fecha_inicio": {
                            "$dateFromString": { dateString: "$fecha_inicio", format: "%d/%m/%Y" }
                        },
                        "p_fecha_fin": {
                            "$dateFromString": { dateString: "$fecha_fin", format: "%d/%m/%Y" }
                        },
                    }
                },
                {
                    $addFields: {
                        "dias_vencido": {
                            $divide: [{ $subtract: ["$$NOW", "$p_fecha_fin"] }, 1000 * 60 * 60 * 24]
                        }
                    }
                },
                {
                    $addFields: {
                        "calificacion": {
                            $switch: {
                                branches: [{
                                        case: { $lt: ["$dias_vencido", 0] },
                                        then: "No vencido"
                                    }, {
                                        case: { $lt: ["$dias_vencido", 8] },
                                        then: "Normal"
                                    },
                                    {
                                        case: { $lt: ["$dias_vencido", 30] },
                                        then: "CPP"
                                    },
                                    {
                                        case: { $lt: ["$dias_vencido", 60] },
                                        then: "Deficiente"
                                    },
                                    {
                                        case: { $lt: ["$dias_vencido", 120] },
                                        then: "Dudoso"
                                    },
                                ],
                                default: "Pérdida"
                            }
                        }
                    }
                },
                {
                    $match: {
                        "p_fecha_inicio": {
                            $gte: new Date(desde),
                            $lte: new Date(hasta)
                        }
                    }
                },
                { $sort: { "p_fecha_inicio": -1 } }
            ]);

        const resumen = {

            total_monto_prestamo: 0,
            total_monto_cuota: 0,
            total_monto_ahorro_inicial: 0,
            total_monto_amortizacion: 0,
            total_monto_ahorro: 0,
            total_monto_retiro: 0,
            total_monto_saldo_capital: 0,
            total_monto_saldo_interes: 0,
            total_monto_saldo_neto: 0,
            total_monto_saldo_liquidado: 0,

            total_monto_cpp: 0,
            total_monto_deficiente: 0,
            total_monto_dudoso: 0,
            total_monto_perdida: 0,
            total_monto_retraso: 0,

            total_porcentaje_cpp: 0,
            total_porcentaje_deficiente: 0,
            total_porcentaje_dudoso: 0,
            total_porcentaje_perdida: 0,
            total_porcentaje_retraso: 0,
        }

        let lista = [];
        let monto_cuota = 0;

        for (let i = 0; i < lista_operacion_financiera.length; i++) {

            // const monto_cuota = 0;
            let monto_amortizacion = 0;
            let monto_ahorro = lista_operacion_financiera[i].monto_ahorro_inicial || 0;
            let monto_retiro = 0;
            let monto_saldo_capital = 0;
            let monto_saldo_interes = 0;
            let monto_saldo_neto = 0;
            let monto_saldo_liquidado = 0;

            const cuotas = await OperacionFinancieraDetalle.find({ "operacion_financiera": lista_operacion_financiera[i]._id })

            for (let j = 0; j < cuotas.length; j++) {

                if (cuotas[j].numero_cuota == 1 &&
                    cuotas[j].es_vigente &&
                    !cuotas[j].es_borrado) {

                    monto_cuota = (cuotas[j].ingresos.monto_amortizacion_capital || 0) +
                        (cuotas[j].ingresos.monto_interes || 0) +
                        (cuotas[j].ahorros.monto_ahorro_programado || 0);
                }

                if (cuotas[j].es_vigente &&
                    !cuotas[j].es_borrado) {

                    // let monto_cuota_pagada = 0;                    

                    monto_amortizacion += (cuotas[j].estado === 'Pagado') ?
                        ((cuotas[j].ingresos.monto_amortizacion_capital || 0) + (cuotas[j].ingresos.monto_interes || 0)) :
                        0;
                    monto_ahorro += (cuotas[j].ahorros.monto_ahorro_voluntario || 0);
                    monto_retiro += (cuotas[j].ahorros.monto_retiro_ahorro_inicial || 0) +
                        (cuotas[j].ahorros.monto_retiro_ahorro_voluntario || 0);
                    // monto_ahorro += cuota.monto_ahorro_voluntario + cuota.monto_ahorro_programado;
                    monto_saldo_capital += (cuotas[j].estado === 'Pendiente' || cuotas[j].estado === 'Amortizado') ?
                        (cuotas[j].ingresos.monto_amortizacion_capital || 0) :
                        0;
                    monto_saldo_interes += (cuotas[j].estado === 'Pendiente' || cuotas[j].estado === 'Amortizado') ?
                        (cuotas[j].ingresos.monto_interes || 0) :
                        0;

                    if (cuotas[j].estado === 'Amortizado') {

                        // let monto_cuota_pagada = 0;

                        for (let k = 0; k < cuotas[j].pagos.length; k++) {

                            if (cuotas[j].pagos[k].es_vigente) {

                                monto_amortizacion += (cuotas[j].pagos[k].ingresos.monto_amortizacion_capital || 0) +
                                    (cuotas[j].pagos[k].ingresos.monto_interes || 0);
                                monto_ahorro += (cuotas[j].pagos[k].ahorros.monto_ahorro_voluntario || 0);
                                monto_retiro += (cuotas[j].pagos[k].ahorros.monto_retiro_ahorro_inicial || 0) +
                                    (cuotas[j].pagos[k].ahorros.monto_retiro_ahorro_voluntario || 0);
                                monto_saldo_capital -= (cuotas[j].pagos[k].ingresos.monto_amortizacion_capital || 0);
                                monto_saldo_interes -= (cuotas[j].pagos[k].ingresos.monto_interes || 0);
                            }
                        }

                        // monto_amortizacion += monto_cuota_pagada;
                    }
                }
            }

            // monto_ahorro+=item.monto_ahorro_inicial;
            monto_saldo_neto = monto_saldo_capital + monto_saldo_interes;
            monto_saldo_liquidado = monto_saldo_neto - (monto_ahorro - monto_retiro);

            const persona = await Persona.findById(lista_operacion_financiera[i].persona,
                "nombre apellido_paterno apellido_materno"
            )

            const objeto = {
                socio: persona.apellido_paterno + ' ' + persona.apellido_materno + ', ' + persona.nombre,
                fecha_inicio: lista_operacion_financiera[i].fecha_inicio,
                fecha_fin: lista_operacion_financiera[i].fecha_fin,
                producto: lista_operacion_financiera[i].producto.codigo,
                programacion: lista_operacion_financiera[i].producto.codigo_programacion,
                // producto: lista_operacion_financiera[i].codigo,
                // programacion: lista_operacion_financiera[i].codigo_programacion,
                monto_prestamo: (lista_operacion_financiera[i].monto_capital || 0).toFixed(2),
                monto_cuota: monto_cuota.toFixed(2),
                monto_ahorro_inicial: (lista_operacion_financiera[i].monto_ahorro_inicial || 0).toFixed(2),
                monto_amortizacion: monto_amortizacion.toFixed(2),
                monto_ahorro: monto_ahorro.toFixed(2),
                monto_retiro: monto_retiro.toFixed(2),
                monto_saldo_capital: monto_saldo_capital.toFixed(2),
                monto_saldo_interes: monto_saldo_interes.toFixed(2),
                monto_saldo_neto: monto_saldo_neto.toFixed(2),
                monto_saldo_liquidado: monto_saldo_liquidado.toFixed(2),
                dias_vencido: lista_operacion_financiera[i].dias_vencido.toFixed(0),
                calificacion: lista_operacion_financiera[i].calificacion,
            };

            lista.push(objeto);

            resumen.total_monto_prestamo += (lista_operacion_financiera[i].monto_capital || 0);
            resumen.total_monto_cuota += monto_cuota;
            resumen.total_monto_ahorro_inicial += (lista_operacion_financiera[i].monto_ahorro_inicial || 0);
            resumen.total_monto_amortizacion += monto_amortizacion;
            resumen.total_monto_ahorro += monto_ahorro;
            resumen.total_monto_retiro += monto_retiro;
            resumen.total_monto_saldo_capital += monto_saldo_capital;
            resumen.total_monto_saldo_interes += monto_saldo_interes;
            resumen.total_monto_saldo_neto += monto_saldo_neto;
            resumen.total_monto_saldo_liquidado += monto_saldo_liquidado;

            switch (lista_operacion_financiera[i].calificacion) {
                case 'CPP':
                    resumen.total_monto_cpp += monto_saldo_liquidado;
                    break;
                case 'Deficiente':
                    resumen.total_monto_deficiente += monto_saldo_liquidado;
                    break;
                case 'Dudoso':
                    resumen.total_monto_dudoso += monto_saldo_liquidado;
                    break;
                case 'Pérdida':
                    resumen.total_monto_perdida += monto_saldo_liquidado;
                    break;
            }


            // resumen.total_monto_cpp += monto_cpp;
            // resumen.total_monto_deficiente += monto_deficiente;
            // resumen.total_monto_dudoso += monto_dudoso;
            // resumen.total_monto_perdida += monto_perdida;
            // resumen.total_monto_perdida += monto_perdida;
            // resumen.total_monto_retraso += monto_retraso;
        }

        resumen.total_monto_retraso = Number(resumen.total_monto_cpp +
            resumen.total_monto_deficiente +
            resumen.total_monto_dudoso +
            resumen.total_monto_perdida).toFixed(2);

        resumen.total_porcentaje_cpp = ((resumen.total_monto_cpp * 100) / resumen.total_monto_saldo_capital).toFixed(2);
        resumen.total_porcentaje_deficiente = ((resumen.total_monto_deficiente * 100) / resumen.total_monto_saldo_capital).toFixed(2);
        resumen.total_porcentaje_dudoso = ((resumen.total_monto_dudoso * 100) / resumen.total_monto_saldo_capital).toFixed(2);
        resumen.total_porcentaje_perdida = ((resumen.total_monto_perdida * 100) / resumen.total_monto_saldo_capital).toFixed(2);
        resumen.total_porcentaje_retraso = ((resumen.total_monto_retraso * 100) / resumen.total_monto_saldo_capital).toFixed(2);

        resumen.total_monto_prestamo = resumen.total_monto_prestamo.toFixed(2);
        resumen.total_monto_cuota = resumen.total_monto_cuota.toFixed(2);
        resumen.total_monto_ahorro_inicial = resumen.total_monto_ahorro_inicial.toFixed(2);
        resumen.total_monto_amortizacion = resumen.total_monto_amortizacion.toFixed(2);
        resumen.total_monto_ahorro = resumen.total_monto_ahorro.toFixed(2);
        resumen.total_monto_retiro = resumen.total_monto_retiro.toFixed(2);
        resumen.total_monto_saldo_capital = resumen.total_monto_saldo_capital.toFixed(2);
        resumen.total_monto_saldo_interes = resumen.total_monto_saldo_interes.toFixed(2);
        resumen.total_monto_saldo_neto = resumen.total_monto_saldo_neto.toFixed(2);
        resumen.total_monto_saldo_liquidado = resumen.total_monto_saldo_liquidado.toFixed(2);

        resumen.total_monto_cpp = resumen.total_monto_cpp.toFixed(2);
        resumen.total_monto_deficiente = resumen.total_monto_deficiente.toFixed(2);
        resumen.total_monto_dudoso = resumen.total_monto_dudoso.toFixed(2);
        resumen.total_monto_perdida = resumen.total_monto_perdida.toFixed(2);

        // lista.forEach(item => {
        //     console.log(item.personas)
        // });

        // console.log(lista)



        res.json({
            ok: true,
            lista,
            resumen
        })
    } catch (error) {

        logger.logError(req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

module.exports = {

    consultar_saldo_credito,
};