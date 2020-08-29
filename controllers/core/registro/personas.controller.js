const { response } = require('express');
const Persona = require('../../../models/core/registro/persona.model');
const dayjs = require('dayjs');

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

        // console.log(now.format());

        const modelo = new Persona(req.body);
        const now = dayjs();

        modelo.comentario = [{
            tipo: 'Nuevo',
            usuario: req.header('id_usuario_sesion'),
            usuario: req.header('usuario_sesion'),
            nombre: req.header('nombre_sesion'),
            fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
            comentario
        }];
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
        const persona = await Persona.findOne({ "documento_identidad": documento_identidad, "es_borrado": false });

        // const now = dayjs();

        // console.log(now.format('DD/MM/YYYY hh:mm:ss a'));

        res.json({
            ok: true,
            persona
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