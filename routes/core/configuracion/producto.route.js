const { Router } = require('express');
// const { check } = require('express-validator');
// const { validarCampos } = require('../../../middlewares/validar-campos');
const { validarJWT } = require('../../../middlewares/validar-jwt');
const { listar, listar_programacion } = require('../../../controllers/core/configuracion/producto.controller');

const router = Router();

router.get('/listar/:es_todo/:es_prestamo', validarJWT, listar);
router.get('/listar-programacion/:id', validarJWT, listar_programacion);

module.exports = router;