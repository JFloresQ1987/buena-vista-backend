const { response } = require("express");
const logger = require("../../../helpers/logger");
const OperacionFinanciera = require("../../../models/core/registro/operacion-financiera.model");
const OperacionFinancieraDetalle = require("../../../models/core/registro/operacion-financiera-detalle.model");
const PagoOperacionFinanciera = require("../../../models/core/caja/operacion-financiera-pago.model");
const PagoConcepto = require("../../../models/core/configuracion/pago-concepto.model");
const Usuario = require("../../../models/core/seguridad/usuario.model");
// const CajaDiario = require('../../../models/core/caja/caja-diario.model');
// const Caja = require('../../../models/core/seguridad/caja.model');
// const dayjs = require('dayjs');
// const RequestIp = require('@supercharge/request-ip')
const requestIp = require('request-ip');
const { getRecibo } = require('../../../helpers/core/recibo');
const { validarPago } = require('../../../helpers/core/validar-pago');
const dayjs = require('dayjs');
const operacionFinancieraPagoModel = require("../../../models/core/caja/operacion-financiera-pago.model");

const listar_operaciones_financieras_detalle_vigentes = async(req, res) => {

    // const { id_operacion_financiera } = req.body;
    const id_operacion_financiera = req.params.id_operacion_financiera;

    try {

        const lista = await OperacionFinancieraDetalle.find({
                "operacion_financiera": id_operacion_financiera,
                // "estado": "Vigente",
                "estado": { $in: ["Pendiente", "Amortizado"] },
                "es_borrado": false
            })
            .sort({ "numero_cuota": 1 });

        // //console.log(lista)

        for (let i = 0; i < lista.length; i++) {

            let monto_gasto_pagado = 0;
            let monto_ahorro_inicial_pagado = 0;
            let monto_ahorro_voluntario_pagado = 0;
            let monto_ahorro_programado_pagado = 0;
            let monto_amortizacion_capital_pagado = 0;
            let monto_interes_pagado = 0;
            let monto_mora_pagado = 0;

            for (let j = 0; j < lista[i].pagos.length; j++) {

                if (lista[i].pagos[j].es_vigente) {

                    monto_gasto_pagado += lista[i].pagos[j].ingresos.monto_gasto || 0;
                    monto_ahorro_inicial_pagado += lista[i].pagos[j].ahorros.monto_ahorro_inicial || 0;
                    monto_ahorro_voluntario_pagado += lista[i].pagos[j].ahorros.monto_ahorro_voluntario || 0;
                    monto_ahorro_programado_pagado += lista[i].pagos[j].ahorros.monto_ahorro_programado || 0;
                    monto_amortizacion_capital_pagado += lista[i].pagos[j].ingresos.monto_amortizacion_capital || 0;
                    monto_interes_pagado += lista[i].pagos[j].ingresos.monto_interes || 0;
                    monto_mora_pagado += lista[i].pagos[j].ingresos.monto_mora || 0;
                }
            }

            lista[i].ingresos.monto_gasto -= monto_gasto_pagado;
            lista[i].ahorros.monto_ahorro_inicial -= monto_ahorro_inicial_pagado;
            lista[i].ahorros.monto_ahorro_voluntario -= monto_ahorro_voluntario_pagado;
            lista[i].ahorros.monto_ahorro_programado -= monto_ahorro_programado_pagado;
            lista[i].ingresos.monto_amortizacion_capital -= monto_amortizacion_capital_pagado;
            lista[i].ingresos.monto_mora -= monto_mora_pagado;
            lista[i].ingresos.monto_interes -= monto_interes_pagado;
        }

        res.json({
            ok: true,
            lista
        })
    } catch (error) {

        //console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado.'
        });
    }
}

const listar = async(req, res) => {

    // const { id_operacion_financiera } = req.body;
    // const id_operacion_financiera = req.params.id_operacion_financiera;

    try {

        const lista = await PagoOperacionFinanciera.find({
                "es_vigente": true,
                "es_borrado": false
            })
            // .sort({ "_id": -1 });
            .sort({ $natural: -1 });

        res.json({
            ok: true,
            lista
        })
    } catch (error) {

        //console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado.'
        });
    }
}

