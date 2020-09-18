const { response } = require('express');
const logger = require('../../../helpers/logger');
const OperacionFinanciera = require('../../../models/core/registro/operacion-financiera.model');
const OperacionFinancieraDetalle = require('../../../models/core/registro/operacion-financiera-detalle.model');
const PagoOperacionFinanciera = require('../../../models/core/caja/operacion-financiera-pago.model');
const CajaDiario = require('../../../models/core/caja/caja-diario.model');
const dayjs = require('dayjs');

const listar_operaciones_financieras_detalle_vigentes = async(req, res) => {

    // const { id_operacion_financiera } = req.body;
    const id_operacion_financiera = req.params.id_operacion_financiera;

    try {

        const lista = await OperacionFinancieraDetalle.find({
                "operacion_financiera": id_operacion_financiera,
                // "estado": "Vigente",
                "estado": { $in: ["Vigente", "Pendiente", "Amortizado"] },
                "es_borrado": false
            })
            .sort({ "numero_cuota": 1 });

        for (let i = 0; i < lista.length; i++) {

            let monto_gasto_pagado = 0;
            let monto_ahorro_inicial_pagado = 0;
            let monto_ahorro_voluntario_pagado = 0;
            let monto_ahorro_programado_pagado = 0;
            let monto_amortizacion_capital_pagado = 0;
            let monto_interes_pagado = 0;
            let monto_mora_pagado = 0;

            for (let j = 0; j < lista[i].pagos.length; j++) {

                monto_gasto_pagado += lista[i].pagos[j].monto_gasto || 0;
                monto_ahorro_inicial_pagado += lista[i].pagos[j].monto_ahorro_inicial || 0;
                monto_ahorro_voluntario_pagado += lista[i].pagos[j].monto_ahorro_voluntario || 0;
                monto_ahorro_programado_pagado += lista[i].pagos[j].monto_ahorro_programado || 0;
                monto_amortizacion_capital_pagado += lista[i].pagos[j].monto_amortizacion_capital || 0;
                monto_interes_pagado += lista[i].pagos[j].monto_interes || 0;
                monto_mora_pagado += lista[i].pagos[j].monto_mora || 0;
            }

            lista[i].monto_gasto -= monto_gasto_pagado;
            lista[i].monto_ahorro_inicial -= monto_ahorro_inicial_pagado;
            lista[i].monto_ahorro_voluntario -= monto_ahorro_voluntario_pagado;
            lista[i].monto_ahorro_programado -= monto_ahorro_programado_pagado;
            lista[i].monto_amortizacion_capital -= monto_amortizacion_capital_pagado;
            lista[i].monto_interes -= monto_interes_pagado;
            lista[i].monto_mora -= monto_mora_pagado;
        }

        res.json({
            ok: true,
            lista
        })
    } catch (error) {

        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado.'
        });
    }
}

