const { response } = require("express");
const dayjs = require("dayjs");
const Operaciones = require("../../../models/core/caja/operacion-financiera-pago.model");
const Caja = require("../../../models/core/seguridad/caja.model");
const CajaDiario = require("../../../models/core/caja/caja-diario.model");
const OperacionFinanciera = require("../../../models/core/registro/operacion-financiera-detalle.model");
const requestIp = require("request-ip");
const e = require("cors");

const verificarTotalRecibo = async(req, res = response) => {
    const id_usuario_sesion = req.header("id_usuario_sesion"); // "5f8236bedd1aaa4dc4109589"; //    
    const local_atencion = req.header("local_atencion");
    const ip = requestIp.getClientIp(req).replace("::ffff:", ""); // "192.168.0.10"; //

    const caja = await Caja.findOne({
        ip: ip,
        local_atencion: local_atencion,
        usuario: id_usuario_sesion,
        es_vigente: true,
        es_borrado: false,
    });

    const cajaDiario = await CajaDiario.findOne({
        caja: caja._id,
        estado: "Abierto",
        es_vigente: true,
        es_borrado: false,
    });

    const operaciones = await Operaciones.find({
            "diario.caja_diario": cajaDiario._id,
            "recibo.estado": "Vigente"
        },
        "recibo.numero recibo.monto_total producto es_ingreso concepto"
    );

    let control = true;
    let listaRecibosError = [];
    let listaMontoError = [];
    let listaReciboMontoTotalError = [];

    operaciones.forEach((e) => {
        let monto =
            Number((e.producto.monto_ahorro_voluntario -
                e.producto.monto_desembolso +
                e.producto.monto_ahorro_inicial +
                e.producto.monto_ahorro_programado +
                e.producto.monto_amortizacion_capital +
                e.producto.monto_interes +
                e.producto.monto_interes_ahorro +
                e.producto.monto_mora +
                e.producto.monto_gasto -
                e.producto.monto_retiro_ahorro_voluntario -
                e.producto.monto_retiro_ahorro_inicial -
                e.producto.monto_retiro_ahorro_programado -
                e.producto.monto_retiro_interes_ahorro).toFixed(2));

        if (e.es_ingreso == false) {
            monto = monto * -1;
        } else {
            monto;
        }

        // if (e.concepto.detalle != undefined) {
        if (e.concepto.descripcion != undefined) {
            // e.recibo.monto_total = monto;
            monto = e.recibo.monto_total;
        }

        if (e.recibo.monto_total != monto) {
            listaRecibosError.push(e.recibo.numero);
            listaMontoError.push(monto);
            listaReciboMontoTotalError.push(e.recibo.monto_total);
            control = false;
        }
    });

    if (!control) {
        return res.json({
            ok: false,
            msg: `La suma de los montos ${listaMontoError}, no coinciden con el monto total ${listaReciboMontoTotalError}, recibos: ${listaRecibosError}`,
            listaMontoError,
        });
    }

    return res.json({
        ok: true,
        msg: "Los montos coinciden!!!!!",
    });
};

const verificarIntegridadRecibo = async(req, res = response) => {
    const id_usuario_sesion = req.header("id_usuario_sesion"); // "5f8236bedd1aaa4dc4109589"; //
    const ip = requestIp.getClientIp(req).replace("::ffff:", ""); // "192.168.0.10"; //

    const caja = await Caja.findOne({
        ip: ip,
        usuario: id_usuario_sesion,
        es_vigente: true,
        es_borrado: false,
    });

    const cajaDiario = await CajaDiario.findOne({
        caja: caja._id,
        estado: "Abierto",
        es_vigente: true,
        es_borrado: false,
    });

    const operaciones_ingresos = await Operaciones.find({
            "diario.caja_diario": cajaDiario._id,
            "es_ingreso": true,
            // "recibo.estado": "Vigente",
            "es_borrado": false,
        },
        "recibo.numero"
    );

    const operaciones_egresos = await Operaciones.find({
            "diario.caja_diario": cajaDiario._id,
            "es_ingreso": false,
            // "recibo.estado": "Vigente",
            "es_borrado": false,
        },
        "recibo.numero"
    );

    let matrizControl_ingresos = [];
    let matrizRecibo_ingresos = [];
    let matrizControl_egresos = [];
    let matrizRecibo_egresos = [];
    let listaReciboError = [];
    let a = 0;
    let err = true;

    for (let i = 0; i < operaciones_ingresos.length; i++) {
        const e = Number(operaciones_ingresos[0].recibo.numero.slice(-8));
        a = e - 1;
    }

    operaciones_ingresos.forEach((e) => {
        let convertir = Number(e.recibo.numero.slice(-8));
        a++;
        matrizControl_ingresos.push(a);
        matrizRecibo_ingresos.push(convertir);
    });

    for (let i = 0; i < operaciones_egresos.length; i++) {
        const e = Number(operaciones_egresos[0].recibo.numero.slice(-8));
        a = e - 1;
    }

    operaciones_egresos.forEach((e) => {
        let convertir = Number(e.recibo.numero.slice(-8));
        a++;
        matrizControl_egresos.push(a);
        matrizRecibo_egresos.push(convertir);
    });

    console.log(matrizControl_ingresos);
    console.log(matrizRecibo_ingresos);
    console.log(matrizControl_egresos);
    console.log(matrizRecibo_egresos);

    matrizControl_ingresos.forEach((e) => {
        if (!matrizRecibo_ingresos.includes(e)) {
            err = false;
            listaReciboError.push(e);
            // console.log(`No existe el recibo ${e}`);
            return;
        }
    });

    matrizControl_egresos.forEach((e) => {
        if (!matrizRecibo_egresos.includes(e)) {
            err = false;
            listaReciboError.push(e);
            // console.log(`No existe el recibo ${e}`);
            return;
        }
    });

    // console.log(listaReciboError);

    if (!err) {
        return res.json({
            ok: false,
            msg: `Los recibos 0000${listaReciboError} no coinciden, por favor revise!`,
            listaReciboError,
        });
    }

    return res.json({
        ok: true,
        msg: "Todos los recibos coinciden!!!!!",
    });
};

