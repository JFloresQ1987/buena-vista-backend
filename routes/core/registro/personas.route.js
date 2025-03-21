const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../../../middlewares/validar-campos');
const { validarJWT } = require('../../../middlewares/validar-jwt');
const { listar, crear, actualizar, buscar_por_documento_identidad, 
    buscar_id, buscar_por_nombre, buscar_por_apellido, buscar_por_apellido_mat, datos_persona_reporte } = require('../../../controllers/core/registro/personas.controller');

const router = Router();

// ============================
// Obtener todos los socios/personas
// ============================

router.get('/', validarJWT, listar);


// ============================
// Crear socio/persona
// ============================

router.post('/', [
    validarJWT,
    check('documento_identidad', 'El documento de identidad es obligatorio').notEmpty(),
    check('nombre', 'El nombre es obligatorio').notEmpty(),
    check('apellido_paterno', 'El apellido paterno es obligatorio').notEmpty(),
    check('apellido_materno', 'El apellido materno es obligatorio').notEmpty(),
    check('fecha_nacimiento', 'La fecha de nacimiento es obligatorio').notEmpty(),
    check('es_masculino', 'La fecha de nacimiento es obligatorio').notEmpty(),
    check('domicilio', 'El domicilio es obligatorio').notEmpty(),
    check('referencia_domicilio', 'La referencia del domicilio es obligatorio').notEmpty(),
    check('comentario', 'El comentario es obligatorio').notEmpty(),
    validarCampos
], crear);


// ============================
// Obtener socio/persona por DNI
// ============================

router.get('/buscar_socio/:documento_identidad', validarJWT, buscar_por_documento_identidad);

router.get('/buscar_socio_nombre/:termino', validarJWT, buscar_por_nombre);

router.get('/buscar_socio_apellido/:termino', validarJWT, buscar_por_apellido);

router.get('/buscar_socio_apellido_mat/:termino', validarJWT, buscar_por_apellido_mat);
// ============================
// Actualizar/editar socio/persona por DNI
// ============================

router.get('/:id', validarJWT, buscar_id);
router.get('/datos-reporte/:id', validarJWT, datos_persona_reporte);

router.put('/:id', [
    validarJWT,
    check('documento_identidad', 'El documento de identidad es obligatorio').notEmpty(),
    check('nombre', 'El nombre es obligatorio').notEmpty(),
    check('apellido_paterno', 'El apellido paterno es obligatorio').notEmpty(),
    check('apellido_materno', 'El apellido materno es obligatorio').notEmpty(),
    check('fecha_nacimiento', 'La fecha de nacimiento es obligatorio').notEmpty(),
    check('es_masculino', 'La fecha de nacimiento es obligatorio').notEmpty(),
    check('domicilio', 'El domicilio es obligatorio').notEmpty(),
    check('referencia_domicilio', 'La referencia del domicilio es obligatorio').notEmpty(),
    check('comentario', 'El comentario es obligatorio').notEmpty(),
    validarCampos
], actualizar);


module.exports = router;