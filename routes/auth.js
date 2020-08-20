const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { login, renovar_token } = require('../controllers/auth');

const router = Router();

router.post('/',
    [
        check('usuario', 'El usuario es obligatorio').notEmpty(),
        check('clave', 'La clave es obligatorio').notEmpty(),
        validarCampos
    ], login);

router.get('/renovar_token',validarJWT, renovar_token);

module.exports = router;