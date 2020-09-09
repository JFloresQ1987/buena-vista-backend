const { response } = require('express');
const logger = require('../../../helpers/logger');
const OperacionFinanciera = require('../../../models/core/registro/operacion-financiera.model');
const OperacionFinancieraDetalle = require('../../../models/core/registro/operacion-financiera-detalle.model');
const PagoOperacionFinanciera = require('../../../models/core/caja/operacion-financiera-pago.model');
const dayjs = require('dayjs');

const listar_operaciones_financieras_detalle_vigentes = async(req, res) => {

    // const { id_operacion_financiera } = req.body;
    const id_operacion_financiera = req.params.id_operacion_financiera;

    try {

        const lista = await OperacionFinancieraDetalle.find({ "operacion_financiera": id_operacion_financiera, "estado": "Vigente", "es_borrado": false })
            .sort({ "numero_cuota": 1 });

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
    const { operacion_financiera, monto_ahorro_voluntario, monto_recibido, cuotas } = req.body;
    // const id_operacion_financiera = req.params.id_operacion_financiera;

    try {

        // const lista = await OperacionFinancieraDetalle.find({ "operacion_financiera": id_operacion_financiera, "estado": "Vigente", "es_borrado": false })
        //     .sort({ "numero_cuota": 1 });

        // console.log(monto_ahorro_voluntario);
        // console.log(monto_recibido);
        // console.log(detalle);
        // console.log(lista_id_operacion_financiera_detalle);

        const modelo = new PagoOperacionFinanciera(req.body);
        const now = dayjs();

        // modelo.comentario = [{
        //     tipo: 'Nuevo',
        //     usuario: req.header('id_usuario_sesion'),
        //     usuario: req.header('usuario_sesion'),
        //     nombre: req.header('nombre_sesion'),
        //     fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
        //     comentario
        // }];

        let monto_total = 0;
        let monto_total_gasto = 0;
        let monto_total_ahorro_inicial = 0;
        let monto_total_ahorro_voluntario = 0;
        let monto_total_ahorro_programado = 0;
        let monto_total_amortizacion_capital = 0;
        let monto_total_interes = 0;
        let monto_total_mora = 0;

        const recibo = {
            serie_recibo: '001',
            numero_recibo: 'I-00000001',
            fecha_recibo: '04/09/2020 13:15:05'
        };

        for (let i = 0; i < cuotas.length; i++) {

            const cuota = await OperacionFinancieraDetalle.findById({ "_id": cuotas[i] })

            if (cuota.numero_cuota === 0)
                await OperacionFinancieraDetalle.updateMany({ "operacion_financiera": operacion_financiera, "estado": "Previgente", "es_borrado": false }, { "estado": "Vigente" });

            cuota.estado = 'Pagado';
            cuota.pagos.push(recibo);

            if (i === 0)
                cuota.monto_ahorro_voluntario += parseInt(monto_ahorro_voluntario);

            await cuota.save();

            // const cuota = await OperacionFinancieraDetalle.findById({ "_id": cuotas[i] })

            modelo.detalle.push({
                operacion_financiera_detalle: cuota.id,
                numero_cuota: cuota.numero_cuota,
                monto_gasto: cuota.monto_gasto,
                monto_ahorro_inicial: cuota.monto_ahorro_inicial,
                // monto_retiro_ahorro_inicial: cuota.monto_retiro_ahorro_inicial,
                monto_ahorro_voluntario: cuota.monto_ahorro_voluntario,
                // monto_retiro_ahorro_voluntario: cuota.monto_retiro_ahorro_voluntario,
                monto_ahorro_programado: cuota.monto_ahorro_programado,
                // monto_retiro_ahorro_programado: cuota.monto_retiro_ahorro_programado,
                monto_amortizacion_capital: cuota.monto_amortizacion_capital,
                monto_interes: cuota.monto_interes,
                monto_interes_ganado: cuota.monto_interes_ganado,
                // monto_retiro_interes_ganado: cuota.monto_retiro_interes_ganado,
                monto_mora: cuota.monto_mora
            });

            monto_total += cuota.monto_gasto + cuota.monto_ahorro_inicial +
                cuota.monto_ahorro_voluntario + cuota.monto_ahorro_programado +
                cuota.monto_amortizacion_capital + cuota.monto_interes +
                cuota.monto_mora; // + parseInt(monto_ahorro_voluntario);

            // console.log(monto_total)

            monto_total_gasto += cuota.monto_gasto;
            monto_total_ahorro_inicial += cuota.monto_ahorro_inicial;
            monto_total_ahorro_voluntario = cuota.monto_ahorro_voluntario;
            monto_total_ahorro_programado += cuota.monto_ahorro_programado;
            monto_total_amortizacion_capital += cuota.monto_amortizacion_capital;
            monto_total_interes += cuota.monto_interes;
            monto_total_mora += cuota.monto_mora;

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

        modelo.monto_total = monto_total;
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

        modelo.serie_recibo = '001';
        modelo.numero_recibo = 'I-00000001';
        modelo.fecha_recibo = now.format('DD/MM/YYYY hh:mm:ss a');

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