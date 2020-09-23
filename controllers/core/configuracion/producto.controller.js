const { response } = require('express');
const logger = require('../../../helpers/logger');
const Producto = require('../../../models/core/configuracion/producto.model');

const listar = async(req, res) => {

    try {

        const lista = await Producto.find({ "es_borrado": false })

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

        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado.'
        });
    }
}

module.exports = {
    listar,
    listar_programacion
}