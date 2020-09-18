const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../../../middlewares/validar-campos');
const { validarJWT } = require('../../../middlewares/validar-jwt');
const { actualizar } = require('../../../controllers/core/caja/caja-diario.controller');

const router = Router();

router.put('/:id', validarJWT, actualizar);





module.exports = router;