const desembolsar_operacion_financiera = async(req, res) => {

    const id = req.params.id;
    const id_usuario_sesion = req.header("id_usuario_sesion");
    const now = dayjs();
    const ip = requestIp.getClientIp(req).replace("::ffff:", "");

    const {
        // operacion_financiera,
        // monto_ahorro_voluntario,
        // monto_recibido,
        // cuotas,
        id_socio,
        documento_identidad_socio,
        nombres_apellidos_socio
    } = req.body;

    // console.log(documento_identidad_socio)
    // console.log(nombres_apellidos_socio)

    try {

        const data_validacion = {
            ip: ip,
            id_usuario_sesion: id_usuario_sesion,
            es_ingreso: false,
            // caja: caja.id
        };

        const resultado_validacion = await validarPago(data_validacion);

        if (!resultado_validacion.ok)
            return res.status(404).json(resultado_validacion);

        const modelo = await OperacionFinanciera.findById(id);
        // modelo.desembolso.se_desembolso_prestamo = true;

        const monto_desembolso = modelo.monto_capital;
        const recibo = resultado_validacion.recibo;

        // console.log(recibo)

        const desembolso = {
            se_desembolso_prestamo: true,
            recibo: {
                local_atencion: recibo.local_atencion,
                serie: recibo.serie,
                numero: recibo.numero,
                fecha: recibo.fecha,
                monto_desembolso: monto_desembolso
            }
        };

        // console.log(desembolso)

        modelo.desembolso = desembolso;

        // modelo.desembolo.se_desembolso_prestamo = true;
        // modelo.desembolo.recibo.serie = recibo.serie;
        // modelo.desembolo.recibo.numero = recibo.numero;
        // modelo.desembolo.recibo.fecha = recibo.fecha;
        // modelo.desembolo.recibo.monto_desembolso = monto_desembolso;


        modelo.comentario.push({
            tipo: 'Editado',
            id_usuario: req.header('id_usuario_sesion'),
            usuario: req.header('usuario_sesion'),
            nombre: req.header('nombre_sesion'),
            fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
            comentario: 'Se realizó desembolso'
        });

        console.log(modelo)

        await modelo.save();

        // const monto_desembolso = modelo.monto_capital;
        // const recibo = resultado_validacion.recibo;

        const modelo_pago = new PagoOperacionFinanciera();

        modelo_pago.es_ingreso = false;

        modelo_pago.diario = {
            caja_diario: resultado_validacion.caja_diario,
            // caja_diario: caja_diario.id,
            caja: resultado_validacion.caja,
            // caja: caja.id,
            estado: 'Abierto'
        };

        modelo_pago.recibo = {
            estado: 'Vigente',
            serie: recibo.serie,
            numero: recibo.numero,
            fecha: recibo.fecha,
            ejercicio: '2020',
            monto_total: monto_desembolso.toFixed(1)
        };

        modelo_pago.producto = {
            persona: id_socio,
            operacion_financiera: modelo.id,
            // monto_gasto: monto_total_gasto,
            // monto_ahorro_inicial: monto_total_ahorro_inicial,
            // monto_ahorro_voluntario: monto_total_ahorro_voluntario,
            // monto_ahorro_programado: monto_total_ahorro_programado,
            // monto_amortizacion_capital: monto_total_amortizacion_capital,
            // monto_interes: monto_total_interes,
            // monto_mora: monto_total_mora
            monto_desembolso: monto_desembolso
        };

        modelo_pago.detalle = [];

        // modelo_pago.detalle.push({
        //     producto: {
        //         // operacion_financiera_detalle: cuota.id,
        //         numero_cuota: cuota.numero_cuota,
        //         monto_gasto: monto_gasto_a_pagar,
        //         monto_ahorro_inicial: monto_ahorro_inicial_a_pagar,
        //         // monto_retiro_ahorro_inicial: cuota.monto_retiro_ahorro_inicial,
        //         monto_ahorro_voluntario: monto_ahorro_voluntario_a_pagar,
        //         // monto_retiro_ahorro_voluntario: cuota.monto_retiro_ahorro_voluntario,
        //         monto_ahorro_programado: monto_ahorro_programado_a_pagar,
        //         // monto_retiro_ahorro_programado: cuota.monto_retiro_ahorro_programado,
        //         monto_amortizacion_capital: monto_amortizacion_capital_a_pagar,
        //         monto_interes: monto_interes_a_pagar,
        //         // monto_interes_ganado: cuota.monto_interes_ganado,
        //         // monto_retiro_interes_ganado: cuota.monto_retiro_interes_ganado,
        //         monto_mora: monto_mora_a_pagar
        //     }
        // });

        // console.log(modelo_pago)

        await modelo_pago.save();

        // console.log('pasoo')

        const data_recibo = {

            institucion: {
                denominacion: 'Buenavista La Bolsa S.A.C.',
                agencia: 'Agencia Ayacucho',
                ruc: '20574744599',
                frase: ''
            },
            persona: {
                documento_identidad: documento_identidad_socio,
                nombre_completo: nombres_apellidos_socio
            },


            // documento_identidad_socio: documento_identidad_socio,
            // nombres_apellidos_socio: nombres_apellidos_socio,
            analista: 'XXX XXX XXX',
            // analista: modelo.analista.usuario.persona.nombre +
            //     ' ' + modelo.analista.usuario.persona.apellido_paterno +
            //     ' ' + modelo.analista.usuario.persona.apellido_materno,

            producto: {
                descripcion: modelo.producto.tipo.descripcion,
                // cuota: 0,
                monto_desembolso: monto_desembolso
                    // monto_gasto: monto_total_gasto.toFixed(2),
                    // monto_ahorro_inicial: monto_total_ahorro_inicial.toFixed(2),
                    // monto_ahorro_voluntario: monto_total_ahorro_voluntario.toFixed(2),
                    // monto_ahorro_programado: monto_total_ahorro_programado.toFixed(2),
                    // monto_amortizacion_capital: monto_total_amortizacion_capital.toFixed(2),
                    // monto_interes: monto_total_interes.toFixed(2),
                    // monto_mora: monto_total_mora.toFixed(2),
            },
            recibo: {
                usuario: req.header('usuario_sesion'),
                numero: recibo.numero,
                fecha: recibo.fecha,
                tipo_impresion: 'Original',
                monto_total: monto_desembolso.toFixed(2)
            }
        };

        // console.log(data_recibo)

        res.json({
            ok: true,
            recibo: data_recibo
                // recibo: getRecibo(data_recibo)
        })

        // res.json({
        //     ok: true,
        //     msg: "Desembolso realizado satisfactoriamente.",
        // });

    } catch (error) {

        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: error.msg,
        });
    }
}

