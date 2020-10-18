const { Router } = require("express");
const { check } = require("express-validator");
const { validarCampos } = require("../../../middlewares/validar-campos");
const { validarJWT } = require("../../../middlewares/validar-jwt");
const {
    listar,
    listar_operaciones_financieras_detalle_vigentes,
    registrarIngresoEgreso,
    pagar_operacion_financiera,
    desembolsar_operacion_financiera,
    anular_recibo,
    pagar_operacion_financiera_por_analista
} = require("../../../controllers/core/caja/operacion-financiera-pago.controller");

const router = Router();

router.get(
    "/listar/:id_operacion_financiera",
    validarJWT,
    listar_operaciones_financieras_detalle_vigentes
);

router.get(
    "/listar_pagos",
    validarJWT,
    listar
);

router.post(
    "/pagar", [
        validarJWT,
        // check('documento_identidad', 'El documento de identidad es obligatorio').notEmpty(),
        // check('nombre', 'El nombre es obligatorio').notEmpty(),
        // check('apellido_paterno', 'El apellido paterno es obligatorio').notEmpty(),
        // check('apellido_materno', 'El apellido materno es obligatorio').notEmpty(),
        // check('fecha_nacimiento', 'La fecha de nacimiento es obligatorio').notEmpty(),
        // check('es_masculino', 'La fecha de nacimiento es obligatorio').notEmpty(),
        // check('domicilio', 'El domicilio es obligatorio').notEmpty(),
        // check('referencia_domicilio', 'La referencia del domicilio es obligatorio').notEmpty(),
        // check('comentario', 'El comentario es obligatorio').notEmpty(),
        validarCampos,
    ],
    pagar_operacion_financiera
);

router.post("/registrar-ingreso-egreso", [validarJWT], registrarIngresoEgreso);
router.put("/desembolsar/:id", [validarJWT], desembolsar_operacion_financiera);
router.put("/anular-recibo/:id", [validarJWT], anular_recibo);
// router.post('/pagar/:id_operacion_financiera', [
//     validarJWT,
//     // check('documento_identidad', 'El documento de identidad es obligatorio').notEmpty(),
//     // check('nombre', 'El nombre es obligatorio').notEmpty(),
//     // check('apellido_paterno', 'El apellido paterno es obligatorio').notEmpty(),
//     // check('apellido_materno', 'El apellido materno es obligatorio').notEmpty(),
//     // check('fecha_nacimiento', 'La fecha de nacimiento es obligatorio').notEmpty(),
//     // check('es_masculino', 'La fecha de nacimiento es obligatorio').notEmpty(),
//     // check('domicilio', 'El domicilio es obligatorio').notEmpty(),
//     // check('referencia_domicilio', 'La referencia del domicilio es obligatorio').notEmpty(),
//     // check('comentario', 'El comentario es obligatorio').notEmpty(),
//     validarCampos
// ], pagar_operacion_financiera);

router.post(
    "/pre-pagar-por-analista", [
        validarJWT,
        // check('documento_identidad', 'El documento de identidad es obligatorio').notEmpty(),
        // check('nombre', 'El nombre es obligatorio').notEmpty(),
        // check('apellido_paterno', 'El apellido paterno es obligatorio').notEmpty(),
        // check('apellido_materno', 'El apellido materno es obligatorio').notEmpty(),
        // check('fecha_nacimiento', 'La fecha de nacimiento es obligatorio').notEmpty(),
        // check('es_masculino', 'La fecha de nacimiento es obligatorio').notEmpty(),
        // check('domicilio', 'El domicilio es obligatorio').notEmpty(),
        // check('referencia_domicilio', 'La referencia del domicilio es obligatorio').notEmpty(),
        // check('comentario', 'El comentario es obligatorio').notEmpty(),
        validarCampos,
    ],
    pagar_operacion_financiera_por_analista
);

module.exports = router;