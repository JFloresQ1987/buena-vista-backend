const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../../../middlewares/validar-campos');
const { validarJWT } = require('../../../middlewares/validar-jwt');
const {
    crear,
    listar_operaciones_financieras,
    listar_operacion_financiera,
    listar_operaciones_financieras_por_analista,
    cambiar_analista,
    anular,
    congelar_descongelar
} = require('../../../controllers/core/registro/operacion-financiera.controller');

const router = Router();

router.get('/listar-productos/:id_persona/:opcion/:estado', validarJWT, listar_operaciones_financieras);

router.get('/listar-productos-por-analista', validarJWT, listar_operaciones_financieras_por_analista);

router.get('/listar-producto/:id_operacion_financiera', validarJWT, listar_operacion_financiera);

router.post('/', [
    validarJWT,
    check('producto', 'El producto es obligatorio').notEmpty(),
    // check('numero_ciclo', 'El número de ciclo es obligatorio').notEmpty(),
    // check('tasa_aporte_inicial', 'La tasa de aporte inicial es obligatorio').notEmpty(),
    // check('tasa_aporte_capital', 'La tasa de aporte capital es obligatorio').notEmpty(),
    // check('tasa_aporte_programado', 'La tasa de aporte programado es obligatorio').notEmpty(),
    // check('tasa_interes', 'La tasa de interes es obligatorio').notEmpty(),
    // check('tasa_mora', 'La tasa de mora es obligatorio').notEmpty(),
    check('configuracion', 'La configuración es obligatorio').notEmpty(),
    check('persona', 'El socio es obligatorio').notEmpty(),
    check('comentario', 'El comentario es obligatorio').notEmpty(),
    validarCampos
], crear);

router.put("/cambiar-analista/:id", [validarJWT], cambiar_analista);

router.put("/anular/:id", [validarJWT], anular);

router.put("/congelar_descongelar/:id", [validarJWT], congelar_descongelar);

// router.get('/buscar_socio/:documento_identidad', validarJWT, buscar_por_documento_identidad);

module.exports = router;