const pagar_operacion_financiera = async(req, res) => {

    // const { id_operacion_financiera } = req.body;
    const id_usuario_sesion = req.header('id_usuario_sesion');
    const ip = requestIp.getClientIp(req).replace('::ffff:', '');

    const {
        operacion_financiera,
        monto_ahorro_voluntario,
        monto_recibido,
        cuotas,
        id_socio,
        documento_identidad_socio,
        nombres_apellidos_socio
    } = req.body;

    try {

        const data_validacion = {
            ip: ip,
            id_usuario_sesion: id_usuario_sesion,
            es_ingreso: true
        };

        const resultado_validacion = await validarPago(data_validacion);

        if (!resultado_validacion.ok)
            return res.status(404).json(resultado_validacion)

        const recibo = resultado_validacion.recibo;

        let monto_recibido_actual = monto_recibido;
        let monto_ahorro_voluntario_actual = monto_ahorro_voluntario;
        let monto_total = 0;
        let monto_total_gasto = 0;
        let monto_total_ahorro_inicial = 0;
        let monto_total_ahorro_voluntario = 0;
        let monto_total_ahorro_programado = 0;
        let monto_total_amortizacion_capital = 0;
        let monto_total_interes = 0;
        let monto_total_mora = 0;

        const modelo = new PagoOperacionFinanciera(req.body);

        for (let i = 0; i < cuotas.length; i++) {

            const cuota = await OperacionFinancieraDetalle.findById({ "_id": cuotas[i] })

            if (cuota.numero_cuota === 0)
                await OperacionFinancieraDetalle.updateMany({ "operacion_financiera": operacion_financiera, "estado": "Prependiente", "es_borrado": false }, { "estado": "Pendiente" });

            if (i === 0 && Number(monto_ahorro_voluntario_actual) > 0)
                cuota.ahorros.monto_ahorro_voluntario += Number(monto_ahorro_voluntario_actual);
            else if (i > 0 && Number(monto_ahorro_voluntario_actual) > 0)
                monto_ahorro_voluntario_actual = 0;

            let monto_gasto_pagado = 0;
            let monto_ahorro_inicial_pagado = 0;
            let monto_ahorro_voluntario_pagado = 0;
            let monto_ahorro_programado_pagado = 0;
            let monto_amortizacion_capital_pagado = 0;
            let monto_interes_pagado = 0;
            let monto_mora_pagado = 0;

            for (let i = 0; i < cuota.pagos.length; i++) {

                monto_gasto_pagado += cuota.pagos[i].ingresos.monto_gasto || 0;
                monto_ahorro_inicial_pagado += cuota.pagos[i].ahorros.monto_ahorro_inicial || 0;
                monto_ahorro_voluntario_pagado += cuota.pagos[i].ahorros.monto_ahorro_voluntario || 0;
                monto_ahorro_programado_pagado += cuota.pagos[i].ahorros.monto_ahorro_programado || 0;
                monto_amortizacion_capital_pagado += cuota.pagos[i].ingresos.monto_amortizacion_capital || 0;
                monto_interes_pagado += cuota.pagos[i].ingresos.monto_interes || 0;
                monto_mora_pagado += cuota.pagos[i].ingresos.monto_mora || 0;
            }

            let monto_gasto_a_pagar = cuota.ingresos.monto_gasto - monto_gasto_pagado;
            let monto_ahorro_inicial_a_pagar = cuota.ahorros.monto_ahorro_inicial - monto_ahorro_inicial_pagado;
            let monto_ahorro_voluntario_a_pagar = Number(monto_ahorro_voluntario_actual); //cuota.monto_ahorro_voluntario - monto_ahorro_voluntario_pagado;
            let monto_ahorro_programado_a_pagar = cuota.ahorros.monto_ahorro_programado - monto_ahorro_programado_pagado;
            let monto_amortizacion_capital_a_pagar = cuota.ingresos.monto_amortizacion_capital - monto_amortizacion_capital_pagado;
            let monto_interes_a_pagar = cuota.ingresos.monto_interes - monto_interes_pagado;
            let monto_mora_a_pagar = cuota.ingresos.monto_mora - monto_mora_pagado;

            const monto_total_cuota_a_pagar = monto_gasto_a_pagar +
                monto_ahorro_inicial_a_pagar +
                monto_ahorro_voluntario_a_pagar +
                monto_ahorro_programado_a_pagar +
                monto_amortizacion_capital_a_pagar +
                monto_interes_a_pagar +
                monto_mora_a_pagar

            if (monto_total_cuota_a_pagar <= monto_recibido_actual) {

                cuota.estado = 'Pagado';

                cuota.pagos.push({
                    recibo: {
                        local_atencion: recibo.local_atencion,
                        serie: recibo.serie,
                        numero: recibo.numero,
                        fecha: recibo.fecha
                    },
                    ingresos: {
                        monto_gasto: monto_gasto_a_pagar,
                        monto_amortizacion_capital: monto_amortizacion_capital_a_pagar,
                        monto_interes: monto_interes_a_pagar,
                        monto_mora: monto_mora_a_pagar
                    },
                    ahorros: {

                        monto_ahorro_inicial: monto_ahorro_inicial_a_pagar,
                        monto_ahorro_voluntario: monto_ahorro_voluntario_a_pagar,
                        monto_ahorro_programado: monto_ahorro_programado_a_pagar,
                    }
                });

                monto_recibido_actual -= monto_total_cuota_a_pagar;

                modelo.detalle.push({
                    producto: {
                        operacion_financiera_detalle: cuota.id,
                        numero_cuota: cuota.numero_cuota,
                        monto_gasto: monto_gasto_a_pagar,
                        monto_ahorro_inicial: monto_ahorro_inicial_a_pagar,
                        // monto_retiro_ahorro_inicial: cuota.monto_retiro_ahorro_inicial,
                        monto_ahorro_voluntario: monto_ahorro_voluntario_a_pagar,
                        // monto_retiro_ahorro_voluntario: cuota.monto_retiro_ahorro_voluntario,
                        monto_ahorro_programado: monto_ahorro_programado_a_pagar,
                        // monto_retiro_ahorro_programado: cuota.monto_retiro_ahorro_programado,
                        monto_amortizacion_capital: monto_amortizacion_capital_a_pagar,
                        monto_interes: monto_interes_a_pagar,
                        // monto_interes_ganado: cuota.monto_interes_ganado,
                        // monto_retiro_interes_ganado: cuota.monto_retiro_interes_ganado,
                        monto_mora: monto_mora_a_pagar
                    }
                });

                monto_total += monto_gasto_a_pagar + monto_ahorro_inicial_a_pagar +
                    // monto_ahorro_voluntario_a_pagar + monto_total_cuota +
                    monto_ahorro_voluntario_a_pagar + monto_ahorro_programado_a_pagar +
                    monto_amortizacion_capital_a_pagar + monto_interes_a_pagar +
                    monto_mora_a_pagar; // + parseInt(monto_ahorro_voluntario);

                monto_total_gasto += monto_gasto_a_pagar;
                monto_total_ahorro_inicial += monto_ahorro_inicial_a_pagar;
                monto_total_ahorro_voluntario += monto_ahorro_voluntario_a_pagar;
                monto_total_ahorro_programado += monto_ahorro_programado_a_pagar;
                monto_total_amortizacion_capital += monto_amortizacion_capital_a_pagar;
                monto_total_interes += monto_interes_a_pagar;
                monto_total_mora += monto_mora_a_pagar;

            } else {

                if (monto_recibido_actual >= 0.1) {

                    let monto_gasto_a_amortizar = 0;
                    let monto_ahorro_inicial_a_amortizar = 0;
                    let monto_ahorro_voluntario_a_amortizar = 0;
                    let monto_ahorro_programado_a_amortizar = 0;
                    let monto_amortizacion_capital_a_amortizar = 0;
                    let monto_interes_a_amortizar = 0;
                    let monto_mora_a_amortizar = 0;

                    if (monto_recibido_actual > 0 && monto_ahorro_voluntario_a_pagar <= monto_recibido_actual) {
                        monto_ahorro_voluntario_a_amortizar = monto_ahorro_voluntario_a_pagar;
                        monto_recibido_actual -= monto_ahorro_voluntario_a_pagar;
                    } else if (monto_recibido_actual > 0 && monto_ahorro_voluntario_a_pagar > monto_recibido_actual) {
                        monto_ahorro_voluntario_a_amortizar = monto_recibido_actual;
                        monto_recibido_actual = 0;
                    }

                    if (monto_recibido_actual > 0 && monto_mora_a_pagar <= monto_recibido_actual) {
                        monto_mora_a_amortizar = monto_mora_a_pagar;
                        monto_recibido_actual -= monto_mora_a_pagar;
                    } else if (monto_recibido_actual > 0 && monto_mora_a_pagar > monto_recibido_actual) {
                        monto_mora_a_amortizar = monto_recibido_actual;
                        monto_recibido_actual = 0;
                    }

                    if (monto_recibido_actual > 0 && monto_interes_a_pagar <= monto_recibido_actual) {
                        monto_interes_a_amortizar = monto_interes_a_pagar;
                        monto_recibido_actual -= monto_interes_a_pagar;
                    } else if (monto_recibido_actual > 0 && monto_interes_a_pagar > monto_recibido_actual) {
                        monto_interes_a_amortizar = monto_recibido_actual;
                        monto_recibido_actual = 0;
                    }

                    if (monto_recibido_actual > 0 && monto_amortizacion_capital_a_pagar <= monto_recibido_actual) {
                        monto_amortizacion_capital_a_amortizar = monto_amortizacion_capital_a_pagar;
                        monto_recibido_actual -= monto_amortizacion_capital_a_pagar;
                    } else if (monto_recibido_actual > 0 && monto_amortizacion_capital_a_pagar > monto_recibido_actual) {
                        monto_amortizacion_capital_a_amortizar = monto_recibido_actual;
                        monto_recibido_actual = 0;
                    }

                    if (monto_recibido_actual > 0 && monto_ahorro_programado_a_pagar <= monto_recibido_actual) {
                        monto_ahorro_programado_a_amortizar = monto_ahorro_programado_a_pagar;
                        monto_recibido_actual -= monto_ahorro_programado_a_pagar;
                    } else if (monto_recibido_actual > 0 && monto_ahorro_programado_a_pagar > monto_recibido_actual) {
                        monto_ahorro_programado_a_amortizar = monto_recibido_actual;
                        monto_recibido_actual = 0;
                    }

                    if (monto_recibido_actual > 0 && monto_ahorro_inicial_a_pagar <= monto_recibido_actual) {
                        monto_ahorro_inicial_a_amortizar = monto_ahorro_inicial_a_pagar;
                        monto_recibido_actual -= monto_ahorro_inicial_a_pagar;
                    } else if (monto_recibido_actual > 0 && monto_ahorro_inicial_a_pagar > monto_recibido_actual) {
                        monto_ahorro_inicial_a_amortizar = monto_recibido_actual;
                        monto_recibido_actual = 0;
                    }

                    if (monto_recibido_actual > 0 && monto_gasto_a_pagar <= monto_recibido_actual) {
                        monto_gasto_a_amortizar = monto_gasto_a_pagar;
                        monto_recibido_actual -= monto_gasto_a_pagar;
                    } else if (monto_recibido_actual > 0 && monto_gasto_a_pagar > monto_recibido_actual) {
                        monto_gasto_a_amortizar = monto_recibido_actual;
                        monto_recibido_actual = 0;
                    }

                    cuota.pagos.push({
                        recibo: {
                            local_atencion: recibo.local_atencion,
                            serie: recibo.serie,
                            numero: recibo.numero,
                            fecha: recibo.fecha,
                        },
                        ingresos: {
                            monto_gasto: monto_gasto_a_amortizar,
                            monto_amortizacion_capital: monto_amortizacion_capital_a_amortizar,
                            monto_interes: monto_interes_a_amortizar,
                            monto_mora: monto_mora_a_amortizar
                        },
                        ahorros: {
                            monto_ahorro_inicial: monto_ahorro_inicial_a_amortizar,
                            monto_ahorro_voluntario: monto_ahorro_voluntario_a_amortizar,
                            monto_ahorro_programado: monto_ahorro_programado_a_amortizar
                        }
                    });

                    modelo.detalle.push({
                        producto: {
                            operacion_financiera_detalle: cuota.id,
                            numero_cuota: cuota.numero_cuota,
                            monto_gasto: monto_gasto_a_amortizar,
                            monto_ahorro_inicial: monto_ahorro_inicial_a_amortizar,
                            // monto_retiro_ahorro_inicial: cuota.monto_retiro_ahorro_inicial,
                            monto_ahorro_voluntario: monto_ahorro_voluntario_a_amortizar,
                            // monto_retiro_ahorro_voluntario: cuota.monto_retiro_ahorro_voluntario,
                            monto_ahorro_programado: monto_ahorro_programado_a_amortizar,
                            // monto_retiro_ahorro_programado: cuota.monto_retiro_ahorro_programado,
                            monto_amortizacion_capital: monto_amortizacion_capital_a_amortizar,
                            monto_interes: monto_interes_a_amortizar,
                            // monto_interes_ganado: cuota.monto_interes_ganado,
                            // monto_retiro_interes_ganado: cuota.monto_retiro_interes_ganado,
                            monto_mora: monto_mora_a_amortizar
                        }
                    });

                    monto_total += monto_gasto_a_amortizar + monto_ahorro_inicial_a_amortizar +
                        // monto_ahorro_voluntario_a_amortizar + monto_total_cuota +
                        monto_ahorro_voluntario_a_amortizar + monto_ahorro_programado_a_amortizar +
                        monto_amortizacion_capital_a_amortizar + monto_interes_a_amortizar +
                        monto_mora_a_amortizar; // + parseInt(monto_ahorro_voluntario);

                    monto_total_gasto += monto_gasto_a_amortizar;
                    monto_total_ahorro_inicial += monto_ahorro_inicial_a_amortizar;
                    monto_total_ahorro_voluntario += monto_ahorro_voluntario_a_amortizar;
                    monto_total_ahorro_programado += monto_ahorro_programado_a_amortizar;
                    monto_total_amortizacion_capital += monto_amortizacion_capital_a_amortizar;
                    monto_total_interes += monto_interes_a_amortizar;
                    monto_total_mora += monto_mora_a_amortizar;
                }
            }

            await cuota.save();
        }

        modelo.es_ingreso = true;

        modelo.diario = {
            caja_diario: resultado_validacion.caja_diario,
            caja: resultado_validacion.caja,
            estado: 'Abierto'
        };

        modelo.recibo = {
            estado: 'Vigente',
            local_atencion: recibo.local_atencion,
            serie: recibo.serie,
            numero: recibo.numero,
            fecha: recibo.fecha,
            ejercicio: '2020',
            monto_total: monto_total.toFixed(1)
        };

        modelo.producto = {
            persona: id_socio,
            operacion_financiera: operacion_financiera,
            monto_gasto: monto_total_gasto,
            monto_ahorro_inicial: monto_total_ahorro_inicial,
            monto_ahorro_voluntario: monto_total_ahorro_voluntario,
            monto_ahorro_programado: monto_total_ahorro_programado,
            monto_amortizacion_capital: monto_total_amortizacion_capital,
            monto_interes: monto_total_interes,
            monto_mora: monto_total_mora
        };

        await modelo.save();

        const cuotas_pendientes = await OperacionFinancieraDetalle.findOne({ "operacion_financiera": operacion_financiera, "estado": "Pendiente", "es_borrado": false });

        const model_operacion_financiera = await OperacionFinanciera.findById({ "_id": operacion_financiera })
            .populate({
                path: "producto.tipo",
                select: "descripcion",
            })
            .populate({
                path: "analista",
                select: "usuario",
                populate: {
                    path: "usuario",
                    select: "persona",
                    populate: {
                        path: "persona",
                        select: "nombre apellido_paterno apellido_materno",
                    }
                }
            });

        if (!cuotas_pendientes) {
            model_operacion_financiera.estado = 'Pagado';
            await model_operacion_financiera.save();
        }

        const data_recibo = {

            institucion: {
                denominacion: 'Buenavista La Bolsa S.A.C.',
                agencia: 'Agencia Ayacucho',
                ruc: '20574744599',
                frase: ''
            },
            persona: {
                documento_identidad: documento_identidad_socio,
                nombre_completo: nombres_apellidos_socio
            },
            analista: model_operacion_financiera.analista.usuario.persona.nombre +
                ' ' + model_operacion_financiera.analista.usuario.persona.apellido_paterno +
                ' ' + model_operacion_financiera.analista.usuario.persona.apellido_materno,

            producto: {
                descripcion: model_operacion_financiera.producto.tipo.descripcion,
                cuota: 1,
                monto_gasto: monto_total_gasto.toFixed(2),
                monto_ahorro_inicial: monto_total_ahorro_inicial.toFixed(2),
                monto_ahorro_voluntario: monto_total_ahorro_voluntario.toFixed(2),
                monto_ahorro_programado: monto_total_ahorro_programado.toFixed(2),
                monto_amortizacion_capital: monto_total_amortizacion_capital.toFixed(2),
                monto_interes: monto_total_interes.toFixed(2),
                monto_mora: monto_total_mora.toFixed(2),
            },
            recibo: {
                usuario: req.header('usuario_sesion'),
                numero: recibo.numero,
                fecha: recibo.fecha,
                tipo_impresion: 'Original',
                monto_total: monto_total.toFixed(2)
            }
        };
        // const data_recibo = {
        //     agencia: 'Agencia Ayacucho',
        //     numero: recibo.numero,
        //     documento_identidad_socio: documento_identidad_socio,
        //     nombres_apellidos_socio: nombres_apellidos_socio,
        //     nombres_apellidos_analista: model_operacion_financiera.analista.usuario.persona.nombre +
        //         ' ' + model_operacion_financiera.analista.usuario.persona.apellido_paterno +
        //         ' ' + model_operacion_financiera.analista.usuario.persona.apellido_materno,
        //     producto: model_operacion_financiera.producto.tipo.descripcion,
        //     monto_total_amortizacion_capital: monto_total_amortizacion_capital,
        //     monto_total_interes: monto_total_interes,
        //     monto_total_ahorro_programado: monto_total_ahorro_programado,
        //     monto_total_ahorro_voluntario: monto_total_ahorro_voluntario,
        //     monto_total_mora: monto_total_mora,
        //     monto_total_ahorro_inicial: monto_total_ahorro_inicial,
        //     monto_total_gasto: monto_total_gasto,
        //     monto_total: monto_total,
        //     usuario: req.header('usuario_sesion'),
        //     fecha: recibo.fecha,
        //     impresion: 'Original'
        // };

        res.json({
            ok: true,
            recibo: data_recibo
                // recibo: getRecibo(data_recibo)
        })
    } catch (error) {

        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado.'
        });
    }
}

