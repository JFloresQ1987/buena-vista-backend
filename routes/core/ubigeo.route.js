const { Router } = require("express");

const {
  listarDepartamentos,
  listarProvinciasxDepartamento,
  listarDistritosxProvincia,
  crear,
} = require("../../controllers/core/ubigeo.controller");
//const { validarJWT } = require('../../../middlewares/validar-jwt');
const { validarJWT } = require("../../middlewares/validar-jwt");

const router = Router();

router.get("/", validarJWT, listarDepartamentos);
router.get("/:departamento", validarJWT, listarProvinciasxDepartamento);
router.get("/:departamento/:provincia", validarJWT, listarDistritosxProvincia);
//router.post("/", validarJWT, crear);

module.exports = router;
