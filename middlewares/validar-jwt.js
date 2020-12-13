const jwt = require('jsonwebtoken');
const usuario = require('../models/core/seguridad/usuario.model');

const validarJWT = (req, res = response, next) => {

    const token = req.header('x-token');

    if (!token) {
        return res.status(404).json({
            ok: false,
            msg: 'No hay token en la petición.'
        });
    }

    try {

        const { id } = jwt.verify(token, process.env.JWT_SECRET);

        req.id = id;
        next();

    } catch (error) {

        return res.status(500).json({
            ok: false,
            msg: 'Token no válido.'
        });
    }
}

const validarAuthorization = async(req, res, next) => {

    const id = req.id;
    // const roles = rol ? rol : 'Administrador'

    try {

        const modelo = await usuario.findById(id);

        if (!modelo)
            res.status(404).json({
                ok: false,
                msg: 'Usuario no existe.'
            });

        // if (modelo.rol.includes(roles))
        if (modelo.rol.includes('Administrador') ||
            modelo.rol.includes('Analista') ||
            modelo.rol.includes('Cajero'))
            next();
        else
            res.status(404).json({
                ok: false,
                msg: 'Usuario no autorizado.'
            });

    } catch (error) {

        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Ocurrió un error inesperado.'
        });
    }
}

module.exports = {
    validarJWT,
    validarAuthorization
}