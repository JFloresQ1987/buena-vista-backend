const { response } = require('express');
const Persona = require('../../../models/core/registro/persona.model');

const listar = async(req, res) => {

    const modelo = await Persona.find({ "es_borrado": false });

    res.json({
        ok: true,
        modelo
    })
}

const crear = async(req, res = response) => {

    const { documento_identidad, comentario } = req.body;

    try {

        const existe_registro = await Persona.findOne({ documento_identidad });

        if (existe_registro) {

            return res.status(400).json({
                ok: false,
                msg: 'La persona ya esta registrado.'
            });
        }

        const modelo = new Persona(req.body);
        modelo.comentario = [comentario];
        await modelo.save();

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

const buscar_por_documento_identidad = async(req, res) => {

    try {

        const documento_identidad = req.params.documento_identidad;
        const modelo = await Persona.findOne({ "documento_identidad": documento_identidad, "es_borrado": false });

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
    listar,
    crear,
    buscar_por_documento_identidad
}