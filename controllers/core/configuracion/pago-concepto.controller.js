const { response } = require("express");
const PagoConcepto = require("../../../models/core/configuracion/pago-concepto.model");

const listarConceptos = async (req, res = response) => {
  let es_ingreso = false;
  const flag = req.params.es_ingreso;
  if (flag == "i") {
    es_ingreso = true;
  }
  const conceptos = await PagoConcepto.find(
    { es_ingreso: es_ingreso },
    "id descripcion es_ingreso"
  );
  return res.json({
    ok: true,
    conceptos,
  });
};

const listarSubConceptos = async (req, res = response) => {
  const id = req.params.id;
  const subconceptos = await PagoConcepto.findById(id);
  const { sub_conceptos } = subconceptos;
  return res.json({
    ok: true,
    sub_conceptos,
  });
};

module.exports = {
  listarConceptos,
  listarSubConceptos,
};
