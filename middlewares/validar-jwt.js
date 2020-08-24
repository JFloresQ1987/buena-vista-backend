const jwt = require('jsonwebtoken');
const usuario = require('../models/core/seguridad/usuario');

const validarJWT = (req, res = response, next) => {

    const token = req.header('x-token');

    if (!token) {
        return res.status(400).json({
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

    // console.log(id)

    try {

        const modelo = await usuario.findById(id);

        // console.log(modelo)

        if (!modelo)
            res.status(400).json({
                ok: false,
                msg: 'Usuario no existe.'
            });

        // console.log(modelo.rol.includes('Administrador'))

        if (modelo.rol.includes('Administrador2'))
            next();
        else
            res.status(400).json({
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