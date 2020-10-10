const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../../../middlewares/validar-campos');
const { validarJWT, validarAuthorization } = require('../../../middlewares/validar-jwt');
const { listar, crear, getUsuario, actualizar, listarxRol, cambiarClaveAdministrador, cambiarClaveUsuario, cambiarVigencia } = require('../../../controllers/core/seguridad/usuarios.controller');

const { fake } = require('../../../controllers/test');

const router = Router();

router.post('/fake', fake);

router.get('/', validarJWT, listar);
router.get('/rol/:id', validarJWT, listarxRol);
router.get('/:id', validarJWT, getUsuario);

router.put('/cambiarclave/:id', [validarJWT, validarAuthorization], cambiarClaveAdministrador);
router.put('/cambiarclave/', validarJWT, cambiarClaveUsuario);
router.put('/cambiarvigencia/:id', validarJWT, cambiarVigencia);

router.post('/', [
    validarJWT,
    validarAuthorization,
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

router.put('/:id', [
    validarJWT,
    //validarAuthorization,
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

// router.put('/:id',
//     [
//         validarJWT,
//         check('nombre', 'El nombre es obligatorio').notEmpty(),
//         check('clave', 'La clave es obligatorio').notEmpty(),
//         check('correo', 'Tiene que ser un email').isEmail(),
//         validarCampos
//     ], actualizar);

module.exports = router;