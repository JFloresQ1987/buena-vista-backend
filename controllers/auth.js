const { response } = require('express');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario');
const { generarJWT } = require('../helpers/jwt');

const login = async(req, res = respone) => {

    const { usuario, clave } = req.body;

    try {

        const modeloDB = await Usuario.findOne({ usuario });

        if (!modeloDB) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario y/o clave incorrectos.'
            });
        }

        const clave_valido = bcrypt.compareSync(clave, modeloDB.clave);

        if (!clave_valido) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario y/o clave incorrectos.'
            });
        }

        const token = await generarJWT(modeloDB.id);

        res.json({
            ok: true,
            token
        });

    } catch (error) {

        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Token no es correcto.'
        });
    }
}

const renovar_token = async(req, res = respone) => {

    const id = req.id;

    const token = await generarJWT(id);

    const usuario = await Usuario.findById({ _id: id })
        .populate('persona', 'nombre apellido_paterno apellido_materno fecha_nacimiento es_masculino correo_electronico avatar');

    res.json({
        ok: true,
        token,
        usuario
    });
}

module.exports = {
    login,
    renovar_token
}