const { response } = require("express");
const dayjs = require('dayjs');
const logger = require('../../helpers/logger');
const { getMessage } = require('../../helpers/messages');
const Ubigeo = require("../../models/core/ubigeo.model");
const mongoose = require("mongoose");

const listarDepartamentos = async(req, res = response) => {

    try {
        const departamentos = await Ubigeo.find({}, "departamento _id");
        res.json({
            ok: true,
            departamentos,
        });
    } catch (e) {

        const controller = "ubigeo.controller.js -> listarDepartamentos";
        logger.logError(controller, req, error);

        res.status(500).json({
            ok: false,
            msg: e.message,
        });
    }
};

const crear = async(req, res = response) => {
    try {
        const ubigeo = new Ubigeo(req.body);
        await ubigeo.save();

        res.json({
            ok: true,
            msg: "Departamento creado correctamente",
        });
    } catch (error) {

        const controller = "ubigeo.controller.js -> crear";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const listarProvinciasxDepartamento = async(req, res = response) => {
    try {
        const departamento = req.params.departamento;
        const de = await Ubigeo.findById(
            departamento,
            "provincias.provincia provincias._id"
        );
        const { provincias } = de;
        res.json({
            ok: true,
            provincias,
        });
    } catch (e) {

        const controller = "ubigeo.controller.js -> listarProvinciasxDepartamento";
        logger.logError(controller, req, error);

        res.status(500).json({
            ok: false,
            msg: e.message,
        });
    }
};

const listarDistritosxProvincia = async(req, res = response) => {
    try {
        const departamento = req.params.departamento;
        const pro = req.params.provincia;
        const de = await Ubigeo.findById(departamento);
        const { provincias } = de;
        provincias.forEach((p) => {
            if (p._id == pro) {
                return res.json({
                    ok: true,
                    distritos: p.distritos
                })
            }
        });
    } catch (e) {

        const controller = "ubigeo.controller.js -> listarDistritosxProvincia";
        logger.logError(controller, req, error);

        res.status(500).json({
            ok: false,
            msg: e.message,
        });
    }
};

module.exports = {
    listarDepartamentos,
    listarProvinciasxDepartamento,
    listarDistritosxProvincia,
    crear,
};