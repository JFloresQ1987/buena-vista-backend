const { Router } = require('express');
const { validarJWT } = require('../../../middlewares/validar-jwt');
const { listarConceptos, listarSubConceptos } = require('../../../controllers/core/configuracion/pago-concepto.controller')
const router = Router();

router.get('/:es_ingreso', validarJWT, listarConceptos);
router.get('/subconceptos/:id', validarJWT, listarSubConceptos);

module.exports = router;