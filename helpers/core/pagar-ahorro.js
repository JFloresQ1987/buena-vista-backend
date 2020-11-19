const Caja = require("../../models/core/seguridad/caja.model");
const CajaDiario = require("../../models/core/caja/caja-diario.model");
const OperacionFinanciera = require("../../models/core/registro/operacion-financiera.model");
const PagoOperacionFinanciera = require("../../models/core/caja/operacion-financiera-pago.model");
const OperacionFinancieraDetalle = require("../../models/core/registro/operacion-financiera-detalle.model");
const dayjs = require("dayjs");

const pagarAhorro = async(data) => {

    const recibo = data.data_validacion.recibo;

    // let monto_recibido_actual = data.monto_recibido;
    let monto_ahorro_voluntario_a_pagar = data.monto_ahorro_voluntario;
    let monto_total = data.monto_recibido; //data.monto_ahorro_voluntario;
    let monto_total_gasto = 0;
    let monto_total_ahorro_inicial = 0;
    let monto_total_ahorro_voluntario = 0;
    let monto_total_ahorro_programado = 0;
    let monto_total_amortizacion_capital = 0;
    let monto_total_interes = 0;
    let monto_total_mora = 0;

    // const modelo = new PagoOperacionFinanciera(data.modelo_pago_operacion_financiera);

    // modelo.comentario.push({
    //     tipo: 'Nuevo',
    //     id_usuario: req.header('id_usuario_sesion'),
    //     usuario: req.header('usuario_sesion'),
    //     nombre: req.header('nombre_sesion'),
    //     fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
    //     comentario: 'Se realizó desembolso'
    // });    

    const cuota = new OperacionFinancieraDetalle();

    cuota.operacion_financiera = data.operacion_financiera;
    cuota.persona = data.id_socio;
    cuota.estado = 'Vigente';
    cuota.numero_cuota = 0;
    cuota.nombre_dia_cuota = '';
    cuota.fecha_cuota = '01/01/2020';
    cuota.fecha_plazo_cuota = '01/01/2020';
    cuota.ingresos.monto_gasto = 0;
    cuota.ahorros.monto_ahorro_voluntario = data.es_ingreso ? data.monto_recibido : 0;
    cuota.ahorros.monto_retiro_ahorro_voluntario = data.es_ingreso ? 0 : data.monto_recibido;

    // console.log('entro 1')

    // // cuota.comentario.data.comentario;

    // console.log('entro 2')

    const cuota_guardada = await cuota.save();

    // const modelo = new PagoOperacionFinanciera();



    // modelo.comentario.push(data.comentario);

    const cuota_x = await OperacionFinancieraDetalle.findById({ "_id": cuota_guardada.id })

    // console.log('entro 3')

    cuota_x.pagos.push({
        recibo: {
            local_atencion: recibo.local_atencion,
            serie: recibo.serie,
            numero: recibo.numero,
            fecha: recibo.fecha
        },
        // ingresos: {
        //     monto_gasto: 0,
        //     monto_amortizacion_capital: 0,
        //     monto_interes: 0,
        //     monto_mora: 0
        // },
        ahorros: {
            // monto_ahorro_inicial: 0,
            monto_ahorro_voluntario: data.es_ingreso ? data.monto_recibido : 0,
            monto_retiro_ahorro_voluntario: data.es_ingreso ? 0 : data.monto_recibido,
            // monto_ahorro_programado: 0,
        }
    });

    // console.log('entro 4')

    await cuota_x.save();

    const modelo = new PagoOperacionFinanciera();

    modelo.es_ingreso = data.es_ingreso;

    modelo.diario = {
        caja_diario: data.data_validacion.caja_diario,
        caja: data.data_validacion.caja,
        estado: 'Abierto'
    };

    modelo.recibo = {
        estado: 'Vigente',
        local_atencion: recibo.local_atencion,
        serie: recibo.serie,
        numero: recibo.numero,
        fecha: recibo.fecha,
        ejercicio: '2020',
        monto_total: monto_total //.toFixed(1)
    };

    modelo.producto = {
        persona: data.id_socio,
        operacion_financiera: data.operacion_financiera,
        // monto_gasto: monto_total_gasto,
        // monto_ahorro_inicial: monto_total_ahorro_inicial,
        monto_ahorro_voluntario: data.es_ingreso ? data.monto_recibido : 0,
        monto_retiro_ahorro_voluntario: data.es_ingreso ? 0 : data.monto_recibido,
        // monto_ahorro_programado: monto_total_ahorro_programado,
        // monto_amortizacion_capital: monto_total_amortizacion_capital,
        // monto_interes: monto_total_interes,
        // monto_mora: monto_total_mora
    };

    modelo.comentario.push(data.comentario);

    await modelo.save();

    // const cuotas_pendientes = await OperacionFinancieraDetalle.findOne({ "operacion_financiera": data.operacion_financiera, "estado": { $in: ["Pendiente", "Amortizado"] }, "es_vigente": true, "es_borrado": false });

    const model_operacion_financiera = await OperacionFinanciera.findById({ "_id": data.operacion_financiera })
        .populate({
            path: "producto.tipo",
            select: "descripcion",
        })
        .populate({
            path: "analista",
            select: "usuario",
            populate: {
                path: "usuario",
                select: "persona",
                populate: {
                    path: "persona",
                    select: "nombre apellido_paterno apellido_materno",
                }
            }
        });

    // if (!cuotas_pendientes) {
    //     model_operacion_financiera.estado = 'Pagado';
    //     await model_operacion_financiera.save();
    // }

    return {
        ok: true,
        model_operacion_financiera: model_operacion_financiera,
        // cuota_menor: 0,
        // cuota_mayor: 0,
        // monto_total_gasto: monto_total_gasto,
        // monto_total_ahorro_inicial: monto_total_ahorro_inicial,
        monto_total_ahorro_voluntario: data.monto_recibido, //monto_total_ahorro_voluntario,
        // monto_total_ahorro_programado: monto_total_ahorro_programado,
        // monto_total_amortizacion_capital: monto_total_amortizacion_capital,
        // monto_total_interes: monto_total_interes,
        // monto_total_mora: monto_total_mora,
        monto_total: monto_total
    };
};

module.exports = {
    pagarAhorro,
};