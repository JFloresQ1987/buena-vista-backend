const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../../../middlewares/validar-campos');
const { validarJWT, validarAuthorization } = require('../../../middlewares/validar-jwt');
const { listar_solo_fechas_feriado } = require('../../../controllers/core/configuracion/dia-feriado.controller');

const router = Router();

router.get('/lista-feriados', [validarJWT, validarAuthorization], listar_solo_fechas_feriado);

module.exports = router;