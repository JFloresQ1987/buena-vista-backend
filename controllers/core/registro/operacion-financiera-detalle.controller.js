const { response } = require('express');
const logger = require('../../../helpers/logger');
const OperacionFinancieraDetalle = require('../../../models/core/registro/operacion-financiera-detalle.model');
// const dayjs = require('dayjs');

const listar_operaciones_financieras_detalle = async(req, res) => {

    // const { id_operacion_financiera } = req.body;
    const id_operacion_financiera = req.params.id_operacion_financiera;

    try {

        const lista = await OperacionFinancieraDetalle.find({ "operacion_financiera": id_operacion_financiera, "es_borrado": false })
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

module.exports = {

    listar_operaciones_financieras_detalle
}