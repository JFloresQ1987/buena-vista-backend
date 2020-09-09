const { response } = require('express');
const logger = require('../../../helpers/logger');
const OperacionFinanciera = require('../../../models/core/registro/operacion-financiera.model');
const OperacionFinancieraDetalle = require('../../../models/core/registro/operacion-financiera-detalle.model');
const dayjs = require('dayjs');

const crear = async(req, res = response) => {

    const { detalle, comentario } = req.body;

    const session = await OperacionFinanciera.startSession();
    session.startTransaction();
    try {
        const opts = { session };

        const operacion_financiera = new OperacionFinanciera(req.body);
        const now = dayjs();

        operacion_financiera.comentario = [{
            tipo: 'Nuevo',
            usuario: req.header('id_usuario_sesion'),
            usuario: req.header('usuario_sesion'),
            nombre: req.header('nombre_sesion'),
            fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
            comentario
        }];

        const modelo = await operacion_financiera.save(opts);

        let operacion_financiera_detalle;

        // operacion_financiera_detalle = new OperacionFinancieraDetalle(detalle[i]);

        for (let i = 0; i < detalle.length; i++) {

            console.log(detalle[i]);

            operacion_financiera_detalle = new OperacionFinancieraDetalle(detalle[i]);
            operacion_financiera_detalle.operacion_financiera = modelo.id;
            operacion_financiera_detalle.persona = modelo.persona;

            await operacion_financiera_detalle.save(opts);
        }

        await session.commitTransaction();
        session.endSession();

        logger.report.info('Transaccion Ok.');

        return res.json({
            ok: true,
            msg: 'Transaccion Ok.'
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.log(error)

        logger.report.error('Transaccion NO Ok.');

        return res.status(500).json({
            ok: false,
            msg: 'Transaccion NO Ok.'
        });
    }
}

const listar_operaciones_financieras = async(req, res) => {

    // const { id } = req.body;
    const id_persona = req.params.id_persona;

    try {

        const lista = await OperacionFinanciera.find({ "persona": id_persona, "estado": { $in: ["Previgente", "Vigente"] }, "es_borrado": false });

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

const listar_operacion_financiera = async(req, res) => {

    // const { id } = req.body;
    const id_operacion_financiera = req.params.id_operacion_financiera;

    // console.log(id_operacion_financiera)

    try {

        const modelo = await OperacionFinanciera.findOne({ "_id": id_operacion_financiera, "es_borrado": false })

        res.json({
            ok: true,
            modelo
        })
    } catch (error) {

        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado.'
        });
    }
}

module.exports = {
    crear,
    listar_operaciones_financieras,
    listar_operacion_financiera
}