const pagar_operacion_financiera = async(req, res) => {

    // const { id_operacion_financiera } = req.body;
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

        // if (pEntidad.IdCajeroRegistro == 0)
        //         return new ReciboPagoResponseDC
        //         {
        //             Resultado = 0,
        //             Opcion = -1,
        //             Mensaje = "Usted no está habilitado para realizar caja."
        //         };



        // const lista = await OperacionFinancieraDetalle.find({ "operacion_financiera": id_operacion_financiera, "estado": "Vigente", "es_borrado": false })
        //     .sort({ "numero_cuota": 1 });

        // console.log(monto_ahorro_voluntario);
        // console.log(monto_recibido);
        // console.log(detalle);
        // console.log(lista_id_operacion_financiera_detalle);

        const modelo = new PagoOperacionFinanciera(req.body);
        const now = dayjs();
        const fecha_apertura = now.format('DD/MM/YYYY');

        const ultimo_caja_diario = await CajaDiario.findOne({ "es_vigente": true, "es_borrado": false })
            .where("fecha_apertura").ne(fecha_apertura)
            .sort({ $natural: -1 });

        // console.log(ultimo_caja_diario)

        if (ultimo_caja_diario) {
            // console.log('entroo')
            if (ultimo_caja_diario.estado === 'Abierto') {

                return res.status(404).json({
                    ok: false,
                    msg: 'Existe caja diario abierto, cierre antes de continuar.'
                })
            }
        }

        const caja_diario = await CajaDiario.findOne({ "fecha_apertura": fecha_apertura, "es_vigente": true, "es_borrado": false });

        // console.log(caja_diario)

        if (caja_diario) {
            if (caja_diario.estado === 'Cerrado') {

                return res.status(404).json({
                    ok: false,
                    msg: 'Caja diario ya se encuentra cerrado.'
                })
            }
        }

        // const caja_diario_actual

        if (!caja_diario) {

            // console.log('Entro a crear caja')

            // const ultimo_caja_diario = await CajaDiario.findOne({ "es_borrado": false })
            //     .sort({ $natural: -1 });

            // db.collectionName.findOne({}, {sort:{$natural:-1}})

            const apertura_caja_diario = new CajaDiario();

            // console.log(apertura_caja_diario.estado)

            apertura_caja_diario.estado = "Abierto";
            // console.log(apertura_caja_diario.estado)
            apertura_caja_diario.fecha_apertura = fecha_apertura;

            if (ultimo_caja_diario) {

                apertura_caja_diario.cantidad_diez_centimos_apertura = ultimo_caja_diario.cantidad_diez_centimos_cierre;
                apertura_caja_diario.cantidad_veinte_centimos_apertura = ultimo_caja_diario.cantidad_veinte_centimos_cierre;
                apertura_caja_diario.cantidad_cincuenta_centimos_apertura = ultimo_caja_diario.cantidad_cincuenta_centimos_cierre;
                apertura_caja_diario.cantidad_un_sol_apertura = ultimo_caja_diario.cantidad_un_sol_apertura;
                apertura_caja_diario.cantidad_cinco_soles_apertura = ultimo_caja_diario.cantidad_cinco_soles_cierre;
                apertura_caja_diario.cantidad_diez_soles_apertura = ultimo_caja_diario.cantidad_diez_soles_cierre;
                apertura_caja_diario.cantidad_veinte_soles_apertura = ultimo_caja_diario.cantidad_veinte_soles_cierre;
                apertura_caja_diario.cantidad_cincuenta_soles_apertura = ultimo_caja_diario.cantidad_cincuenta_soles_cierre;
                apertura_caja_diario.cantidad_dos_soles_apertura = ultimo_caja_diario.cantidad_dos_soles_cierre;
                apertura_caja_diario.cantidad_cien_soles_apertura = ultimo_caja_diario.cantidad_cien_soles_cierre;
                apertura_caja_diario.cantidad_discientos_soles_apertura = ultimo_caja_diario.cantidad_discientos_soles_cierre;
                apertura_caja_diario.monto_total_apertura = ultimo_caja_diario.monto_total_apertura + ultimo_caja_diario.monto_total_operaciones;
            }

            // apertura_caja_diario.caja_diario = 0;

            caja_diario = await apertura_caja_diario.save();
        }




        //Caja diario ya se encuentra cerrado.

        // modelo.comentario = [{
        //     tipo: 'Nuevo',
        //     usuario: req.header('id_usuario_sesion'),
        //     usuario: req.header('usuario_sesion'),
        //     nombre: req.header('nombre_sesion'),
        //     fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
        //     comentario
        // }];

        let monto_recibido_actual = monto_recibido;
        let monto_total = 0;
        let monto_total_gasto = 0;
        let monto_total_ahorro_inicial = 0;
        let monto_total_ahorro_voluntario = 0;
        let monto_total_ahorro_programado = 0;
        let monto_total_amortizacion_capital = 0;
        let monto_total_interes = 0;
        let monto_total_mora = 0;
        // let monto_total_cuota = 0;
        // let monto_total_cuota_pagada = 0;

        let dato_recibo = {
            serie_recibo: '001',
            numero_recibo: 'I-00000001',
            fecha_recibo: now.format('DD/MM/YYYY hh:mm:ss a')
        };

        const ultimo_pago = await PagoOperacionFinanciera.findOne({ "serie_recibo": '001', "es_borrado": false })
            // .where("fecha_apertura").ne(fecha_apertura)
            .sort({ $natural: -1 });

        let correlativo_recibo = 1;

        if (ultimo_pago) {

            // const str = 'sometext-20202';
            // const slug = str.split('-').pop();

            correlativo_recibo = parseInt(ultimo_pago.numero_recibo.split('-').pop()) + 1;
        }

        dato_recibo.numero_recibo = 'I-' + correlativo_recibo.toString().padStart(8, "00000000");

        // console.log(ultimo_pago);
        // console.log(correlativo_recibo);
        // console.log(dato_recibo.numero_recibo);

        for (let i = 0; i < cuotas.length; i++) {

            const cuota = await OperacionFinancieraDetalle.findById({ "_id": cuotas[i] })

            if (cuota.numero_cuota === 0)
                await OperacionFinancieraDetalle.updateMany({ "operacion_financiera": operacion_financiera, "estado": "Previgente", "es_borrado": false }, { "estado": "Vigente" });

            if (i === 0 && parseInt(monto_ahorro_voluntario) > 0)
                cuota.monto_ahorro_voluntario += parseInt(monto_ahorro_voluntario);

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

                monto_gasto_pagado += cuota.pagos[i].monto_gasto || 0;
                monto_ahorro_inicial_pagado += cuota.pagos[i].monto_ahorro_inicial || 0;
                monto_ahorro_voluntario_pagado += cuota.pagos[i].monto_ahorro_voluntario || 0;
                monto_ahorro_programado_pagado += cuota.pagos[i].monto_ahorro_programado || 0;
                monto_amortizacion_capital_pagado += cuota.pagos[i].monto_amortizacion_capital || 0;
                monto_interes_pagado += cuota.pagos[i].monto_interes || 0;
                monto_mora_pagado += cuota.pagos[i].monto_mora || 0;
            }

            // console.log(monto_gasto_pagado);
            // console.log(monto_ahorro_inicial_pagado);
            // console.log(monto_ahorro_voluntario_pagado);
            // console.log(monto_ahorro_programado_pagado);
            // console.log(monto_amortizacion_capital_pagado);
            // console.log(monto_interes_pagado);
            // console.log(monto_mora_pagado);

            let monto_gasto_a_pagar = cuota.monto_gasto - monto_gasto_pagado;
            let monto_ahorro_inicial_a_pagar = cuota.monto_ahorro_inicial - monto_ahorro_inicial_pagado;
            let monto_ahorro_voluntario_a_pagar = cuota.monto_ahorro_voluntario - monto_ahorro_voluntario_pagado;
            let monto_ahorro_programado_a_pagar = cuota.monto_ahorro_programado - monto_ahorro_programado_pagado;
            let monto_amortizacion_capital_a_pagar = cuota.monto_amortizacion_capital - monto_amortizacion_capital_pagado;
            let monto_interes_a_pagar = cuota.monto_interes - monto_interes_pagado;
            let monto_mora_a_pagar = cuota.monto_mora - monto_mora_pagado;

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

                // console.log(monto_recibido_actual)

                cuota.estado = 'Pagado';

                // console.log(monto_ahorro_voluntario_a_pagar)

                cuota.pagos.push({
                    serie_recibo: dato_recibo.serie_recibo,
                    numero_recibo: dato_recibo.numero_recibo,
                    fecha_recibo: dato_recibo.fecha_recibo,
                    monto_gasto: monto_gasto_a_pagar,
                    monto_ahorro_inicial: monto_ahorro_inicial_a_pagar,
                    monto_ahorro_voluntario: monto_ahorro_voluntario_a_pagar,
                    monto_ahorro_programado: monto_ahorro_programado_a_pagar,
                    monto_amortizacion_capital: monto_amortizacion_capital_a_pagar,
                    monto_interes: monto_interes_a_pagar,
                    monto_mora: monto_mora_a_pagar
                });

                monto_recibido_actual -= monto_total_cuota_a_pagar;

                modelo.detalle.push({
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

                // console.log(monto_total)

                monto_total_gasto += monto_gasto_a_pagar;
                monto_total_ahorro_inicial += monto_ahorro_inicial_a_pagar;
                monto_total_ahorro_voluntario += monto_ahorro_voluntario_a_pagar;
                monto_total_ahorro_programado += monto_ahorro_programado_a_pagar;
                monto_total_amortizacion_capital += monto_amortizacion_capital_a_pagar;
                monto_total_interes += monto_interes_a_pagar;
                monto_total_mora += monto_mora_a_pagar;

            } else {

                if (monto_recibido_actual >= 0.1) {

                    // console.log(monto_recibido_actual)

                    // cuota.estado = 'Amortizado';

                    let monto_gasto_a_amortizar = 0;
                    let monto_ahorro_inicial_a_amortizar = 0;
                    let monto_ahorro_voluntario_a_amortizar = 0;
                    let monto_ahorro_programado_a_amortizar = 0;
                    let monto_amortizacion_capital_a_amortizar = 0;
                    let monto_interes_a_amortizar = 0;
                    let monto_mora_a_amortizar = 0;

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

                    if (monto_recibido_actual > 0 && monto_ahorro_voluntario_a_pagar <= monto_recibido_actual) {
                        monto_ahorro_voluntario_a_amortizar = monto_ahorro_voluntario_a_pagar;
                        monto_recibido_actual -= monto_ahorro_voluntario_a_pagar;
                    } else if (monto_recibido_actual > 0 && monto_ahorro_voluntario_a_pagar > monto_recibido_actual) {
                        monto_ahorro_voluntario_a_amortizar = monto_recibido_actual;
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
                        serie_recibo: dato_recibo.serie_recibo,
                        numero_recibo: dato_recibo.numero_recibo,
                        fecha_recibo: dato_recibo.fecha_recibo,
                        monto_gasto: monto_gasto_a_amortizar,
                        monto_ahorro_inicial: monto_ahorro_inicial_a_amortizar,
                        monto_ahorro_voluntario: monto_ahorro_voluntario_a_amortizar,
                        monto_ahorro_programado: monto_ahorro_programado_a_amortizar,
                        monto_amortizacion_capital: monto_amortizacion_capital_a_amortizar,
                        monto_interes: monto_interes_a_amortizar,
                        monto_mora: monto_mora_a_amortizar
                    });

                    modelo.detalle.push({
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
                    });

                    // monto_total_cuota += cuota.monto_ahorro_programado +
                    //     Math.ceil((cuota.monto_amortizacion_capital + cuota.monto_interes) * 10) / 10;

                    // monto_total_cuota += monto_ahorro_programado_a_amortizar +
                    //     monto_amortizacion_capital_a_amortizar +
                    //     monto_interes_a_amortizar;

                    // monto_total_cuota = monto_total_cuota.toFixed(1)

                    // monto_total_cuota += monto_ahorro_programado_a_amortizar +
                    //     Math.ceil((monto_amortizacion_capital_a_amortizar + monto_interes_a_amortizar) * 10) / 10;

                    // console.log(monto_total);
                    // console.log(monto_ahorro_programado_a_amortizar);
                    // console.log(monto_amortizacion_capital_a_amortizar);
                    // console.log(monto_interes_a_amortizar);
                    // console.log(monto_total_cuota);

                    monto_total += monto_gasto_a_amortizar + monto_ahorro_inicial_a_amortizar +
                        // monto_ahorro_voluntario_a_amortizar + monto_total_cuota +
                        monto_ahorro_voluntario_a_amortizar + monto_ahorro_programado_a_amortizar +
                        monto_amortizacion_capital_a_amortizar + monto_interes_a_amortizar +
                        monto_mora_a_amortizar; // + parseInt(monto_ahorro_voluntario);

                    // console.log(monto_total)
                    // console.log(monto_gasto_a_amortizar)
                    // console.log(monto_ahorro_inicial_a_amortizar)
                    // console.log(monto_ahorro_voluntario_a_amortizar)
                    // console.log(monto_mora_a_amortizar)

                    // console.log(monto_total)


                    monto_total_gasto += monto_gasto_a_amortizar;
                    monto_total_ahorro_inicial += monto_ahorro_inicial_a_amortizar;
                    monto_total_ahorro_voluntario += monto_ahorro_voluntario_a_amortizar;
                    monto_total_ahorro_programado += monto_ahorro_programado_a_amortizar;
                    monto_total_amortizacion_capital += monto_amortizacion_capital_a_amortizar;
                    monto_total_interes += monto_interes_a_amortizar;
                    monto_total_mora += monto_mora_a_amortizar;
                }

            }

            // console.log(monto_total);

            // cuota.pagos.push(dato_recibo);
            // cuota.pagos.push({
            //     serie_recibo: dato_recibo.serie_recibo,
            //     numero_recibo: dato_recibo.numero_recibo,
            //     fecha_recibo: dato_recibo.fecha_recibo,
            //     monto_gasto: 0,
            //     monto_ahorro_inicial: 0,
            //     monto_ahorro_voluntario: 0,
            //     monto_ahorro_programado: 0,
            //     monto_amortizacion_capital: 0,
            //     monto_interes: 0,
            //     monto_mora: 0
            // });

            // if (i === 0)
            //     cuota.monto_ahorro_voluntario += parseInt(monto_ahorro_voluntario);

            await cuota.save();

            // const cuota = await OperacionFinancieraDetalle.findById({ "_id": cuotas[i] })

            // modelo.detalle.push({
            //     operacion_financiera_detalle: cuota.id,
            //     numero_cuota: cuota.numero_cuota,
            //     monto_gasto: cuota.monto_gasto,
            //     monto_ahorro_inicial: cuota.monto_ahorro_inicial,
            //     // monto_retiro_ahorro_inicial: cuota.monto_retiro_ahorro_inicial,
            //     monto_ahorro_voluntario: cuota.monto_ahorro_voluntario,
            //     // monto_retiro_ahorro_voluntario: cuota.monto_retiro_ahorro_voluntario,
            //     monto_ahorro_programado: cuota.monto_ahorro_programado,
            //     // monto_retiro_ahorro_programado: cuota.monto_retiro_ahorro_programado,
            //     monto_amortizacion_capital: cuota.monto_amortizacion_capital,
            //     monto_interes: cuota.monto_interes,
            //     monto_interes_ganado: cuota.monto_interes_ganado,
            //     // monto_retiro_interes_ganado: cuota.monto_retiro_interes_ganado,
            //     monto_mora: cuota.monto_mora
            // });

            // // monto_total_cuota += cuota.monto_ahorro_programado +
            // //     Math.ceil((cuota.monto_amortizacion_capital + cuota.monto_interes) * 10) / 10;

            // monto_total += cuota.monto_gasto + cuota.monto_ahorro_inicial +
            //     cuota.monto_ahorro_voluntario + monto_total_cuota +
            //     // cuota.monto_ahorro_voluntario + cuota.monto_ahorro_programado +
            //     // cuota.monto_amortizacion_capital + cuota.monto_interes +
            //     cuota.monto_mora; // + parseInt(monto_ahorro_voluntario);

            // // console.log(monto_total)

            // monto_total_gasto += cuota.monto_gasto;
            // monto_total_ahorro_inicial += cuota.monto_ahorro_inicial;
            // monto_total_ahorro_voluntario = cuota.monto_ahorro_voluntario;
            // monto_total_ahorro_programado += cuota.monto_ahorro_programado;
            // monto_total_amortizacion_capital += cuota.monto_amortizacion_capital;
            // monto_total_interes += cuota.monto_interes;
            // monto_total_mora += cuota.monto_mora;

            // if (i === 0)
            //     monto_total_ahorro_voluntario += parseInt(monto_ahorro_voluntario) + cuota.monto_ahorro_voluntario;
            // else
            //     monto_total_ahorro_voluntario += cuota.monto_ahorro_voluntario;
        }

        // console.log(cuota.operacion_financiera);

        // const operacion_financiera_detalle = await OperacionFinancieraDetalle.find({ "operacion_financiera": cuota.operacion_financiera, "estado": "Previgente", "es_borrado": false });

        // for (let i = 0; i < cuotas.length; i++) {

        // await OperacionFinancieraDetalle.updateMany({ "operacion_financiera": operacion_financiera, "estado": "Previgente", "es_borrado": false }, { "estado": "Vigente" });
        // await OperacionFinancieraDetalle.updateMany({ "operacion_financiera": "5f52b9533813a42e687c9a3b", "estado": "Previgente", "es_borrado": false }, { "estado": "Vigente" }, function(err, docs) {
        //     if (err) {
        //         console.log(err)
        //     } else {
        //         console.log("Updated Docs : ", docs);
        //     }
        // });

        // console.log(monto_total)

        modelo.monto_total = monto_total.toFixed(1);
        modelo.monto_gasto = monto_total_gasto;
        modelo.monto_ahorro_inicial = monto_total_ahorro_inicial;
        modelo.monto_ahorro_voluntario = monto_total_ahorro_voluntario;
        modelo.monto_ahorro_programado = monto_total_ahorro_programado;
        modelo.monto_amortizacion_capital = monto_total_amortizacion_capital;
        modelo.monto_interes = monto_total_interes;
        modelo.monto_mora = monto_total_mora;

        modelo.estado_caja_diario = 'Abierto';
        modelo.estado_pago = 'Vigente';
        modelo.es_ingreso = true;

        modelo.serie_recibo = dato_recibo.serie_recibo;
        modelo.numero_recibo = dato_recibo.numero_recibo;
        modelo.fecha_recibo = dato_recibo.fecha_recibo;

        modelo.caja_diario = caja_diario.id;

        // modelo.operacion_financiera = 0;
        // modelo.persona = 0;
        // modelo.cajero = 0;

        // const recibo = {
        //     serie_recibo: '001',
        //     numero_recibo: 'I-00000001',
        //     fecha_recibo: '04/09/2020 13:15:05'
        // };

        // console.log(modelo);

        // console.log(modelo.monto_total)

        await modelo.save();

        const cuotas_pendientes = await OperacionFinancieraDetalle.findOne({ "operacion_financiera": operacion_financiera, "estado": "Vigente", "es_borrado": false });

        // console.log(cuotas_pendientes);

        if (!cuotas_pendientes) {
            // if (cuotas_pendientes.length === 0) {

            const model_operacion_financiera = await OperacionFinanciera.findById({ "_id": operacion_financiera });
            model_operacion_financiera.estado = 'Pagado';
            await model_operacion_financiera.save();
        }

        // const recibo = {
        //     serie_recibo: '001',
        //     numero_recibo: 'I-00000001',
        //     fecha_recibo: '04/09/2020 13:15:05'
        // };

        // const recibo = [
        //     [{
        //         content: 'Buenavista La Bolsa S.A.C.',
        //         colSpan: 3,
        //         styles: { halign: 'center' },
        //         // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //     }, ],
        //     [{
        //         content: 'Agencia Ayacucho',
        //         colSpan: 3,
        //         styles: { halign: 'center' },
        //         // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //     }, ],
        //     // [
        //     //   {
        //     //     content: 'RUC: 20574744599',
        //     //     colSpan: 3,
        //     //     styles: { halign: 'center' },
        //     //     // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //     //   },
        //     // ],
        //     [{
        //         content: '------------------------------------',
        //         colSpan: 3,
        //         styles: { halign: 'center' },
        //         // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //     }, ],
        //     [{
        //             content: 'RUC: 20574744599',
        //             colSpan: 1,
        //             styles: { halign: 'left' },
        //             // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //         },
        //         {
        //             content: '',
        //             colSpan: 1,
        //             // styles: { halign: 'left' },
        //             // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //         },
        //         {
        //             content: dato_recibo.numero_recibo,
        //             colSpan: 1,
        //             styles: { halign: 'right' },
        //             // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //         },
        //     ],
        //     [

        //     ],
        //     [{
        //         content: 'DNI: ' + documento_identidad_socio,
        //         colSpan: 3,
        //         styles: { halign: 'left' },
        //         // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //     }],
        //     [{
        //         content: 'Socio: ' + nombres_apellidos_socio,
        //         colSpan: 3,
        //         styles: { halign: 'left' },
        //         // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //     }],
        //     [{
        //         content: 'Analista: Jorge Flores Quispe',
        //         colSpan: 3,
        //         styles: { halign: 'left' },
        //         // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //     }],
        //     [{
        //         content: 'Producto: Créditos Personales',
        //         colSpan: 3,
        //         styles: { halign: 'left' },
        //         // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //     }],
        //     [

        //     ],
        //     [{
        //         content: 'Operaciones en Soles',
        //         colSpan: 3,
        //         styles: { halign: 'left' },
        //         // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //     }],
        //     [{
        //         content: '------------------------------------',
        //         colSpan: 3,
        //         styles: { halign: 'center' },
        //         // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //     }, ],
        //     [{
        //             content: 'Detalle Operación',
        //             colSpan: 2,
        //             styles: { halign: 'center' },
        //             // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //         },
        //         {
        //             content: 'Monto',
        //             colSpan: 1,
        //             styles: { halign: 'right' },
        //             // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //         }
        //     ],
        //     [{
        //         content: '------------------------------------',
        //         colSpan: 3,
        //         styles: { halign: 'center' },
        //         // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //     }, ],
        //     [{
        //             content: 'Ahorro Voluntario es la prueba para ver como entra cuando es tet largo...',
        //             colSpan: 2,
        //             styles: { halign: 'left' },
        //             // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //         },
        //         {
        //             content: '999.00',
        //             colSpan: 1,
        //             styles: { halign: 'right' },
        //             // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //         }
        //     ],
        //     [{
        //             content: 'Amortización Capital',
        //             colSpan: 2,
        //             styles: { halign: 'left' },
        //             // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //         },
        //         {
        //             content: '9999.99',
        //             colSpan: 1,
        //             styles: { halign: 'right' },
        //             // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //         }
        //     ],
        //     [{
        //         content: '------------------------------------',
        //         colSpan: 3,
        //         styles: { halign: 'center' },
        //         // rowHeight: 2
        //         // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //     }, ],
        //     [{
        //             content: 'Total: S/.',
        //             colSpan: 2,
        //             styles: { halign: 'center' },
        //             // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //         },
        //         {
        //             content: monto_total.toFixed(2),
        //             colSpan: 1,
        //             styles: { halign: 'right' },
        //             // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //         }
        //     ],
        //     [
        //         // {
        //         //   colSpan: 3
        //         // }
        //     ],
        //     [{
        //         content: 'Usuario: ' + req.header('usuario_sesion'),
        //         colSpan: 3,
        //         styles: { halign: 'left' },
        //         // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //     }],
        //     [{
        //         content: 'Fecha: ' + dato_recibo.fecha_recibo,
        //         colSpan: 3,
        //         styles: { halign: 'left' },
        //         // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //     }],
        //     [{
        //         content: 'Recibo: Original',
        //         colSpan: 3,
        //         styles: { halign: 'left' },
        //         // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //     }],
        //     [
        //         // {
        //         //   colSpan: 3
        //         // }
        //     ],
        //     [{
        //         content: '** **',
        //         colSpan: 3,
        //         styles: { halign: 'center' },
        //         // styles: { halign: 'center', fillColor: [22, 160, 133] },
        //     }],
        // ];

        let recibo = [
            [{
                content: 'Buenavista La Bolsa S.A.C.',
                colSpan: 3,
                styles: { halign: 'center' },
                // styles: { halign: 'center', fillColor: [22, 160, 133] },
            }, ],
            [{
                content: 'Agencia Ayacucho',
                colSpan: 3,
                styles: { halign: 'center' },
                // styles: { halign: 'center', fillColor: [22, 160, 133] },
            }, ],
            // [
            //   {
            //     content: 'RUC: 20574744599',
            //     colSpan: 3,
            //     styles: { halign: 'center' },
            //     // styles: { halign: 'center', fillColor: [22, 160, 133] },
            //   },
            // ],
            [{
                content: '------------------------------------',
                colSpan: 3,
                styles: { halign: 'center' },
                // styles: { halign: 'center', fillColor: [22, 160, 133] },
            }, ],
            [{
                    content: 'RUC: 20574744599',
                    colSpan: 1,
                    styles: { halign: 'left' },
                    // styles: { halign: 'center', fillColor: [22, 160, 133] },
                },
                {
                    content: '',
                    colSpan: 1,
                    // styles: { halign: 'left' },
                    // styles: { halign: 'center', fillColor: [22, 160, 133] },
                },
                {
                    content: dato_recibo.numero_recibo,
                    colSpan: 1,
                    styles: { halign: 'right' },
                    // styles: { halign: 'center', fillColor: [22, 160, 133] },
                },
            ],
            [

            ],
            [{
                content: 'DNI: ' + documento_identidad_socio,
                colSpan: 3,
                styles: { halign: 'left' },
                // styles: { halign: 'center', fillColor: [22, 160, 133] },
            }],
            [{
                content: 'Socio: ' + nombres_apellidos_socio,
                colSpan: 3,
                styles: { halign: 'left' },
                // styles: { halign: 'center', fillColor: [22, 160, 133] },
            }],
            [{
                content: 'Analista: Jorge Flores Quispe',
                colSpan: 3,
                styles: { halign: 'left' },
                // styles: { halign: 'center', fillColor: [22, 160, 133] },
            }],
            [{
                content: 'Producto: Créditos Personales',
                colSpan: 3,
                styles: { halign: 'left' },
                // styles: { halign: 'center', fillColor: [22, 160, 133] },
            }],
            [

            ],
            [{
                content: 'Operaciones en Soles',
                colSpan: 3,
                styles: { halign: 'left' },
                // styles: { halign: 'center', fillColor: [22, 160, 133] },
            }],
            [{
                content: '------------------------------------',
                colSpan: 3,
                styles: { halign: 'center' },
                // styles: { halign: 'center', fillColor: [22, 160, 133] },
            }],
            [{
                    content: 'Detalle Operación',
                    colSpan: 2,
                    styles: { halign: 'center' },
                    // styles: { halign: 'center', fillColor: [22, 160, 133] },
                },
                {
                    content: 'Monto',
                    colSpan: 1,
                    styles: { halign: 'right' },
                    // styles: { halign: 'center', fillColor: [22, 160, 133] },
                }
            ],
            [{
                content: '------------------------------------',
                colSpan: 3,
                styles: { halign: 'center' },
                // styles: { halign: 'center', fillColor: [22, 160, 133] },
            }]

        ];

        if (monto_total_amortizacion_capital > 0)
            recibo.push([{
                    content: 'Amortización Capital',
                    colSpan: 2,
                    styles: { halign: 'left' },
                    // styles: { halign: 'center', fillColor: [22, 160, 133] },
                },
                {
                    content: monto_total_amortizacion_capital.toFixed(2),
                    colSpan: 1,
                    styles: { halign: 'right' },
                    // styles: { halign: 'center', fillColor: [22, 160, 133] },
                }
            ]);

        if (monto_total_interes > 0)
            recibo.push([{
                    content: 'Interés',
                    colSpan: 2,
                    styles: { halign: 'left' },
                    // styles: { halign: 'center', fillColor: [22, 160, 133] },
                },
                {
                    content: monto_total_interes.toFixed(2),
                    colSpan: 1,
                    styles: { halign: 'right' },
                    // styles: { halign: 'center', fillColor: [22, 160, 133] },
                }
            ]);

        if (monto_total_ahorro_programado > 0)
            recibo.push([{
                    content: 'Ahorro Programado',
                    colSpan: 2,
                    styles: { halign: 'left' },
                    // styles: { halign: 'center', fillColor: [22, 160, 133] },
                },
                {
                    content: monto_total_ahorro_programado.toFixed(2),
                    colSpan: 1,
                    styles: { halign: 'right' },
                    // styles: { halign: 'center', fillColor: [22, 160, 133] },
                }
            ]);

        if (monto_total_ahorro_voluntario > 0)
            recibo.push([{
                    content: 'Ahorro Voluntario',
                    colSpan: 2,
                    styles: { halign: 'left' },
                    // styles: { halign: 'center', fillColor: [22, 160, 133] },
                },
                {
                    content: monto_total_ahorro_voluntario.toFixed(2),
                    colSpan: 1,
                    styles: { halign: 'right' },
                    // styles: { halign: 'center', fillColor: [22, 160, 133] },
                }
            ]);

        if (monto_total_mora > 0)
            recibo.push([{
                    content: 'Mora',
                    colSpan: 2,
                    styles: { halign: 'left' },
                    // styles: { halign: 'center', fillColor: [22, 160, 133] },
                },
                {
                    content: monto_total_mora.toFixed(2),
                    colSpan: 1,
                    styles: { halign: 'right' },
                    // styles: { halign: 'center', fillColor: [22, 160, 133] },
                }
            ]);

        if (monto_total_ahorro_inicial > 0)
            recibo.push([{
                    content: 'Ahorro Inicial',
                    colSpan: 2,
                    styles: { halign: 'left' },
                    // styles: { halign: 'center', fillColor: [22, 160, 133] },
                },
                {
                    content: monto_total_ahorro_inicial.toFixed(2),
                    colSpan: 1,
                    styles: { halign: 'right' },
                    // styles: { halign: 'center', fillColor: [22, 160, 133] },
                }
            ]);

        if (monto_total_gasto > 0)
            recibo.push([{
                    content: 'Gasto Administrativo',
                    colSpan: 2,
                    styles: { halign: 'left' },
                    // styles: { halign: 'center', fillColor: [22, 160, 133] },
                },
                {
                    content: monto_total_gasto.toFixed(2),
                    colSpan: 1,
                    styles: { halign: 'right' },
                    // styles: { halign: 'center', fillColor: [22, 160, 133] },
                }
            ]);

        recibo.push([{
            content: '------------------------------------',
            colSpan: 3,
            styles: { halign: 'center' },
            // rowHeight: 2
            // styles: { halign: 'center', fillColor: [22, 160, 133] },
        }]);

        recibo.push([{
                content: 'Total: S/.',
                colSpan: 2,
                styles: { halign: 'center' },
                // styles: { halign: 'center', fillColor: [22, 160, 133] },
            },
            {
                content: (Math.round(monto_total * 10) / 10).toFixed(2),
                colSpan: 1,
                styles: { halign: 'right' },
                // styles: { halign: 'center', fillColor: [22, 160, 133] },
            }
        ]);

        recibo.push([]);

        recibo.push([{
            content: 'Usuario: ' + req.header('usuario_sesion'),
            colSpan: 3,
            styles: { halign: 'left' },
            // styles: { halign: 'center', fillColor: [22, 160, 133] },
        }]);

        recibo.push([{
            content: 'Fecha: ' + dato_recibo.fecha_recibo,
            colSpan: 3,
            styles: { halign: 'left' },
            // styles: { halign: 'center', fillColor: [22, 160, 133] },
        }])

        recibo.push([{
            content: 'Recibo: Original',
            colSpan: 3,
            styles: { halign: 'left' },
            // styles: { halign: 'center', fillColor: [22, 160, 133] },
        }]);

        recibo.push([{
            content: '** **',
            colSpan: 3,
            styles: { halign: 'center' },
            // styles: { halign: 'center', fillColor: [22, 160, 133] },
        }]);

        res.json({
            ok: true,
            recibo
        })
    } catch (error) {

        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado.'
        });
    }
}

// const realizar_pago_operacion_financiera = async(req, res) => {

//     const { lista_id_operacion_financiera_detalle } = req.body;
//     // const id_operacion_financiera = req.params.id_operacion_financiera;

//     try {

//         // const lista = await OperacionFinancieraDetalle.find({ "operacion_financiera": id_operacion_financiera, "estado": "Vigente", "es_borrado": false })
//         //     .sort({ "numero_cuota": 1 });

//         console.log(id_operacion_financiera);

//         const recibo = {
//             serie_recibo: '001',
//             numero_recibo: 'I-00000001',
//             fecha_recibo: '04/09/2020 13:15:05'
//         };

//         res.json({
//             ok: true,
//             recibo
//         })
//     } catch (error) {

//         console.log(error);
//         res.status(500).json({
//             ok: false,
//             msg: 'Error inesperado.'
//         });
//     }
// }

module.exports = {

    listar_operaciones_financieras_detalle_vigentes,
    pagar_operacion_financiera
}