const registrarIngresoEgreso = async(req, res = response) => {
    // const id_usuario_sesion = "5f48329023ab991c688ccca8"; //req.header("id_usuario_sesion");
    const id_usuario_sesion = req.header("id_usuario_sesion");
    // const ip = "192.168.1.31"; //requestIp.getClientIp(req).replace("::ffff:", "");
    const ip = requestIp.getClientIp(req).replace("::ffff:", "");
    const { es_ingreso } = req.body;
    try {
        const data_validacion = {
            ip: ip,
            id_usuario_sesion: id_usuario_sesion,
            es_ingreso,
            // caja: caja.id
        };

        const resultado_validacion = await validarPago(data_validacion);

        if (!resultado_validacion.ok)
            return res.status(404).json(resultado_validacion);
        // return resultado_validacion;

        // console.log(resultado_validacion)

        const recibo = resultado_validacion.recibo;

        const modelo = new PagoOperacionFinanciera(req.body);
        modelo.diario = {
            caja_diario: resultado_validacion.caja_diario,
            // caja_diario: caja_diario.id,
            caja: resultado_validacion.caja,
            // caja: caja.id,
            estado: "Abierto",
        };
        modelo.es_ingreso = req.body.es_ingreso;

        modelo.recibo = {
            estado: "Vigente",
            serie: recibo.serie,
            numero: recibo.numero,
            fecha: recibo.fecha,
            ejercicio: "2020",
            monto_total: req.body.monto,
        };

        await modelo.save();
        /* console.log(req.body)
        console.log(modelo); */
        const responsable = await Usuario.findById(
            modelo.concepto.responsable,
            "id persona"
        ).populate(
            "persona",
            "nombre apellido_paterno apellido_materno documento_identidad"
        );
        const documento_identidad_responsable =
            responsable.persona.documento_identidad;
        const nombres_apellidos_responsable =
            responsable.persona.nombre +
            ", " +
            responsable.persona.apellido_paterno +
            " " +
            responsable.persona.apellido_materno;
        const id = req.body.concepto.concepto;
        const concepto = await PagoConcepto.findById(id);
        console.log(concepto);
        const data_recibo = {
            agencia: "Agencia Ayacucho",
            numero: recibo.numero,
            documento_identidad_responsable: documento_identidad_responsable,
            nombres_apellidos_responsable: nombres_apellidos_responsable,
            concepto: concepto.descripcion,
            monto_total: req.body.monto,
            usuario: req.header("usuario_sesion"),
            fecha: recibo.fecha,
            impresion: "Original",
        };
        return res.json({
            ok: true,
            recibo: getRecibo(data_recibo),
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: error.msg,
        });
    }
};

