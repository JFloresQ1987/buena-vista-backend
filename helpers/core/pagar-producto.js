const ObjectId = require('mongoose').Types.ObjectId;
const Caja = require("../../models/core/seguridad/caja.model");
const CajaDiario = require("../../models/core/caja/caja-diario.model");
const OperacionFinanciera = require("../../models/core/registro/operacion-financiera.model");
const PagoOperacionFinanciera = require("../../models/core/caja/operacion-financiera-pago.model");
const OperacionFinancieraDetalle = require("../../models/core/registro/operacion-financiera-detalle.model");
const Producto = require("../../models/core/configuracion/producto.model");
const Persona = require("../../models/core/registro/persona.model");
const Analista = require("../../models/core/seguridad/analista.model");
const dayjs = require("dayjs");

const pagarProducto = async(data) => {

    const recibo = data.data_validacion.recibo;
    const now = dayjs();

    let monto_recibido_actual = Number(data.monto_recibido);
    let monto_ahorro_voluntario_actual = Number(data.monto_ahorro_voluntario);
    let monto_total = 0;
    let monto_total_gasto = 0;
    let monto_total_ahorro_inicial = 0;
    let monto_total_ahorro_voluntario = 0;
    let monto_total_ahorro_programado = 0;
    let monto_total_amortizacion_capital = 0;
    let monto_total_interes = 0;
    let monto_total_mora = 0;

    // const modelo = new PagoOperacionFinanciera(data.modelo_pago_operacion_financiera);

    // modelo.comentario.push({
    //     tipo: 'Nuevo',
    //     id_usuario: req.header('id_usuario_sesion'),
    //     usuario: req.header('usuario_sesion'),
    //     nombre: req.header('nombre_sesion'),
    //     fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
    //     comentario: 'Se realizó desembolso'
    // });    

    const modelo = new PagoOperacionFinanciera();

    // modelo.comentario.push(data.comentario);

    let cuota_menor = 0;
    let cuota_mayor = 0;

    for (let i = 0; i < data.cuotas.length; i++) {

        const cuota = await OperacionFinancieraDetalle.findById({ "_id": data.cuotas[i] })

        if (i == 0)
            cuota_menor = cuota.numero_cuota

        if (i == data.cuotas.length - 1)
            cuota_mayor = cuota.numero_cuota

        // if (cuota.numero_cuota === 0)
        //     await OperacionFinancieraDetalle.updateMany({
        //         "operacion_financiera": data.operacion_financiera,
        //         "estado": "Prependiente",
        //         "es_borrado": false
        //     }, { "estado": "Pendiente" });

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

            if (cuota.pagos[i].es_vigente) {

                monto_gasto_pagado += cuota.pagos[i].ingresos.monto_gasto || 0;
                monto_ahorro_inicial_pagado += cuota.pagos[i].ahorros.monto_ahorro_inicial || 0;
                monto_ahorro_voluntario_pagado += cuota.pagos[i].ahorros.monto_ahorro_voluntario || 0;
                monto_ahorro_programado_pagado += cuota.pagos[i].ahorros.monto_ahorro_programado || 0;
                monto_amortizacion_capital_pagado += cuota.pagos[i].ingresos.monto_amortizacion_capital || 0;
                monto_interes_pagado += cuota.pagos[i].ingresos.monto_interes || 0;
                monto_mora_pagado += cuota.pagos[i].ingresos.monto_mora || 0;
            }
        }

        let monto_gasto_a_pagar = cuota.ingresos.monto_gasto - monto_gasto_pagado;
        let monto_ahorro_inicial_a_pagar = cuota.ahorros.monto_ahorro_inicial - monto_ahorro_inicial_pagado;
        let monto_ahorro_voluntario_a_pagar = Number(monto_ahorro_voluntario_actual); //cuota.monto_ahorro_voluntario - monto_ahorro_voluntario_pagado;
        let monto_ahorro_programado_a_pagar = cuota.ahorros.monto_ahorro_programado - monto_ahorro_programado_pagado;
        let monto_amortizacion_capital_a_pagar = cuota.ingresos.monto_amortizacion_capital - monto_amortizacion_capital_pagado;
        let monto_interes_a_pagar = cuota.ingresos.monto_interes - monto_interes_pagado;
        let monto_mora_a_pagar = cuota.ingresos.monto_mora - monto_mora_pagado;

        const monto_total_cuota_a_pagar = Number((monto_gasto_a_pagar +
            monto_ahorro_inicial_a_pagar +
            monto_ahorro_voluntario_a_pagar +
            monto_ahorro_programado_a_pagar +
            monto_amortizacion_capital_a_pagar +
            monto_interes_a_pagar +
            monto_mora_a_pagar).toFixed(2));

        // const monto_total_cuota_a_pagar = monto_gasto_a_pagar +
        //     monto_ahorro_inicial_a_pagar +
        //     monto_ahorro_voluntario_a_pagar +
        //     monto_ahorro_programado_a_pagar +
        //     monto_amortizacion_capital_a_pagar +
        //     monto_interes_a_pagar +
        //     monto_mora_a_pagar

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

            cuota.estado = 'Amortizado';
            let monto_cuota_a_pagar = monto_ahorro_voluntario_a_pagar + monto_mora_a_pagar +
                monto_interes_a_pagar + monto_amortizacion_capital_a_pagar +
                monto_ahorro_programado_a_pagar + monto_ahorro_inicial_a_pagar +
                monto_gasto_a_pagar;
            let monto_cuota_a_amortizar = 0;

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

                monto_cuota_a_amortizar = monto_gasto_a_amortizar + monto_ahorro_inicial_a_amortizar +
                    // monto_ahorro_voluntario_a_amortizar + monto_total_cuota +
                    monto_ahorro_voluntario_a_amortizar + monto_ahorro_programado_a_amortizar +
                    monto_amortizacion_capital_a_amortizar + monto_interes_a_amortizar +
                    monto_mora_a_amortizar;

                // monto_total += monto_gasto_a_amortizar + monto_ahorro_inicial_a_amortizar +
                //     // monto_ahorro_voluntario_a_amortizar + monto_total_cuota +
                //     monto_ahorro_voluntario_a_amortizar + monto_ahorro_programado_a_amortizar +
                //     monto_amortizacion_capital_a_amortizar + monto_interes_a_amortizar +
                //     monto_mora_a_amortizar; // + parseInt(monto_ahorro_voluntario);
                monto_total += monto_cuota_a_amortizar;

                monto_total_gasto += monto_gasto_a_amortizar;
                monto_total_ahorro_inicial += monto_ahorro_inicial_a_amortizar;
                monto_total_ahorro_voluntario += monto_ahorro_voluntario_a_amortizar;
                monto_total_ahorro_programado += monto_ahorro_programado_a_amortizar;
                monto_total_amortizacion_capital += monto_amortizacion_capital_a_amortizar;
                monto_total_interes += monto_interes_a_amortizar;
                monto_total_mora += monto_mora_a_amortizar;
            } else {

                break;
            }

            //const ultima_cuota_pendiente = await OperacionFinancieraDetalle.findOne({ "operacion_financiera": data.operacion_financiera, "estado": { $in: ["Pendiente", "Amortizado"] }, "es_vigente": true, "es_borrado": false });

            // const ultima_cuota_pendiente = await OperacionFinancieraDetalle.aggregate(
            //     [{
            //             $match: {
            //                 "operacion_financiera": new ObjectId(data.operacion_financiera),
            //                 // "estado": { $in: ["Pendiente", "Amortizado"] },
            //                 "es_vigente": true,
            //                 "es_borrado": false
            //             }
            //         },
            //         {
            //             $group: {
            //                 _id: "$operacion_financiera",
            //                 //maxTotalAmount: { $max: { $multiply: [ "$price", "$quantity" ] } },
            //                 cuota: { $max: "$numero_cuota" }
            //             }
            //         }
            //     ]
            // )

            // const monto_pendiente_residuo = (monto_gasto_a_pagar + monto_ahorro_inicial_a_pagar +
            //     monto_ahorro_voluntario_a_pagar + monto_ahorro_programado_a_pagar +
            //     monto_amortizacion_capital_a_pagar + monto_interes_a_pagar +
            //     monto_mora_a_pagar) - monto_total;

            const monto_pendiente_residuo = monto_cuota_a_pagar - monto_cuota_a_amortizar;

            if (Number(monto_pendiente_residuo.toFixed(2)) == 0) cuota.estado = 'Pagado';

            // if (ultima_cuota_pendiente[0].cuota == cuota.numero_cuota && monto_pendiente_residuo.toFixed(2) == 0) cuota.estado = 'Pagado';
        }

        if (cuota.numero_cuota === 0 && cuota.estado === 'Pagado')
            await OperacionFinancieraDetalle.updateMany({
                "operacion_financiera": data.operacion_financiera,
                "estado": "Prependiente",
                "es_borrado": false
            }, { "estado": "Pendiente" });

        await cuota.save();
    }

    const model_operacion_financiera = await OperacionFinanciera.findById({ "_id": data.operacion_financiera })
        .populate({
            path: "producto.tipo",
            select: "codigo descripcion",
        })
        .populate({
            path: "persona",
            select: "nombre apellido_paterno apellido_materno documento_identidad",
        })
        .populate({
            path: "analista",
            select: "usuario nombre_usuario documento_identidad_usuario"
                /*,
                            populate: {
                                path: "usuario",
                                select: "persona",
                                populate: {
                                    path: "persona",
                                    select: "nombre apellido_paterno apellido_materno",
                                }
                            }*/
        });

    // const producto = await Producto.findById(model_operacion_financiera.producto.tipo);
    // const persona = await Persona.findById(model_operacion_financiera.persona);
    // const analista = await Analista.findById(model_operacion_financiera.analista);

    modelo.es_ingreso = true;

    modelo.diario = {
        caja_diario: data.data_validacion.caja_diario,
        caja: data.data_validacion.caja,
        cajero: data.data_validacion.cajero, //TODO verificar
        estado: 'Abierto'
    };

    modelo.recibo = {
        estado: data.es_masivo ? 'Previgente' : 'Vigente',
        local_atencion: recibo.local_atencion,
        documento_identidad_cajero: data.data_validacion.documento_identidad_cajero, //TODO verificar
        serie: recibo.serie,
        numero: recibo.numero,
        fecha: recibo.fecha,
        ejercicio: now.format('YYYY'),
        monto_total: monto_total.toFixed(1),
        frase: '' //TODO verificar
    };

    modelo.producto = {
        producto: model_operacion_financiera.producto.tipo, //TODO verificar
        codigo: model_operacion_financiera.producto.codigo, //TODO verificar
        descripcion: model_operacion_financiera.producto.descripcion, //TODO verificar
        codigo_programacion: model_operacion_financiera.producto.codigo_programacion, //TODO verificar
        descripcion_programacion: model_operacion_financiera.producto.programacion, //TODO verificar
        persona: model_operacion_financiera.persona._id,
        nombre_persona: model_operacion_financiera.persona.apellido_paterno +
            ' ' + model_operacion_financiera.persona.apellido_materno +
            ', ' + model_operacion_financiera.persona.nombre, //TODO verificar            
        documento_identidad_persona: model_operacion_financiera.persona.documento_identidad, //TODO verificar
        analista: model_operacion_financiera.analista._id, //TODO verificar
        nombre_analista: model_operacion_financiera.analista.nombre_usuario, //TODO verificar
        documento_identidad_analista: model_operacion_financiera.analista.documento_identidad_usuario,
        operacion_financiera: data.operacion_financiera,
        // es_desembolso: false,
        monto_gasto: monto_total_gasto,
        monto_ahorro_inicial: monto_total_ahorro_inicial,
        monto_ahorro_voluntario: monto_total_ahorro_voluntario,
        monto_ahorro_programado: monto_total_ahorro_programado,
        monto_amortizacion_capital: monto_total_amortizacion_capital,
        monto_interes: monto_total_interes,
        monto_mora: monto_total_mora
    };

    modelo.comentario.push(data.comentario);

    await modelo.save();

    const cuotas_pendientes = await OperacionFinancieraDetalle.findOne({ "operacion_financiera": data.operacion_financiera, "estado": { $in: ["Pendiente", "Amortizado"] }, "es_vigente": true, "es_borrado": false });

    // const model_operacion_financiera = await OperacionFinanciera.findById({ "_id": data.operacion_financiera })
    //     .populate({
    //         path: "producto.tipo",
    //         select: "descripcion",
    //     })
    //     .populate({
    //         path: "analista",
    //         select: "usuario",
    //         populate: {
    //             path: "usuario",
    //             select: "persona",
    //             populate: {
    //                 path: "persona",
    //                 select: "nombre apellido_paterno apellido_materno",
    //             }
    //         }
    //     });

    if (!cuotas_pendientes) {
        model_operacion_financiera.estado = 'Pagado';
        await model_operacion_financiera.save();
    }

    return {
        ok: true,
        model_operacion_financiera: model_operacion_financiera,
        cuota_menor: cuota_menor,
        cuota_mayor: cuota_mayor,
        monto_total_gasto: monto_total_gasto,
        monto_total_ahorro_inicial: monto_total_ahorro_inicial,
        monto_total_ahorro_voluntario: monto_total_ahorro_voluntario,
        monto_total_ahorro_programado: monto_total_ahorro_programado,
        monto_total_amortizacion_capital: monto_total_amortizacion_capital,
        monto_total_interes: monto_total_interes,
        monto_total_mora: monto_total_mora,
        monto_total: monto_total
    };
};

module.exports = {
    pagarProducto,
};