const { response } = require("express");
const dayjs = require('dayjs');
const logger = require('../../../helpers/logger');
const { getMessage } = require('../../../helpers/messages');
const PagoConcepto = require("../../../models/core/configuracion/pago-concepto.model");

const listarConceptos = async(req, res = response) => {

    try {
        let es_ingreso = false;
        const flag = req.params.es_ingreso;
        if (flag == "i") {
            es_ingreso = true;
        }
        const conceptos = await PagoConcepto.find({ es_ingreso: es_ingreso },
            "id codigo descripcion es_ingreso"
        );
        return res.json({
            ok: true,
            conceptos,
        });

    } catch (error) {

        const controller = "pago-concepto.controller.js -> listarConceptos";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const listarSubConceptos = async(req, res = response) => {

    try {

        const id = req.params.id;
        const subconceptos = await PagoConcepto.findById(id);
        const { sub_conceptos } = subconceptos;
        return res.json({
            ok: true,
            sub_conceptos,
        });

    } catch (error) {

        const controller = "pago-concepto.controller.js -> listarSubConceptos";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

module.exports = {
    listarConceptos,
    listarSubConceptos,
};