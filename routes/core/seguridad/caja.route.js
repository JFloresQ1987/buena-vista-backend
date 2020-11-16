const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../../../middlewares/validar-campos');
const { validarJWT } = require('../../../middlewares/validar-jwt');
const { crear, listar, actualizar, buscar_caja } = require('../../../controllers/core/seguridad/caja.controller');

const router = Router();

router.post('/', [
    validarJWT,
    check('descripcion', 'La descripción es obligatoria').notEmpty(),
    check('ip', 'La ip es obligatoria').notEmpty(),
    check('pc_nombre', 'El nombre de la pc es obligatorio').notEmpty(),
    check('usuario', 'El usuario es obligatorio').notEmpty(),      
    check('serie','La serie es obligatoria').notEmpty(),
    check('local_atencion','El local de atención es obligatorio').notEmpty(),
    validarCampos
], crear);

router.get('/', validarJWT, listar)

router.put('/:id', [
    validarJWT,
    check('descripcion', 'La descripción es oblgatoria').notEmpty(),
    check('ip', 'La ip es obligatoria').notEmpty(),
    check('pc_nombre', 'El nombre de la pc es obligatorio').notEmpty(),
    check('usuario', 'El usuario es obligatorio').notEmpty(),
    check('es_caja_principal','el campo es requerido').notEmpty(),    
    check('serie','La serie es obligatoria').notEmpty(),
    check('local_atencion','El local de atención es obligatorio').notEmpty(),
    validarCampos
], actualizar);


router.get('/:id', validarJWT, buscar_caja)

module.exports = router;