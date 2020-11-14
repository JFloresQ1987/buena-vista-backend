const { Router } = require('express');
// const { check } = require('express-validator');
// const { validarCampos } = require('../../../middlewares/validar-campos');
const { validarJWT } = require('../../../middlewares/validar-jwt');
const { listar_operaciones_financieras_detalle, obtener_operacion_financiera_detalle, actualizar_operacion_financiera_detalle, operacion_financiera_detalle_baja } = require('../../../controllers/core/registro/operacion-financiera-detalle.controller');

const router = Router();

router.get('/listar/:id_operacion_financiera', validarJWT, listar_operaciones_financieras_detalle);
router.get('/:id', validarJWT, obtener_operacion_financiera_detalle);
router.put('/:id', validarJWT, actualizar_operacion_financiera_detalle);
router.get('/cuota_baja/:id', validarJWT, operacion_financiera_detalle_baja);

module.exports = router;