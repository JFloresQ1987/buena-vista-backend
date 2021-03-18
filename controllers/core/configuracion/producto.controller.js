const { response } = require('express');
const dayjs = require('dayjs');
const logger = require('../../../helpers/logger');
const { getMessage } = require('../../../helpers/messages');
const Producto = require('../../../models/core/configuracion/producto.model');

const listar = async(req, res) => {

    const es_todo = req.params.es_todo;
    const es_prestamo = req.params.es_prestamo;

    // console.log(es_todo)
    // console.log(es_prestamo)

    try {

        // const lista = await Producto.find({ "es_prestamo": es_prestamo, "es_borrado": false })

        let lista = [];

        if (es_todo === 'true')
            lista = await Producto.find({ /*"es_vigente": true, */ "es_borrado": false })
        else
            lista = await Producto.find({ "es_prestamo": es_prestamo /*, "es_vigente": true*/ , "es_borrado": false })

        res.json({
            ok: true,
            lista
        })
    } catch (error) {

        const controller = "producto.controller.js -> listar";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

const listar_programacion = async(req, res) => {

    const id = req.params.id;

    try {

        const modelo = await Producto.findById(id)

        res.json({
            ok: true,
            lista: modelo.programacion,
            configuracion: modelo.configuracion
        })
    } catch (error) {

        const controller = "producto.controller.js -> listar_programacion";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

module.exports = {
    listar,
    listar_programacion
}