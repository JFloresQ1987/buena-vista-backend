const { response } = require('express');
const bcrypt = require('bcryptjs');
const dayjs = require('dayjs');
const logger = require('../../helpers/logger');
const { getMessage } = require('../../helpers/messages');
const { generarJWT } = require('../../helpers/jwt');
const { getMenu } = require('../../helpers/sidebar');
const Usuario = require('../../models/core/seguridad/usuario.model');

const login = async(req, res = respone) => {

    const { usuario, clave } = req.body;

    try {

        const modelo = await Usuario.findOne({ usuario });

        if (!modelo) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario y/o clave incorrectos.'
            });
        }

        if (!modelo.es_vigente || modelo.es_borrado) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario y/o clave incorrectos.'
            });
        }

        const clave_valido = bcrypt.compareSync(clave, modelo.clave);

        if (!clave_valido) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario y/o clave incorrectos.'
            });
        }

        if (modelo.es_bloqueado) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario bloqueado, comunicarse con el administrador.'
            });
        }

        const token = await generarJWT(modelo.id);

        res.json({
            ok: true,
            token,
            debe_cambiar_clave_inicio_sesion: modelo.debe_cambiar_clave_inicio_sesion
        });

    } catch (error) {

        logger.logError(req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgErrorToken')
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
        usuario,
        debe_cambiar_clave_inicio_sesion: usuario.debe_cambiar_clave_inicio_sesion,
        menu: getMenu(usuario.rol)
    });
}

module.exports = {
    login,
    renovar_token
}