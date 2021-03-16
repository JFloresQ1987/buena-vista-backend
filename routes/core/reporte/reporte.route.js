const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../../../middlewares/validar-campos');
const { validarJWT } = require('../../../middlewares/validar-jwt');
const { consultar_saldo_credito } = require('../../../controllers/core/reporte/reporte.controller');

const router = Router();
// var fs = require ('fs');

router.get('/consultar-saldo-credito/:usuario/:analista/:desde/:hasta', validarJWT, consultar_saldo_credito);

module.exports = router;