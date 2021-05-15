const { response } = require("express");
const mongoose = require('mongoose');
// var id = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
const dayjs = require('dayjs');
const logger = require('../../../helpers/logger');
const { getMessage } = require('../../../helpers/messages');
const OperacionFinancieraDetalle = require("../../../models/core/registro/operacion-financiera-detalle.model");
// const dayjs = require('dayjs');

const listar_operaciones_financieras_detalle = async(req, res) => {
    // const { id_operacion_financiera } = req.body;
    const id_operacion_financiera = req.params.id_operacion_financiera;

    try {
        const lista = await OperacionFinancieraDetalle.find({
            operacion_financiera: id_operacion_financiera,
            es_borrado: false,
            es_vigente: true,
        }).sort({ numero_cuota: 1 });

        // for (let i = 0; i < lista.length; i++) {

        //     let monto_gasto_pagado = 0;
        //     let monto_ahorro_inicial_pagado = 0;
        //     let monto_ahorro_voluntario_pagado = 0;
        //     let monto_ahorro_programado_pagado = 0;
        //     let monto_amortizacion_capital_pagado = 0;
        //     let monto_interes_pagado = 0;
        //     let monto_mora_pagado = 0;

        //     for (let j = 0; j < lista[i].pagos.length; j++) {

        //         if (lista[i].pagos[j].es_vigente) {

        //             monto_gasto_pagado += lista[i].pagos[j].ingresos.monto_gasto || 0;
        //             monto_ahorro_inicial_pagado += lista[i].pagos[j].ahorros.monto_ahorro_inicial || 0;
        //             monto_ahorro_voluntario_pagado += lista[i].pagos[j].ahorros.monto_ahorro_voluntario || 0;
        //             monto_ahorro_programado_pagado += lista[i].pagos[j].ahorros.monto_ahorro_programado || 0;
        //             monto_amortizacion_capital_pagado += lista[i].pagos[j].ingresos.monto_amortizacion_capital || 0;
        //             monto_interes_pagado += lista[i].pagos[j].ingresos.monto_interes || 0;
        //             monto_mora_pagado += lista[i].pagos[j].ingresos.monto_mora || 0;
        //         }
        //     }

        //     // lista[i].ingresos.monto_gasto -= monto_gasto_pagado;
        //     // lista[i].ahorros.monto_ahorro_inicial -= monto_ahorro_inicial_pagado;
        //     // lista[i].ahorros.monto_ahorro_voluntario -= monto_ahorro_voluntario_pagado;
        //     // lista[i].ahorros.monto_ahorro_programado -= monto_ahorro_programado_pagado;
        //     // lista[i].ingresos.monto_amortizacion_capital -= monto_amortizacion_capital_pagado;
        //     // lista[i].ingresos.monto_mora -= monto_mora_pagado;
        //     // lista[i].ingresos.monto_interes -= monto_interes_pagado;

        //     lista[i].monto_cuota_pagada = (monto_gasto_pagado +
        //         monto_ahorro_inicial_pagado +
        //         monto_amortizacion_capital_pagado +
        //         monto_interes_pagado +
        //         monto_ahorro_programado_pagado).toFixed(2);
        // }

        // console.log(id_operacion_financiera)
        // console.log(lista)

        res.json({
            ok: true,
            lista,
        });
    } catch (error) {

        const controller = "operacion-financiera-detalle.controller.js -> listar_operaciones_financieras_detalle";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const obtener_operacion_financiera_detalle = async(req, res) => {
    try {
        const id = req.params.id;
        const operacion_financiera_detalle = await OperacionFinancieraDetalle.findById(
            id
        );
        return res.json({
            ok: true,
            operacion_financiera_detalle,
        });
    } catch (error) {

        const controller = "operacion-financiera-detalle.controller.js -> obtener_operacion_financiera_detalle";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const actualizar_operacion_financiera_detalle = async(req, res) => {

    try {
        const id = req.params.id;
        const operacion_financiera_detalle = await OperacionFinancieraDetalle.findById(
            id
        );
        operacion_financiera_detalle.ingresos.monto_amortizacion_capital =
            req.body.cuota_pago_capital;
        operacion_financiera_detalle.ingresos.monto_interes =
            req.body.cuota_pago_interes;
        operacion_financiera_detalle.ahorros.monto_ahorro_programado =
            req.body.cuota_ahorro_programado;
        operacion_financiera_detalle.ingresos.monto_mora =
            req.body.cuota_pago_mora;

        await operacion_financiera_detalle.save();
        return res.json({
            ok: true,
            msg: "Cuota actualizada",
        });
    } catch (error) {

        const controller = "operacion-financiera-detalle.controller.js -> actualizar_operacion_financiera_detalle";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const operacion_financiera_detalle_baja = async(req, res) => {

    const id = req.params.id;

    try {

        const operacion_financiera_detalle = await OperacionFinancieraDetalle.findById(id);
        operacion_financiera_detalle.es_vigente = false;
        await operacion_financiera_detalle.save();

        return res.json({
            ok: true,
            msg: 'Cuota dada de baja'
        })

    } catch (error) {

        const controller = "operacion-financiera-detalle.controller.js -> operacion_financiera_detalle_baja";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const obtener_ahorros = async(req, res) => {

    try {
        // const id = req.params.id;        
        const id = mongoose.Types.ObjectId(req.params.id);

        // const operacion_financiera_detalle = await OperacionFinancieraDetalle.findById(
        //     id
        // );

        // console.log(id)

        // const tt = await OperacionFinancieraDetalle.find({ operacion_financiera: id });

        // console.log(tt)

        const modelo = await OperacionFinancieraDetalle.aggregate(
            [{
                    $match: {
                        operacion_financiera: id,
                        // estado: "Pagado",
                        "estado": { $in: ["Pagado", "Vigente"] },
                        es_vigente: true,
                        es_borrado: false
                    }
                },
                {
                    $group: {
                        _id: "$operacion_financiera",
                        monto_ahorro_inicial: { $sum: "$ahorros.monto_ahorro_inicial" },
                        monto_retiro_ahorro_inicial: { $sum: "$ahorros.monto_retiro_ahorro_inicial" },
                        monto_ahorro_voluntario: { $sum: "$ahorros.monto_ahorro_voluntario" },
                        monto_retiro_ahorro_voluntario: { $sum: "$ahorros.monto_retiro_ahorro_voluntario" },
                        monto_ahorro_programado: { $sum: "$ahorros.monto_ahorro_programado" },
                        monto_retiro_ahorro_programado: { $sum: "$ahorros.monto_retiro_ahorro_programado" }
                    }
                }
            ]
        )

        // console.log(modelo)

        const ahorros = {
            monto_ahorro_inicial: modelo[0].monto_ahorro_inicial - modelo[0].monto_retiro_ahorro_inicial,
            monto_ahorro_voluntario: modelo[0].monto_ahorro_voluntario - modelo[0].monto_retiro_ahorro_voluntario,
            monto_ahorro_programado: modelo[0].monto_ahorro_programado - modelo[0].monto_retiro_ahorro_programado
        };

        // console.log(ahorros)

        return res.json({
            ok: true,
            ahorros,
        });
    } catch (error) {

        const controller = "operacion-financiera-detalle.controller.js -> obtener_ahorros";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

// const obtener_ahorros_producto_por_persona = async(req, res) => {

//     try {

//         const id = mongoose.Types.ObjectId(req.params.id);
//         // const estado = ["Pagado", "Previgente", "Vigente"];

//         const lista = await OperacionFinancieraDetalle.aggregate(
//             [{
//                     $match: {
//                         "persona": id,
//                         // "estado": { $in: estado },
//                         "estado": "Pagado",
//                         "es_vigente": true,
//                         "es_borrado": false
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: "$operacion_financiera",
//                         // monto_ahorro_inicial: { $sum: { $subtract: ["$ahorros.monto_ahorro_inicial", "$ahorros.monto_retiro_ahorro_inicial"] } },
//                         // // monto_retiro_ahorro_inicial: { $sum: "$ahorros.monto_retiro_ahorro_inicial" },
//                         // monto_ahorro_voluntario: { $sum: ["$ahorros.monto_ahorro_voluntario", "$ahorros.monto_retiro_ahorro_voluntario"] },
//                         // // monto_retiro_ahorro_voluntario: { $sum: "$ahorros.monto_retiro_ahorro_voluntario" },
//                         // monto_ahorro_programado: { $sum: ["$ahorros.monto_ahorro_programado", "$ahorros.monto_retiro_ahorro_programado"] },
//                         // // monto_retiro_ahorro_programado: { $sum: "$ahorros.monto_retiro_ahorro_programado" }

//                         monto_ahorro_inicial: { $sum: "$ahorros.monto_ahorro_inicial" },
//                         monto_retiro_ahorro_inicial: { $sum: "$ahorros.monto_retiro_ahorro_inicial" },
//                         monto_ahorro_voluntario: { $sum: "$ahorros.monto_ahorro_voluntario" },
//                         monto_retiro_ahorro_voluntario: { $sum: "$ahorros.monto_retiro_ahorro_voluntario" },
//                         monto_ahorro_programado: { $sum: "$ahorros.monto_ahorro_programado" },
//                         monto_retiro_ahorro_programado: { $sum: "$ahorros.monto_retiro_ahorro_programado" }
//                     }
//                 },
//                 {
//                     $addFields: {
//                         "total_monto_ahorro_inicial": { $subtract: ["$monto_ahorro_inicial", "$monto_retiro_ahorro_inicial"] },
//                         "total_monto_ahorro_voluntario": { $subtract: ["$monto_ahorro_voluntario", "$monto_retiro_ahorro_voluntario"] },
//                         "total_monto_ahorro_programado": { $subtract: ["$monto_ahorro_programado", "$monto_retiro_ahorro_programado"] },
//                     }
//                 },
//                 {
//                     $match: {
//                         $or: [
//                             { "total_monto_ahorro_inicial": { "$gt": 0 } },
//                             { "total_monto_ahorro_voluntario": { "$gt": 0 } },
//                             { "total_monto_ahorro_programado": { "$gt": 0 } },
//                         ]
//                     }
//                 }
//             ]
//         )

//         console.log(lista)

//         // const ahorros = {
//         //     monto_ahorro_inicial: modelo[0].monto_ahorro_inicial - modelo[0].monto_retiro_ahorro_inicial,
//         //     monto_ahorro_voluntario: modelo[0].monto_ahorro_voluntario - modelo[0].monto_retiro_ahorro_voluntario,
//         //     monto_ahorro_programado: modelo[0].monto_ahorro_programado - modelo[0].monto_retiro_ahorro_programado
//         // };

//         // console.log(ahorros)

//         return res.json({
//             ok: true,
//             // ahorros,
//             lista,
//         });
//     } catch (error) {

//         logger.logError(req, error);

//         return res.status(500).json({
//             ok: false,
//             msg: getMessage('msgError500')
//         });
//     }
// }

module.exports = {
    listar_operaciones_financieras_detalle,
    obtener_operacion_financiera_detalle,
    actualizar_operacion_financiera_detalle,
    operacion_financiera_detalle_baja,
    obtener_ahorros,
    // obtener_ahorros_producto_por_persona
};