const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../../../middlewares/validar-campos');
const { validarJWT, validarAuthorization } = require('../../../middlewares/validar-jwt');
const { getListaDesplegable } = require('../../../controllers/core/registro/grupo-bancomunal.controller');

const router = Router();

router.get('/lista-desplegable', [validarJWT, validarAuthorization], getListaDesplegable);

module.exports = router;