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

                monto_gasto_pagado += lista[i].pagos[j].ingresos.monto_gasto || 0;
                monto_ahorro_inicial_pagado += lista[i].pagos[j].ahorros.monto_ahorro_inicial || 0;
                monto_ahorro_voluntario_pagado += lista[i].pagos[j].ahorros.monto_ahorro_voluntario || 0;
                monto_ahorro_programado_pagado += lista[i].pagos[j].ahorros.monto_ahorro_programado || 0;
                monto_amortizacion_capital_pagado += lista[i].pagos[j].ingresos.monto_amortizacion_capital || 0;
                monto_interes_pagado += lista[i].pagos[j].ingresos.monto_interes || 0;
                monto_mora_pagado += lista[i].pagos[j].ingresos.monto_mora || 0;
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

const desembolsar_operacion_financiera = async(req, res) => {

    const id = req.params.id;
    const now = dayjs();

    try {

        const modelo = await OperacionFinanciera.findById(id);
        modelo.se_desembolso_prestamo = true;

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
        res.json({
            ok: true,
            msg: "Desembolso realizado satisfactoriamente.",
        });

    } catch (error) {

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
    // const id_operacion_financiera = req.params.id_operacion_financiera;

    try {

        const data_validacion = {
            ip: ip,
            id_usuario_sesion: id_usuario_sesion,
            // caja: caja.id
        };

        const resultado_validacion = await validarPago(data_validacion);

        if (!resultado_validacion.ok)
            return res.status(404).json(resultado_validacion)
                // return resultado_validacion;

        const dato_recibo = resultado_validacion.dato_recibo;

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

            // monto_total_cuota += cuota.monto_ahorro_programado +
            //     Math.ceil((cuota.monto_amortizacion_capital + cuota.monto_interes) * 10) / 10;

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

            // monto_total_cuota += monto_ahorro_programado_a_pagar +
            //     Math.ceil((monto_amortizacion_capital_a_pagar + monto_interes_a_pagar) * 10) / 10;

            const monto_total_cuota_a_pagar = monto_gasto_a_pagar +
                monto_ahorro_inicial_a_pagar +
                monto_ahorro_voluntario_a_pagar +
                monto_ahorro_programado_a_pagar +
                monto_amortizacion_capital_a_pagar +
                monto_interes_a_pagar +
                monto_mora_a_pagar

            if (monto_total_cuota_a_pagar <= monto_recibido_actual) {

                // //console.log(monto_recibido_actual)

                cuota.estado = 'Pagado';

                console.log(dato_recibo)

                cuota.pagos.push({
                    recibo: {
                        serie_recibo: dato_recibo.serie_recibo,
                        numero_recibo: dato_recibo.numero_recibo,
                        fecha_recibo: dato_recibo.fecha_recibo
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

                // //console.log('entrooo 1')
                // //console.log(modelo)

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

                // monto_total_cuota += cuota.monto_ahorro_programado +
                //     Math.ceil((cuota.monto_amortizacion_capital + cuota.monto_interes) * 10) / 10;

                // monto_total_cuota = monto_ahorro_programado_a_pagar +
                //     monto_amortizacion_capital_a_pagar +
                //     monto_interes_a_pagar;
                // Math.ceil((monto_amortizacion_capital_a_pagar + monto_interes_a_pagar) * 10) / 10;
                // monto_total_cuota += monto_ahorro_programado_a_pagar +
                //     Math.ceil((monto_amortizacion_capital_a_pagar + monto_interes_a_pagar) * 10) / 10;

                monto_total += monto_gasto_a_pagar + monto_ahorro_inicial_a_pagar +
                    // monto_ahorro_voluntario_a_pagar + monto_total_cuota +
                    monto_ahorro_voluntario_a_pagar + monto_ahorro_programado_a_pagar +
                    monto_amortizacion_capital_a_pagar + monto_interes_a_pagar +
                    monto_mora_a_pagar; // + parseInt(monto_ahorro_voluntario);

                // //console.log(monto_total)

                monto_total_gasto += monto_gasto_a_pagar;
                monto_total_ahorro_inicial += monto_ahorro_inicial_a_pagar;
                monto_total_ahorro_voluntario += monto_ahorro_voluntario_a_pagar;
                monto_total_ahorro_programado += monto_ahorro_programado_a_pagar;
                monto_total_amortizacion_capital += monto_amortizacion_capital_a_pagar;
                monto_total_interes += monto_interes_a_pagar;
                monto_total_mora += monto_mora_a_pagar;

            } else {

                if (monto_recibido_actual >= 0.1) {

                    // //console.log(monto_recibido_actual)

                    // cuota.estado = 'Amortizado';

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
                            serie_recibo: dato_recibo.serie_recibo,
                            numero_recibo: dato_recibo.numero_recibo,
                            fecha_recibo: dato_recibo.fecha_recibo,
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

                    // //console.log('entrooo 2')
                    // //console.log(modelo)

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
            // caja_diario: caja_diario.id,
            caja: resultado_validacion.caja,
            // caja: caja.id,
            estado: 'Abierto'
        };

        modelo.recibo = {
            estado: 'Vigente',
            serie: dato_recibo.serie_recibo,
            numero: dato_recibo.numero_recibo,
            fecha: dato_recibo.fecha_recibo,
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

        console.log(model_operacion_financiera)
            // console.log(cuotas_pendientes)

        if (!cuotas_pendientes) {
            // if (cuotas_pendientes.length === 0) {

            // const model_operacion_financiera = await OperacionFinanciera.findById({ "_id": operacion_financiera });
            model_operacion_financiera.estado = 'Pagado';
            await model_operacion_financiera.save();
        }

        const data_recibo = {
            agencia: 'Agencia Ayacucho',
            numero_recibo: dato_recibo.numero_recibo,
            documento_identidad_socio: documento_identidad_socio,
            nombres_apellidos_socio: nombres_apellidos_socio,
            nombres_apellidos_analista: model_operacion_financiera.analista.usuario.persona.nombre +
                ' ' + model_operacion_financiera.analista.usuario.persona.apellido_paterno +
                ' ' + model_operacion_financiera.analista.usuario.persona.apellido_materno,
            producto: model_operacion_financiera.producto.tipo.descripcion,
            monto_total_amortizacion_capital: monto_total_amortizacion_capital,
            monto_total_interes: monto_total_interes,
            monto_total_ahorro_programado: monto_total_ahorro_programado,
            monto_total_ahorro_voluntario: monto_total_ahorro_voluntario,
            monto_total_mora: monto_total_mora,
            monto_total_ahorro_inicial: monto_total_ahorro_inicial,
            monto_total_gasto: monto_total_gasto,
            monto_total: monto_total,
            usuario: req.header('usuario_sesion'),
            fecha_recibo: dato_recibo.fecha_recibo,
            impresion: 'Original'
        };

        res.json({
            ok: true,
            recibo: getRecibo(data_recibo)
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
    const id_usuario_sesion = "5f48329023ab991c688ccca8"; //req.header("id_usuario_sesion");
    const ip = "192.168.1.31"; //requestIp.getClientIp(req).replace("::ffff:", "");
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

        const dato_recibo = resultado_validacion.dato_recibo;

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
            serie: dato_recibo.serie_recibo,
            numero: dato_recibo.numero_recibo,
            fecha: dato_recibo.fecha_recibo,
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
            numero_recibo: dato_recibo.numero_recibo,
            documento_identidad_responsable: documento_identidad_responsable,
            nombres_apellidos_responsable: nombres_apellidos_responsable,
            concepto: concepto.descripcion,
            monto_total: req.body.monto,
            usuario: req.header("usuario_sesion"),
            fecha_recibo: dato_recibo.fecha_recibo,
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

module.exports = {

    listar_operaciones_financieras_detalle_vigentes,
    pagar_operacion_financiera,
    registrarIngresoEgreso,
    desembolsar_operacion_financiera
};