const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../../../middlewares/validar-campos');
const { validarJWT } = require('../../../middlewares/validar-jwt');
const { cargarCaja, cerrarCaja, listarCajas, listarCajasPorFecha } = require('../../../controllers/core/caja/caja-diario.controller');
const { verificarTotalRecibo, verificarIntegridadRecibo, verificarIntegridadOperacionF } = require('../../../controllers/core/caja/verificador.controller')
const router = Router();
var fs = require ('fs');

router.put('/:id', validarJWT, cerrarCaja);

router.get('/caja', validarJWT, cargarCaja);

router.get('/', validarJWT, listarCajas);

router.get('/fecha/:fecha_apertura', validarJWT, listarCajasPorFecha);



// ================================ Ruta validacción (Temporal) ==============
router.get('/verificar-m',validarJWT, verificarTotalRecibo)

router.get('/verificar-r',validarJWT, verificarIntegridadRecibo)

router.get('/verificar-o',validarJWT, verificarIntegridadOperacionF)


module.exports = router;