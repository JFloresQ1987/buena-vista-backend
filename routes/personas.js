const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { listar, crear } = require('../controllers/personas');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = Router();

router.get('/', validarJWT, listar);

router.post('/', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').notEmpty(),
    check('apellido_paterno', 'El apellido paterno es obligatorio').notEmpty(),
    check('apellido_materno', 'El apellido materno es obligatorio').notEmpty(),
    validarCampos
], crear);

module.exports = router;