const Caja = require("../../models/core/seguridad/caja.model");
const CajaDiario = require("../../models/core/caja/caja-diario.model");
const PagoOperacionFinanciera = require("../../models/core/caja/operacion-financiera-pago.model");
const dayjs = require("dayjs");

const validarPago = async (data) => {
  const caja = await Caja.findOne({
    ip: data.ip,
    usuario: data.id_usuario_sesion,
    es_vigente: true,
    es_borrado: false,
  });

  if (!caja)
    return {
      ok: false,
      msg: "Estación de trabajo y/o usuario no habilitados para hacer caja.",
    };
  // return res.status(404).json({
  //     ok: false,
  //     msg: 'Estación de trabajo y/o usuario no habilitados para hacer caja.'
  // })

  // const modelo = new PagoOperacionFinanciera(req.body);
  const now = dayjs();
  const fecha_apertura = now.format("DD/MM/YYYY");

  const ultimo_caja_diario = await CajaDiario.findOne({
    caja: caja.id,
    es_vigente: true,
    es_borrado: false,
  })
    .where("apertura.fecha_apertura")
    .ne(fecha_apertura)
    .sort({ $natural: -1 });

  if (ultimo_caja_diario) {
    if (ultimo_caja_diario.estado === "Abierto") {
      return {
        ok: false,
        msg: "Existe caja diario abierto, cierre antes de continuar.",
      };
      // return res.status(404).json({
      //     ok: false,
      //     msg: 'Existe caja diario abierto, cierre antes de continuar.'
      // })
    }
  }

  let caja_diario = await CajaDiario.findOne({
    caja: caja.id,
    "apertura.fecha_apertura": fecha_apertura,
    es_vigente: true,
    es_borrado: false,
  });

  if (caja_diario) {
    if (caja_diario.estado === "Cerrado") {
      return {
        ok: false,
        msg: "Caja diario ya se encuentra cerrado.",
      };
      // return res.status(404).json({
      //     ok: false,
      //     msg: 'Caja diario ya se encuentra cerrado.'
      // })
    }
  }

  if (!caja_diario) {
    const apertura_caja_diario = new CajaDiario();
    apertura_caja_diario.caja = caja.id;
    apertura_caja_diario.estado = "Abierto";
    apertura_caja_diario.apertura.fecha_apertura = fecha_apertura;

    if (ultimo_caja_diario) {
      apertura_caja_diario.apertura.cantidad_diez_centimos_apertura =
        ultimo_caja_diario.cierre.cantidad_diez_centimos_cierre;
      apertura_caja_diario.apertura.cantidad_veinte_centimos_apertura =
        ultimo_caja_diario.cierre.cantidad_veinte_centimos_cierre;
      apertura_caja_diario.apertura.cantidad_cincuenta_centimos_apertura =
        ultimo_caja_diario.cierre.cantidad_cincuenta_centimos_cierre;
      apertura_caja_diario.apertura.cantidad_un_sol_apertura =
        ultimo_caja_diario.cierre.cantidad_un_sol_cierre;
      apertura_caja_diario.apertura.cantidad_cinco_soles_apertura =
        ultimo_caja_diario.cierre.cantidad_cinco_soles_cierre;
      apertura_caja_diario.apertura.cantidad_diez_soles_apertura =
        ultimo_caja_diario.cierre.cantidad_diez_soles_cierre;
      apertura_caja_diario.apertura.cantidad_veinte_soles_apertura =
        ultimo_caja_diario.cierre.cantidad_veinte_soles_cierre;
      apertura_caja_diario.apertura.cantidad_cincuenta_soles_apertura =
        ultimo_caja_diario.cierre.cantidad_cincuenta_soles_cierre;
      apertura_caja_diario.apertura.cantidad_dos_soles_apertura =
        ultimo_caja_diario.cierre.cantidad_dos_soles_cierre;
      apertura_caja_diario.apertura.cantidad_cien_soles_apertura =
        ultimo_caja_diario.cierre.cantidad_cien_soles_cierre;
      apertura_caja_diario.apertura.cantidad_discientos_soles_apertura =
        ultimo_caja_diario.cierre.cantidad_discientos_soles_cierre;
      apertura_caja_diario.monto_total_apertura =
        ultimo_caja_diario.monto_total_apertura +
        ultimo_caja_diario.monto_total_operaciones;
    }

    caja_diario = await apertura_caja_diario.save();
  }

  // let monto_recibido_actual = monto_recibido;
  // let monto_ahorro_voluntario_actual = monto_ahorro_voluntario;
  // let monto_total = 0;
  // let monto_total_gasto = 0;
  // let monto_total_ahorro_inicial = 0;
  // let monto_total_ahorro_voluntario = 0;
  // let monto_total_ahorro_programado = 0;
  // let monto_total_amortizacion_capital = 0;
  // let monto_total_interes = 0;
  // let monto_total_mora = 0;

  let dato_recibo = {
    serie_recibo: "001",
    numero_recibo: "I-00000001",
    fecha_recibo: now.format("DD/MM/YYYY hh:mm:ss a"),
  };

  const ultimo_pago = await PagoOperacionFinanciera.findOne({
    serie_recibo: "001",
    es_borrado: false,
  }).sort({ $natural: -1 });

  let correlativo_recibo = 1;

  if (ultimo_pago) {
    correlativo_recibo =
      parseInt(ultimo_pago.numero_recibo.split("-").pop()) + 1;
  }

  dato_recibo.numero_recibo = (data.es_ingreso
    ? "I-"
    : "E-") + correlativo_recibo.toString().padStart(8, "00000000");

  return {
    ok: true,
    caja_diario: caja_diario.id,
    caja: caja.id,
    dato_recibo,
  };
  // return res.json({
  //     ok: true,
  //     dato_recibo
  // })
};

module.exports = {
  validarPago,
};