const verificarIntegridadOperacionF = async(req, res = response) => {
    const id_usuario_sesion = req.header("id_usuario_sesion"); // "5f8236bedd1aaa4dc4109589"; //
    const ip = requestIp.getClientIp(req).replace("::ffff:", ""); // "192.168.0.10"; //

    const caja = await Caja.findOne({
        ip: ip,
        usuario: id_usuario_sesion,
        es_vigente: true,
        es_borrado: false,
    });

    const cajaDiario = await CajaDiario.findOne({
        caja: caja._id,
        estado: "Abierto",
        es_vigente: true,
        es_borrado: false,
    });

    const operaciones = await Operaciones.find({
            "diario.caja_diario": cajaDiario._id,
            "recibo.estado": "Vigente",
        },
        "producto.operacion_financiera recibo.monto_total detalle"
    );
    // console.log(operaciones.producto);

    let id_lista_detalle = [];
    let monto_total = 0;
    operaciones.forEach((e) => {
        monto_total = e.recibo.monto_total;
        e.detalle.forEach((i) => {
            id_lista_detalle.push(i.producto.operacion_financiera_detalle);
        });
    });
    console.log(monto_total);

    let montoValidar = 0;
    const operacionDetalle = await OperacionFinanciera.find({
        _id: { $in: id_lista_detalle },
    });
    // console.log(operacionDetalle);
    operacionDetalle.forEach((e) => {
        if (e.concepto) {
            montoValidar = monto_total;
        }

        montoValidar +=
            e.ingresos.monto_gasto +
            e.ingresos.monto_amortizacion_capital +
            e.ingresos.monto_interes +
            e.ingresos.monto_mora;
        montoValidar +=
            e.ahorros.monto_ahorro_inicial -
            e.ahorros.monto_retiro_ahorro_inicial +
            e.ahorros.monto_ahorro_voluntario -
            e.ahorros.monto_retiro_ahorro_voluntario +
            e.ahorros.monto_ahorro_programado -
            e.ahorros.monto_retiro_ahorro_programado +
            e.ahorros.monto_interes_ganado -
            e.ahorros.monto_retiro_interes_ganado;
    });

    if (monto_total != montoValidar) {
        return res.json({
            ok: false,
            msg: "Los montos en la operacion financiera detalle y el pago operacion financiera no coinciden",
        });
    } else {
        return res.json({
            ok: true,
            msg: "Los montos coinciden",
        });
    }

    // let a = 0
    // operaciones.forEach(async ope  => {
    //     let montoValidar = 0
    //     ope.detalle.forEach(async e  => {
    //         let op_detalle = e.producto.operacion_financiera_detalle
    //         console.log(op_detalle);
    //         const operacionDetalle = await OperacionFinanciera.find({
    //             '_id' : op_detalle
    //         });
    //         console.log('cantidad de detalles: ', operacionDetalle.length);
    //         operacionDetalle.forEach(e => {
    //             montoValidar += e.ingresos.monto_gasto + e.ingresos.monto_amortizacion_capital +
    //                             e.ingresos.monto_interes + e.ingresos.monto_mora
    //             montoValidar -= e.ahorros.monto_ahorro_inicial - e.ahorros.monto_retiro_ahorro_inicial +
    //                             e.ahorros.monto_ahorro_voluntario - e.ahorros.monto_retiro_ahorro_voluntario + e.ahorros.monto_ahorro_programado -
    //                             e.ahorros.monto_retiro_ahorro_programado + e.ahorros.monto_interes_ganado - e.ahorros.monto_retiro_interes_ganado
    //         });
    //         montoValidarTotal.push(montoValidar)
    //         a += montoValidar
    //         console.log(a);
    //     });
    //     console.log(a);
    // });
    // console.log(montoValidarTotal);
};

module.exports = {
    verificarTotalRecibo,
    verificarIntegridadRecibo,
    verificarIntegridadOperacionF,
};

// let idOpe = ope.detalle[0].producto.operacion_financiera_detalle;
// if(ope.recibo.monto_total != montoValidar){
//     controlError = false
//     console.log(controlError);
// }

// if (!controlError) {
//     return res.json({
//         ok: false,
//         msg: 'Los montos no coinciden, por favor revise'
//     })
//   }

// return res.json({
//     ok: true,
//     msg: 'Los montos coinciden!!!!!'
// })

// num = [10,6,4,9,5,3,1] // si falta aqui sale error
//     list = [1,2,3,5,6,7,8,9,10] // valores de control

//     list.forEach(l => {
//         if (!num.includes(l)){

//             console.log(`No existe el recibo ${l}`);
//             return
//         }
//     });