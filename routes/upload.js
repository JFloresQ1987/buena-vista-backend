const { Router } = require('express');
const expressFileupload = require('express-fileupload');
const { validarJWT } = require('../middlewares/validar-jwt');
const { fileUpload, readFile } = require('../controllers/upload');

const router = Router();

router.use(expressFileupload());

router.get('/:documento', readFile);
router.put('/:id', validarJWT, fileUpload);

module.exports = router;