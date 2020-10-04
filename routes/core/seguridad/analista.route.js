const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../../../middlewares/validar-campos');
const { validarJWT, validarAuthorization } = require('../../../middlewares/validar-jwt');
const { listar, crear, getAnalista, actualizar, getListaDesplegablexProducto } = require("../../../controllers/core/seguridad/analista.controller");

const router = Router();

// ============================
// Obtener todos los socios/personas
// ============================

router.get('/', [validarJWT, validarAuthorization], listar);
router.get('/lista-desplegable-por-producto/:producto', [validarJWT, validarAuthorization], getListaDesplegablexProducto);
router.get('/:id', [validarJWT, validarAuthorization], getAnalista);
router.put('/:id', [validarJWT, validarAuthorization], actualizar);
router.post('/', [validarJWT, validarAuthorization], crear);

module.exports = router;