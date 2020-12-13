const { response } = require('express');
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
        logger.logError(req, error);

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

            for (let i = 0; i < lista.length; i++) {

                const modelo = await OperacionFinancieraDetalle.aggregate(
                    [
                        { $match: { operacion_financiera: lista[i]._id } },
                        { $group: { _id: "$operacion_financiera", monto_ahorro_voluntario: { $sum: "$ahorros.monto_ahorro_voluntario" }, monto_retiro_ahorro_voluntario: { $sum: "$ahorros.monto_retiro_ahorro_voluntario" } } }
                    ]
                )

                lista[i].monto_capital = modelo[0].monto_ahorro_voluntario - modelo[0].monto_retiro_ahorro_voluntario;

            }
        }

        res.json({
            ok: true,
            lista
        })
    } catch (error) {

        logger.logError(req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

// const listar_operacion_financiera = async(req, res) => {

//     // const { id } = req.body;
//     const id_operacion_financiera = req.params.id_operacion_financiera;

//     try {

//         const modelo = await OperacionFinanciera.findOne({ "_id": id_operacion_financiera, "es_borrado": false })
//             .populate('producto.tipo', 'descripcion');

//         res.json({
//             ok: true,
//             modelo
//         })
//     } catch (error) {

//         console.log(error);
//         res.status(500).json({
//             ok: false,
//             msg: 'Error inesperado.'
//         });
//     }
// }

// const listar_operaciones_financieras_por_analista = async(req, res) => {

//     // const { id } = req.body;
//     const id_usuario = req.header('id_usuario_sesion');

//     // const id_analista = req.params.id_analista;

//     try {

//         const analista = await Analista.findOne({ 'usuario': id_usuario });

//         //TODO: verificar estado vigente en el producto
//         let lista = [];

//         if (analista)
//             lista = await OperacionFinanciera.find({
//                 "analista": analista.id,
//                 "estado": { $in: ["Vigente"] },
//                 "es_borrado": false
//             });
//         // .populate('producto.tipo', 'descripcion');

//         res.json({
//             ok: true,
//             lista
//         })
//     } catch (error) {

//         console.log(error);
//         res.status(500).json({
//             ok: false,
//             msg: 'Error inesperado.'
//         });
//     }
// }

// const cambiar_analista = async(req, res = response) => {

//     const id = req.params.id;

//     const now = dayjs();

//     operacion_financiera.comentario = [
//       {
//         tipo: "Nuevo",
//         id_usuario: req.header("id_usuario_sesion"),
//         usuario: req.header("usuario_sesion"),
//         nombre: req.header("nombre_sesion"),
//         fecha: now.format("DD/MM/YYYY hh:mm:ss a"),
//         comentario,
//       },
//     ];

//     const modelo = await operacion_financiera.save(opts);

//     let operacion_financiera_detalle;

//     // operacion_financiera_detalle = new OperacionFinancieraDetalle(detalle[i]);

//     for (let i = 0; i < detalle.length; i++) {

//       operacion_financiera_detalle = new OperacionFinancieraDetalle(detalle[i]);
//       operacion_financiera_detalle.operacion_financiera = modelo.id;
//       operacion_financiera_detalle.persona = modelo.persona;

//       await operacion_financiera_detalle.save(opts);
//     }

//     await session.commitTransaction();
//     session.endSession();

//     logger.report.info("Transaccion Ok.");

//     return res.json({
//       ok: true,
//       msg: "Transaccion Ok.",
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();

//     console.log(error);

//     logger.report.error("Transaccion NO Ok.");

//     return res.status(500).json({
//       ok: false,
//       msg: "Transaccion NO Ok.",
//     });
//   }
// };

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

        logger.logError(req, error);

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

    // const id_analista = req.params.id_analista;

    try {

        const analista = await Analista.findOne({ usuario: id_usuario /*, local_atencion: local_atencion*/ }); //TODO habilitar local de atencion

        //TODO: verificar estado vigente en el producto
        let lista = [];

        if (analista)
            lista = await OperacionFinanciera.find({
                analista: analista.id,
                estado: { $in: ["Vigente"] },
                es_borrado: false,
            })
            .populate("persona", "nombre apellido_paterno apellido_materno documento_identidad");
        // .populate('producto.tipo', 'descripcion');

        res.json({
            ok: true,
            lista,
        });
    } catch (error) {

        logger.logError(req, error);

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

        modelo.comentario.push({
            tipo: "Editado",
            id_usuario: req.header("id_usuario_sesion"),
            usuario: req.header("usuario_sesion"),
            nombre: req.header("nombre_sesion"),
            fecha: now.format("DD/MM/YYYY hh:mm:ss a"),
            comentario: comentario,
        });

        modelo.save();

        return res.json({
            ok: true,
            // recibo: 'Anulación satisfactoriamente.',
            msg: "Se cambio analista satisfactoriamente.",
        });
    } catch (error) {

        logger.logError(req, error);

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

        modelo.save();

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

        logger.logError(req, error);

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

        modelo.save();

        return res.json({
            ok: true,
            // recibo: 'Anulación satisfactoriamente.',
            msg: 'Se realizó satisfactoriamente.'
        });

    } catch (error) {

        logger.logError(req, error);

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
    congelar_descongelar
}