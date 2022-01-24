const { response } = require('express');
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const logger = require('../../../helpers/logger');
const { getMessage } = require('../../../helpers/messages');
const PagoOperacionFinanciera = require('../../../models/core/caja/operacion-financiera-pago.model');
const OperacionFinanciera = require('../../../models/core/registro/operacion-financiera.model');
const OperacionFinancieraDetalle = require('../../../models/core/registro/operacion-financiera-detalle.model');
const Analista = require('../../../models/core/seguridad/analista.model');

const crear = async(req, res = response) => {

    const { detalle, comentario } = req.body;

    const session = await OperacionFinanciera.startSession();
    session.startTransaction();
    try {
        const opts = { session };

        const operacion_financiera = new OperacionFinanciera(req.body);

        // console.log(req.body);

        const now = dayjs();

        operacion_financiera.local_atencion = req.header('local_atencion');

        operacion_financiera.comentario = [{
            tipo: 'Nuevo',
            id_usuario: req.header('id_usuario_sesion'),
            usuario: req.header('usuario_sesion'),
            nombre: req.header('nombre_sesion'),
            fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
            comentario
        }];

        const modelo = await operacion_financiera.save(opts);

        let operacion_financiera_detalle;

        // operacion_financiera_detalle = new OperacionFinancieraDetalle(detalle[i]);

        for (let i = 0; i < detalle.length; i++) {

            operacion_financiera_detalle = new OperacionFinancieraDetalle(detalle[i]);
            operacion_financiera_detalle.operacion_financiera = modelo.id;
            operacion_financiera_detalle.persona = modelo.persona;

            await operacion_financiera_detalle.save(opts);
        }

        await session.commitTransaction();
        session.endSession();

        // logger.report.info('Transaccion Ok.');
        // logger.report.log()
        // logger.logRequest(req);

        return res.json({
            ok: true,
            msg: 'Transaccion Ok.'
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        // console.log(error)

        // logger.report.error('Transaccion NO Ok.');
        const controller = "operacion-financiera.controller.js -> crear";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

const listar_operaciones_financieras = async(req, res) => {

    // const { id } = req.body;
    const id_persona = req.params.id_persona;
    const estado = (req.params.estado === 'historico' ? ["Pagado"] : ["Previgente", "Vigente"]);
    const es_prestamo = (req.params.opcion === 'credito' ? true : false);

    try {

        const lista = await OperacionFinanciera.find({
                "persona": id_persona,
                "producto.es_prestamo": es_prestamo,
                "estado": { $in: estado },
                // "estado": { $in: ["Previgente", "Vigente"] },
                "es_vigente": true,
                "es_borrado": false
            })
            .populate({
                path: 'producto.tipo',
                // match: { es_prestamo: true },
                select: 'descripcion'
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

        if (!es_prestamo) {

            // console.log('llego...')
            // console.log(lista)

            for (let i = 0; i < lista.length; i++) {

                // console.log(lista[i]._id)

                const modelo = await OperacionFinancieraDetalle.aggregate(
                    [
                        { $match: { operacion_financiera: lista[i]._id, estado: "Vigente", es_vigente: true, es_borrado: false } },
                        { $group: { _id: "$operacion_financiera", monto_ahorro_voluntario: { $sum: "$ahorros.monto_ahorro_voluntario" }, monto_retiro_ahorro_voluntario: { $sum: "$ahorros.monto_retiro_ahorro_voluntario" } } }
                    ]
                )

                // console.log(modelo);

                lista[i].monto_capital = modelo[0].monto_ahorro_voluntario - modelo[0].monto_retiro_ahorro_voluntario;

            }
        }

        res.json({
            ok: true,
            lista
        })
    } catch (error) {

        const controller = "operacion-financiera.controller.js -> listar_operaciones_financieras";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

const obtener_ahorros_producto_por_persona = async(req, res) => {

    try {

        // console.log('entrooo 1111')
        const id = mongoose.Types.ObjectId(req.params.id);
        const estado = ["Pagado", "Previgente", "Vigente"];
        // const estado_detalle = ["Pagado", "Vigente"];
        const es_prestamo = true;

        // console.log('entrooo')

        const lista_productos = await OperacionFinanciera.find({
                "persona": id,
                "producto.es_prestamo": es_prestamo,
                "estado": { $in: estado },
                // "estado": { $in: ["Previgente", "Vigente"] },
                "es_vigente": true,
                "es_borrado": false
            })
            .populate({
                path: 'producto.tipo',
                // match: { es_prestamo: true },
                select: 'descripcion'
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

        const lista_productos_con_ahorro = await OperacionFinancieraDetalle.aggregate(
            [{
                    $match: {
                        "persona": id,
                        // "estado": { $in: estado },
                        // "estado": "Pagado",
                        "estado": { $in: ["Pagado", "Vigente", "Amortizado"] },
                        "es_vigente": true,
                        "es_borrado": false
                    }
                },
                {
                    $group: {
                        _id: "$operacion_financiera",
                        // monto_ahorro_inicial: { $sum: { $subtract: ["$ahorros.monto_ahorro_inicial", "$ahorros.monto_retiro_ahorro_inicial"] } },
                        // // monto_retiro_ahorro_inicial: { $sum: "$ahorros.monto_retiro_ahorro_inicial" },
                        // monto_ahorro_voluntario: { $sum: ["$ahorros.monto_ahorro_voluntario", "$ahorros.monto_retiro_ahorro_voluntario"] },
                        // // monto_retiro_ahorro_voluntario: { $sum: "$ahorros.monto_retiro_ahorro_voluntario" },
                        // monto_ahorro_programado: { $sum: ["$ahorros.monto_ahorro_programado", "$ahorros.monto_retiro_ahorro_programado"] },
                        // // monto_retiro_ahorro_programado: { $sum: "$ahorros.monto_retiro_ahorro_programado" }

                        monto_ahorro_inicial: { $sum: "$ahorros.monto_ahorro_inicial" },
                        monto_retiro_ahorro_inicial: { $sum: "$ahorros.monto_retiro_ahorro_inicial" },
                        monto_ahorro_voluntario: { $sum: "$ahorros.monto_ahorro_voluntario" },
                        monto_retiro_ahorro_voluntario: { $sum: "$ahorros.monto_retiro_ahorro_voluntario" },
                        monto_ahorro_programado: { $sum: "$ahorros.monto_ahorro_programado" },
                        monto_retiro_ahorro_programado: { $sum: "$ahorros.monto_retiro_ahorro_programado" }
                    }
                },
                {
                    $addFields: {
                        "total_monto_ahorro_inicial": { $subtract: ["$monto_ahorro_inicial", "$monto_retiro_ahorro_inicial"] },
                        "total_monto_ahorro_voluntario": { $subtract: ["$monto_ahorro_voluntario", "$monto_retiro_ahorro_voluntario"] },
                        "total_monto_ahorro_programado": { $subtract: ["$monto_ahorro_programado", "$monto_retiro_ahorro_programado"] },
                    }
                },
                {
                    $match: {
                        $or: [
                            { "total_monto_ahorro_inicial": { "$gt": 0 } },
                            { "total_monto_ahorro_voluntario": { "$gt": 0 } },
                            { "total_monto_ahorro_programado": { "$gt": 0 } },
                        ]
                    }
                }
            ]
        );

        // console.log(lista_productos_con_ahorro[0]._id) //5fd3f1a2b5a618297005c5b2
        // console.log(lista_productos)

        // const dd = lista_productos_con_ahorro[0]._id;

        const lista = lista_productos.filter(pro =>
            lista_productos_con_ahorro.some(li => pro._id == (li._id).toString())
            // pro._id == dd.toString()
        );



        // console.log(lista_productos_con_ahorro)
        // console.log(lista)

        // const ahorros = {
        //     monto_ahorro_inicial: modelo[0].monto_ahorro_inicial - modelo[0].monto_retiro_ahorro_inicial,
        //     monto_ahorro_voluntario: modelo[0].monto_ahorro_voluntario - modelo[0].monto_retiro_ahorro_voluntario,
        //     monto_ahorro_programado: modelo[0].monto_ahorro_programado - modelo[0].monto_retiro_ahorro_programado
        // };

        // console.log(ahorros)

        return res.json({
            ok: true,
            // ahorros,
            lista,
        });
    } catch (error) {

        const controller = "operacion-financiera.controller.js -> obtener_ahorros_producto_por_persona";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

// const listar_operaciones_financieras = async (req, res) => {
//   // const { id } = req.body;
//   const id_persona = req.params.id_persona;

//   try {
//     const lista = await OperacionFinanciera.find({
//       persona: id_persona,
//       estado: { $in: ["Previgente", "Vigente"] },
//       es_borrado: false,
//     })
//       .populate("producto.tipo", "descripcion")
//       .populate({
//         path: "analista",
//         select: "usuario",
//         populate: {
//           path: "usuario",
//           select: "persona",
//           populate: {
//             path: "persona",
//             select: "nombre apellido_paterno apellido_materno",
//           },
//         },
//       });

//     res.json({
//       ok: true,
//       lista,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       ok: false,
//       msg: "Error inesperado.",
//     });
//   }
// };

const listar_operacion_financiera = async(req, res) => {
    // const { id } = req.body;
    const id_operacion_financiera = req.params.id_operacion_financiera;

    try {
        const modelo = await OperacionFinanciera.findOne({
                _id: id_operacion_financiera,
                es_borrado: false,
            })
            .populate("producto.tipo", "descripcion")
            .populate({
                path: "analista",
                select: "usuario",
                populate: {
                    path: "usuario",
                    select: "persona",
                    populate: {
                        path: "persona",
                        select: "nombre apellido_paterno apellido_materno documento_identidad",
                    },
                },
            })
            .populate('persona', 'nombre apellido_paterno apellido_materno documento_identidad');

        //const analista = await Analista.findById(modelo.analista);
        //const usuario = await Usuario.findById(analista.usuario,'persona').populate('persona','nombre apellido_paterno apellido_materno documento_identidad');

        res.json({
            ok: true,
            modelo,
        });
    } catch (error) {

        const controller = "operacion-financiera.controller.js -> listar_operacion_financiera";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const listar_operaciones_financieras_por_analista = async(req, res) => {
    // const { id } = req.body;
    const id_usuario = req.header("id_usuario_sesion");
    const local_atencion = req.header("local_atencion");
    const tipo = req.params.tipo;

    // const id_analista = req.params.id_analista;

    try {

        const analista = await Analista.findOne({ usuario: id_usuario /*, local_atencion: local_atencion*/ }); //TODO habilitar local de atencion

        //TODO: verificar estado vigente en el producto
        let lista = [];

        if (analista)
            lista = await OperacionFinanciera.find({
                analista: analista.id,
                "producto.tipo": tipo,
                estado: { $in: ["Vigente"] },
                es_borrado: false,
            })
            .populate("persona", "nombre apellido_paterno apellido_materno documento_identidad");
        // .populate('producto.tipo', 'descripcion');

        res.json({
            ok: true,
            lista,
            analista: analista._id
        });
    } catch (error) {

        const controller = "operacion-financiera.controller.js -> listar_operaciones_financieras_por_analista";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const cambiar_analista = async(req, res = response) => {
    const id = req.params.id;
    const now = dayjs();
    const { analista, comentario } = req.body;

    try {

        const modelo = await OperacionFinanciera.findById(id);

        modelo.analista = analista;
        // modelo.comentario.push();

        // console.log('analista', analista)
        // console.log(modelo)

        modelo.comentario.push({
            tipo: "Editado",
            id_usuario: req.header("id_usuario_sesion"),
            usuario: req.header("usuario_sesion"),
            nombre: req.header("nombre_sesion"),
            fecha: now.format("DD/MM/YYYY hh:mm:ss a"),
            comentario: comentario,
        });

        await modelo.save();

        return res.json({
            ok: true,
            // recibo: 'Anulación satisfactoriamente.',
            msg: "Se cambió analista satisfactoriamente.",
        });
    } catch (error) {

        const controller = "operacion-financiera.controller.js -> cambiar_analista";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const anular = async(req, res = response) => {
    const id = req.params.id;
    const now = dayjs();
    const { analista, comentario } = req.body;

    try {

        const pago = await PagoOperacionFinanciera.findOne({
            "producto.operacion_financiera": id,
            "recibo.estado": "Vigente",
            es_vigente: true,
            es_borrado: false,
        });

        if (pago)
            return res.status(404).json({
                ok: false,
                msg: "El producto no puede anularse, porque existen pagos asociados.",
            });

        const modelo = await OperacionFinanciera.findById(id);

        //TODO: validar pagos antes de anular

        modelo.estado = "Anulado";
        // modelo.comentario.push();

        modelo.comentario.push({
            tipo: "Editado",
            id_usuario: req.header("id_usuario_sesion"),
            usuario: req.header("usuario_sesion"),
            nombre: req.header("nombre_sesion"),
            fecha: now.format("DD/MM/YYYY hh:mm:ss a"),
            comentario: comentario,
        });

        await modelo.save();

        await OperacionFinancieraDetalle.updateMany({ operacion_financiera: id, es_borrado: false }, { estado: "Anulado" });

        // const cuotas = OperacionFinancieraDetalle.find({ 'operacion_financiera': id });

        // for (let i = 0; i < cuotas.length; i++) {

        //     // const cuota = await OperacionFinancieraDetalle.findById(modelo.detalle[i].producto.operacion_financiera_detalle);

        //     for (let j = 0; j < cuota.pagos.length; j++) {

        //         if (cuota.pagos[j].recibo.serie === modelo.recibo.serie &&
        //             cuota.pagos[j].recibo.numero === modelo.recibo.numero) {

        //             cuota.pagos[j].es_vigente = false;
        //             // await cuota.save();
        //         }
        //     }

        //     await cuota.save();
        // }

        return res.json({
            ok: true,
            // recibo: 'Anulación satisfactoriamente.',
            msg: "Se anuló satisfactoriamente.",
        });
    } catch (error) {

        const controller = "operacion-financiera.controller.js -> anular";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const congelar_descongelar = async(req, res = response) => {

    const id = req.params.id;
    const now = dayjs();
    const {
        // analista,
        comentario
    } = req.body;

    try {

        const modelo = await OperacionFinanciera.findById(id);

        //TODO: validar pagos antes de anular

        modelo.es_congelado = !modelo.es_congelado;
        // modelo.comentario.push();

        modelo.comentario.push({
            tipo: 'Editado',
            id_usuario: req.header('id_usuario_sesion'),
            usuario: req.header('usuario_sesion'),
            nombre: req.header('nombre_sesion'),
            fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
            comentario: comentario
        });

        await modelo.save();

        return res.json({
            ok: true,
            // recibo: 'Anulación satisfactoriamente.',
            msg: 'Se realizó satisfactoriamente.'
        });

    } catch (error) {

        const controller = "operacion-financiera.controller.js -> congelar_descongelar";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

module.exports = {
    crear,
    listar_operaciones_financieras,
    listar_operacion_financiera,
    listar_operaciones_financieras_por_analista,
    cambiar_analista,
    anular,
    congelar_descongelar,
    // listar_operaciones_financieras_para_retiro_ahorros
    obtener_ahorros_producto_por_persona
}