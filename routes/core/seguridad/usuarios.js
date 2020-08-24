const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../../../middlewares/validar-campos');
const { listar, crear } = require('../../../controllers/core/seguridad/usuarios');
const { validarJWT, validarAuthorization } = require('../../../middlewares/validar-jwt');

const { fake } = require('../../../controllers/test');

const router = Router();

router.post('/fake', fake);

router.get('/', validarJWT, listar);

router.post('/', [
    validarJWT,
    validarAuthorization,
    check('usuario', 'El usuario es obligatorio').notEmpty(),
    check('clave', 'La clave es obligatorio').notEmpty(),
    check('debe_cambiar_clave_inicio_sesion', 'Debe cambiar clave es obligatorio').notEmpty(),
    validarCampos
], crear);

// router.put('/:id',
//     [
//         validarJWT,
//         check('nombre', 'El nombre es obligatorio').notEmpty(),
//         check('clave', 'La clave es obligatorio').notEmpty(),
//         check('correo', 'Tiene que ser un email').isEmail(),
//         validarCampos
//     ], actualizar);

module.exports = router;