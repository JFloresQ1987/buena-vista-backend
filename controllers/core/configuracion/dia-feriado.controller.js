const { response } = require("express");
const dayjs = require("dayjs");
const logger = require('../../../helpers/logger');
const { getMessage } = require('../../../helpers/messages');
const DiaFeriado = require("../../../models/core/configuracion/dia-feriado.model");

const listar_solo_fechas_feriado = async(req, res = response) => {

    try {

        const now = dayjs();
        const anio = now.format('YYYY');

        const lista = await DiaFeriado.find({ anio: anio, es_vigente: true, es_borrado: false }, "fecha_feriado");

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

module.exports = {
    listar_solo_fechas_feriado
};