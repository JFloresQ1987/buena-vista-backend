const { response } = require("express");
const dayjs = require("dayjs");
const logger = require('../../../helpers/logger');
const { getMessage } = require('../../../helpers/messages');
const GrupoBancomunal = require("../../../models/core/registro/grupo-bancomunal.model");

const getListaDesplegable = async(req, res = response) => {

    try {

        const lista = await GrupoBancomunal.find({ es_vigente: true, es_borrado: false }, "id descripcion");

        res.json({
            ok: true,
            lista,
        });
    } catch (error) {

        const controller = "grupo-bancomunal.controller.js -> getListaDesplegable";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

module.exports = {
    getListaDesplegable
};