const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../../../middlewares/validar-campos');
const { validarJWT } = require('../../../middlewares/validar-jwt');
const { cargarCaja, cerrarCaja, listarCajas } = require('../../../controllers/core/caja/caja-diario.controller');

const router = Router();

router.put('/:id', validarJWT, cerrarCaja);

router.get('/:id', validarJWT, cargarCaja);

router.get('/', validarJWT, listarCajas);



module.exports = router;