const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../../../middlewares/validar-campos');
const { listar, crear } = require('../../../controllers/core/registro/personas');
const { validarJWT } = require('../../../middlewares/validar-jwt');

const router = Router();

router.get('/', validarJWT, listar);

router.post('/', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').notEmpty(),
    check('apellido_paterno', 'El apellido paterno es obligatorio').notEmpty(),
    check('apellido_materno', 'El apellido materno es obligatorio').notEmpty(),
    check('documento_identidad', 'El documento de identidad es obligatorio').notEmpty(),
    check('fecha_nacimiento', 'La fecha de nacimiento es obligatorio').notEmpty(),
    check('es_masculino', 'La fecha de nacimiento es obligatorio').notEmpty(),
    check('domicilio', 'El domicilio es obligatorio').notEmpty(),
    check('referencia_domicilio', 'La referencia del domicilio es obligatorio').notEmpty(),
    validarCampos
], crear);

module.exports = router;