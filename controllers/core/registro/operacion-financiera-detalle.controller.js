const { response } = require("express");
const logger = require("../../../helpers/logger");
const OperacionFinancieraDetalle = require("../../../models/core/registro/operacion-financiera-detalle.model");
// const dayjs = require('dayjs');

const listar_operaciones_financieras_detalle = async (req, res) => {
  // const { id_operacion_financiera } = req.body;
  const id_operacion_financiera = req.params.id_operacion_financiera;

  try {
    const lista = await OperacionFinancieraDetalle.find({
      operacion_financiera: id_operacion_financiera,
      es_borrado: false,
      es_vigente: true,
    }).sort({ numero_cuota: 1 });

    res.json({
      ok: true,
      lista,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Error inesperado.",
    });
  }
};

const obtener_operacion_financiera_detalle = async (req, res) => {
  try {
    const id = req.params.id;
    const operacion_financiera_detalle = await OperacionFinancieraDetalle.findById(
      id
    );
    return res.json({
      ok: true,
      operacion_financiera_detalle,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error inesperado",
    });
  }
};

const actualizar_operacion_financiera_detalle = async (req, res) => {
  try {
    const id = req.params.id;
    const operacion_financiera_detalle = await OperacionFinancieraDetalle.findById(
      id
    );
    operacion_financiera_detalle.ingresos.monto_amortizacion_capital =
      req.body.cuota_pago_capital;
    operacion_financiera_detalle.ingresos.monto_interes =
      req.body.cuota_pago_interes;
    operacion_financiera_detalle.ahorros.monto_ahorro_programado =
      req.body.cuota_ahorro_programado;

    await operacion_financiera_detalle.save();
    return res.json({
      ok: true,
      msg: "cuota actualizada",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error inesperado",
    });
  }
};

const operacion_financiera_detalle_baja = async (req, res) => {
  const id = req.params.id;
  const operacion_financiera_detalle = await OperacionFinancieraDetalle.findById(
    id
  );

  operacion_financiera_detalle.es_vigente = false;
  operacion_financiera_detalle.save();
  return res.json({
      ok:false,
      msg:'Cuota dada de baja'
  })
};

module.exports = {
  listar_operaciones_financieras_detalle,
  obtener_operacion_financiera_detalle,
  actualizar_operacion_financiera_detalle,
  operacion_financiera_detalle_baja
};