const anular_recibo = async(req, res = response) => {

    const id = req.params.id;
    const now = dayjs();
    const {
        comentario
    } = req.body;

    try {

        // console.log(id)
        // console.log(comentario)

        const modelo = await PagoOperacionFinanciera.findById(id);


        if (modelo.diario.estado == 'Cerrado')
            return res.status(404).json({
                ok: false,
                msg: 'El recibo no puede ser anulado por que caja diario ya fue cerrado.'
            })

        modelo.recibo.estado = 'Anulado';
        // modelo.comentario.push();

        modelo.comentario.push({
            tipo: 'Editado',
            id_usuario: req.header('id_usuario_sesion'),
            usuario: req.header('usuario_sesion'),
            nombre: req.header('nombre_sesion'),
            fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
            comentario: comentario
        });

        modelo.save();

        // console.log(modelo)
        // console.log(modelo.detalle.length)

        // const modelo = new PagoOperacionFinanciera(req.body);

        for (let i = 0; i < modelo.detalle.length; i++) {

            const cuota = await OperacionFinancieraDetalle.findById(modelo.detalle[i].producto.operacion_financiera_detalle);

            // console.log(cuota);

            for (let j = 0; j < cuota.pagos.length; j++) {

                if (cuota.pagos[j].recibo.serie === modelo.recibo.serie &&
                    cuota.pagos[j].recibo.numero === modelo.recibo.numero) {

                    cuota.pagos[j].es_vigente = false;
                    // await cuota.save();
                }
            }

            await cuota.save();
        }

        //TODO: anular recibo desembolso

        return res.json({
            ok: true,
            // recibo: 'Anulación satisfactoriamente.',
            msg: 'Se anuló el recibo satisfactoriamente.'
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: error.msg,
        });
    }
}

const pagar_operacion_financiera_por_analista = async(req, res = response) => {

    // const operaion_financiera = req.params.id;
    const now = dayjs();
    const {
        lista
    } = req.body;

    try {

        // for (let i = 0; i < lista.length; i++) {

        //     const operacion_financiera = await OperacionFinanciera.findById(lista[i].id);
        //     const cuotas = await OperacionFinancieraDetalle.find({ 'operacion_financiera': operacion_financiera.id });


        // }

        console.log(lista)

        return res.json({
            ok: true,
            // recibo: 'Anulación satisfactoriamente.',
            msg: 'Se registró satisfactoriamente.'
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: error.msg,
        });
    }
}

module.exports = {

    listar,
    listar_operaciones_financieras_detalle_vigentes,
    pagar_operacion_financiera,
    registrarIngresoEgreso,
    desembolsar_operacion_financiera,
    anular_recibo,
    pagar_operacion_financiera_por_analista
};