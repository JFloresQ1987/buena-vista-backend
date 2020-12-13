const Caja = require("../../models/core/seguridad/caja.model");
const CajaDiario = require("../../models/core/caja/caja-diario.model");
const OperacionFinanciera = require("../../models/core/registro/operacion-financiera.model");
const PagoOperacionFinanciera = require("../../models/core/caja/operacion-financiera-pago.model");
const OperacionFinancieraDetalle = require("../../models/core/registro/operacion-financiera-detalle.model");
const Analista = require("../../models/core/seguridad/analista.model");
const dayjs = require("dayjs");

const pagarAhorro = async(data) => {

    const recibo = data.data_validacion.recibo;
    const now = dayjs();

    // let monto_recibido_actual = data.monto_recibido;
    // let monto_ahorro_voluntario_a_pagar = data.monto_ahorro_voluntario;
    let monto_total = data.monto_recibido; //data.monto_ahorro_voluntario;
    // let monto_total_gasto = 0;
    // let monto_total_ahorro_inicial = 0;
    // let monto_total_ahorro_voluntario = 0;
    // let monto_total_ahorro_programado = 0;
    // let monto_total_amortizacion_capital = 0;
    // let monto_total_interes = 0;
    // let monto_total_mora = 0;

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
    cuota.fecha_cuota = now.format('DD/MM/YYYY');
    cuota.fecha_plazo_cuota = now.format('DD/MM/YYYY');
    cuota.fecha_plazo_cuota = now.format('DD/MM/YYYY');
    cuota.ejercicio = now.format('YYYY');
    cuota.ingresos.monto_gasto = 0;
    cuota.ahorros.monto_ahorro_voluntario = data.es_ingreso ? data.monto_recibido : 0;
    cuota.ahorros.monto_retiro_ahorro_voluntario = data.es_ingreso ? 0 : data.monto_recibido;

    cuota.pagos.push({
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

    // console.log('entro 1')

    // // cuota.comentario.data.comentario;

    // console.log('entro 2')

    const cuota_guardada = await cuota.save();

    // const modelo = new PagoOperacionFinanciera();



    // modelo.comentario.push(data.comentario);

    // const cuota_x = await OperacionFinancieraDetalle.findById({ "_id": cuota_guardada.id })

    // // console.log('entro 3')

    // cuota_x.pagos.push({
    //     recibo: {
    //         local_atencion: recibo.local_atencion,
    //         serie: recibo.serie,
    //         numero: recibo.numero,
    //         fecha: recibo.fecha
    //     },
    //     // ingresos: {
    //     //     monto_gasto: 0,
    //     //     monto_amortizacion_capital: 0,
    //     //     monto_interes: 0,
    //     //     monto_mora: 0
    //     // },
    //     ahorros: {
    //         // monto_ahorro_inicial: 0,
    //         monto_ahorro_voluntario: data.es_ingreso ? data.monto_recibido : 0,
    //         monto_retiro_ahorro_voluntario: data.es_ingreso ? 0 : data.monto_recibido,
    //         // monto_ahorro_programado: 0,
    //     }
    // });

    // // console.log('entro 4')

    // await cuota_x.save();

    const model_operacion_financiera = await OperacionFinanciera.findById({ "_id": data.operacion_financiera })
        .populate({
            path: "producto.tipo",
            select: "codigo descripcion",
        })
        .populate({
            path: "persona",
            select: "nombre apellido_paterno apellido_materno documento_identidad",
        });
    /*.populate({
        path: "analista",
        select: "usuario nombre_usuario documento_identidad_usuario"                
    });*/

    // let analista;

    // if (model_operacion_financiera.analista)
    //     analista = await Analista.findById(model_operacion_financiera.analista);

    const modelo = new PagoOperacionFinanciera();

    modelo.es_ingreso = data.es_ingreso;

    modelo.diario = {
        caja_diario: data.data_validacion.caja_diario,
        caja: data.data_validacion.caja,
        cajero: data.data_validacion.cajero,
        estado: 'Abierto'
    };

    modelo.recibo = {
        estado: 'Vigente',
        local_atencion: recibo.local_atencion,
        documento_identidad_cajero: data.data_validacion.documento_identidad_cajero, //TODO verificar
        serie: recibo.serie,
        numero: recibo.numero,
        fecha: recibo.fecha,
        ejercicio: now.format('YYYY'),
        monto_total: monto_total, //.toFixed(1)
        frase: ''
    };

    // console.log(model_operacion_financiera)

    modelo.producto = {
        producto: model_operacion_financiera.producto.tipo, //TODO verificar
        codigo: model_operacion_financiera.producto.codigo, //TODO verificar
        descripcion: model_operacion_financiera.producto.descripcion, //TODO verificar
        codigo_programacion: model_operacion_financiera.producto.codigo_programacion, //TODO verificar
        descripcion_programacion: model_operacion_financiera.producto.descripcion_programacion, //TODO verificar
        persona: model_operacion_financiera.persona._id,
        nombre_persona: model_operacion_financiera.persona.apellido_paterno +
            ' ' + model_operacion_financiera.persona.apellido_materno +
            ', ' + model_operacion_financiera.persona.nombre, //TODO verificar
        documento_identidad_persona: model_operacion_financiera.persona.documento_identidad, //TODO verificar
        // analista: model_operacion_financiera.analista._id, //TODO verificar
        // nombre_analista: model_operacion_financiera.analista.nombre_usuario, //TODO verificar
        // documento_identidad_analista: model_operacion_financiera.analista.documento_identidad_usuario,
        operacion_financiera: data.operacion_financiera,

        // persona: data.id_socio,
        // operacion_financiera: data.operacion_financiera,
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
        monto_recibido: Number(data.monto_recibido), //monto_total_ahorro_voluntario,
        // monto_total_ahorro_programado: monto_total_ahorro_programado,
        // monto_total_amortizacion_capital: monto_total_amortizacion_capital,
        // monto_total_interes: monto_total_interes,
        // monto_total_mora: monto_total_mora,
        monto_total: Number(monto_total)
    };
};

module.exports = {
    pagarAhorro,
};