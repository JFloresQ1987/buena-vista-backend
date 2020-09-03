const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../../../middlewares/validar-campos');
const { validarJWT } = require('../../../middlewares/validar-jwt');
const { crear, listar_operaciones_financieras } = require('../../../controllers/core/registro/operacion-financiera.controller');

const router = Router();

router.get('/listar/:id_persona', validarJWT, listar_operaciones_financieras);

router.post('/', [
    validarJWT,
    check('tipo', 'El tipo de operación es obligatorio').notEmpty(),
    check('numero_ciclo', 'El número de ciclo es obligatorio').notEmpty(),
    check('tasa_aporte_inicial', 'La tasa de aporte inicial es obligatorio').notEmpty(),
    check('tasa_aporte_capital', 'La tasa de aporte capital es obligatorio').notEmpty(),
    check('tasa_aporte_programado', 'La tasa de aporte programado es obligatorio').notEmpty(),
    check('tasa_interes', 'La tasa de interes es obligatorio').notEmpty(),
    check('tasa_mora', 'La tasa de mora es obligatorio').notEmpty(),
    check('persona', 'El socio es obligatorio').notEmpty(),
    check('comentario', 'El comentario es obligatorio').notEmpty(),
    validarCampos
], crear);

// router.get('/buscar_socio/:documento_identidad', validarJWT, buscar_por_documento_identidad);

module.exports = router;