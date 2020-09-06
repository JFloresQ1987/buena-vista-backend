const { Router } = require('express');
// const { check } = require('express-validator');
// const { validarCampos } = require('../../../middlewares/validar-campos');
const { validarJWT } = require('../../../middlewares/validar-jwt');
const { listar_operaciones_financieras_detalle } = require('../../../controllers/core/registro/operacion-financiera-detalle.controller');

const router = Router();

router.get('/listar/:id_operacion_financiera', validarJWT, listar_operaciones_financieras_detalle);

module.exports = router;