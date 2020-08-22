const { response } = require('express');
const Persona = require('../models/persona');

const listar = async(req, res) => {

    const modelo = await Persona.find({ "es_borrado": false });

    res.json({
        ok: true,
        modelo
    })
}

const crear = async(req, res = response) => {

    const { documento_identidad } = req.body;

    try {

        const existe_registro = await Persona.findOne({ documento_identidad });

        if (existe_registro) {

            return res.status(400).json({
                ok: false,
                msg: 'La persona ya esta registrado.'
            });
        }

        const modelo = new Persona(req.body);
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

module.exports = {
    listar,
    crear
}