const { response } = require("express");
const dayjs = require('dayjs');
const logger = require('../../../helpers/logger');
const { getMessage } = require('../../../helpers/messages');
const requestIp = require('request-ip');
const OperacionFinanciera = require("../../../models/core/registro/operacion-financiera.model");
const OperacionFinancieraDetalle = require("../../../models/core/registro/operacion-financiera-detalle.model");
const PagoOperacionFinanciera = require("../../../models/core/caja/operacion-financiera-pago.model");
const PagoConcepto = require("../../../models/core/configuracion/pago-concepto.model");
const Usuario = require("../../../models/core/seguridad/usuario.model");
const Analista = require("../../../models/core/seguridad/analista.model");
const Caja = require("../../../models/core/seguridad/caja.model");
// const CajaDiario = require('../../../models/core/caja/caja-diario.model');
// const Caja = require('../../../models/core/seguridad/caja.model');
// const dayjs = require('dayjs');
// const RequestIp = require('@supercharge/request-ip')
const { getRecibo } = require('../../../helpers/core/recibo');
const { validarPago } = require('../../../helpers/core/validar-pago');
const { pagarProducto } = require('../../../helpers/core/pagar-producto');
const { pagarAhorro } = require('../../../helpers/core/pagar-ahorro');
const operacionFinancieraPagoModel = require("../../../models/core/caja/operacion-financiera-pago.model");
const ObjectId = require('mongoose').Types.ObjectId;

const listar_operaciones_financieras_detalle_vigentes = async(req, res) => {

    // const { id_operacion_financiera } = req.body;
    const id_operacion_financiera = req.params.id_operacion_financiera;

    try {

        const lista = await OperacionFinancieraDetalle.find({
                "operacion_financiera": id_operacion_financiera,
                // "estado": "Vigente",
                "estado": { $in: ["Pendiente", "Amortizado"] },
                "es_borrado": false
            })
            .sort({ "numero_cuota": 1 });

        for (let i = 0; i < lista.length; i++) {

            let monto_gasto_pagado = 0;
            let monto_ahorro_inicial_pagado = 0;
            let monto_ahorro_voluntario_pagado = 0;
            let monto_ahorro_programado_pagado = 0;
            let monto_amortizacion_capital_pagado = 0;
            let monto_interes_pagado = 0;
            let monto_mora_pagado = 0;

            for (let j = 0; j < lista[i].pagos.length; j++) {

                if (lista[i].pagos[j].es_vigente) {

                    monto_gasto_pagado += lista[i].pagos[j].ingresos.monto_gasto || 0;
                    monto_ahorro_inicial_pagado += lista[i].pagos[j].ahorros.monto_ahorro_inicial || 0;
                    monto_ahorro_voluntario_pagado += lista[i].pagos[j].ahorros.monto_ahorro_voluntario || 0;
                    monto_ahorro_programado_pagado += lista[i].pagos[j].ahorros.monto_ahorro_programado || 0;
                    monto_amortizacion_capital_pagado += lista[i].pagos[j].ingresos.monto_amortizacion_capital || 0;
                    monto_interes_pagado += lista[i].pagos[j].ingresos.monto_interes || 0;
                    monto_mora_pagado += lista[i].pagos[j].ingresos.monto_mora || 0;
                }
            }

            lista[i].ingresos.monto_gasto -= monto_gasto_pagado;
            lista[i].ahorros.monto_ahorro_inicial -= monto_ahorro_inicial_pagado;
            lista[i].ahorros.monto_ahorro_voluntario -= monto_ahorro_voluntario_pagado;
            lista[i].ahorros.monto_ahorro_programado -= monto_ahorro_programado_pagado;
            lista[i].ingresos.monto_amortizacion_capital -= monto_amortizacion_capital_pagado;
            lista[i].ingresos.monto_mora -= monto_mora_pagado;
            lista[i].ingresos.monto_interes -= monto_interes_pagado;
        }

        res.json({
            ok: true,
            lista
        })
    } catch (error) {

        const controller = "operacion-financiera-pago.controller.js -> listar_operaciones_financieras_detalle_vigentes";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

const listar = async(req, res) => {

    // const { analista } = req.body;
    const usuario = req.params.usuario;
    const analista = req.params.analista;
    const ip = requestIp.getClientIp(req).replace("::ffff:", "");

    try {

        // console.log('entroo')

        const caja = await Caja.findOne({
            ip: ip,
            usuario: usuario,
            es_vigente: true,
            es_borrado: false,
        });

        if (!caja)
            return res.status(400).json({
                ok: false,
                msg: "Estación de trabajo y/o usuario no habilitados para hacer caja.",
            });
        // console.log(caja)
        // console.log(analista)

        let lista = [];

        if (analista === '0') {

            lista = await PagoOperacionFinanciera.find({
                    "diario.caja": caja.id,
                    // "recibo.serie": caja.serie,
                    "es_vigente": true,
                    "es_borrado": false
                })
                // .sort({ "_id": -1 });
                .sort({ $natural: -1 });
        } else {

            lista = await PagoOperacionFinanciera.find({
                    // "comentario.[0].id_usuario": analista,
                    "recibo.serie": caja.serie,
                    "producto.analista": analista,
                    "recibo.estado": "Previgente",
                    // "comentario": { $elemMatch: { "id_usuario": analista } },
                    // "comentario": { "id_usuario": analista },
                    "es_vigente": true,
                    "es_borrado": false
                })
                // .sort({ "_id": -1 });
                .sort({ $natural: -1 });
        }

        // const lista = await PagoOperacionFinanciera.find({
        //         "es_vigente": true,
        //         "es_borrado": false
        //     })
        //     // .sort({ "_id": -1 });
        //     .sort({ $natural: -1 });

        res.json({
            ok: true,
            lista
        })
    } catch (error) {

        const controller = "operacion-financiera-pago.controller.js -> listar";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

const listar_libro_diario = async(req, res) => {

    const desde = Number(req.query.desde) || 0;
    // const { analista } = req.body;
    // const usuario = req.params.usuario;
    const tipo = req.params.tipo;
    // const analista = req.params.analista;
    // const ip = requestIp.getClientIp(req).replace("::ffff:", "");

    try {

        // const caja = await Caja.findOne({
        //     ip: ip,
        //     usuario: usuario,
        //     es_vigente: true,
        //     es_borrado: false,
        // });

        const es_ingreso = tipo === 'ingreso' ? true : false;

        // let lista = [];

        // if (analista === '0') {

        //     lista = await PagoOperacionFinanciera.find({
        //             "diario.caja": caja.id,
        //             // "recibo.serie": caja.serie,
        //             "es_vigente": true,
        //             "es_borrado": false
        //         })
        //         // .sort({ "_id": -1 });
        //         .sort({ $natural: -1 });
        // } else {

        // console.log(desde)

        const [lista, total] = await Promise.all([
            PagoOperacionFinanciera.find({
                // "comentario.[0].id_usuario": analista,
                // "recibo.serie": caja.serie,
                // "producto.analista": analista,
                // "recibo.estado": "Previgente",
                // "comentario": { $elemMatch: { "id_usuario": analista } },
                // "comentario": { "id_usuario": analista },
                "es_ingreso": es_ingreso,
                "es_vigente": true,
                "es_borrado": false
            })
            // .sort({ "_id": -1 });
            .sort({ $natural: -1 })
            .skip(desde)
            .limit(50),
            PagoOperacionFinanciera.find({ "es_ingreso": es_ingreso, "es_vigente": true, "es_borrado": false }).countDocuments()
        ]);
        // }

        // const lista = await PagoOperacionFinanciera.find({
        //         "es_vigente": true,
        //         "es_borrado": false
        //     })
        //     // .sort({ "_id": -1 });
        //     .sort({ $natural: -1 });

        res.json({
            ok: true,
            lista,
            total,
        })
    } catch (error) {

        const controller = "operacion-financiera-pago.controller.js -> listar_libro_diario";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

const desembolsar_operacion_financiera = async(req, res) => {

    const id = req.params.id;
    const id_usuario_sesion = req.header("id_usuario_sesion");
    const local_atencion = req.header("local_atencion");
    const now = dayjs();
    const ip = requestIp.getClientIp(req).replace("::ffff:", "");

    const {
        // operacion_financiera,
        // monto_ahorro_voluntario,
        // monto_recibido,
        // cuotas,
        id_socio,
        documento_identidad_socio,
        nombres_apellidos_socio
    } = req.body;

    try {

        const data_validacion = {
            ip: ip,
            id_usuario_sesion: id_usuario_sesion,
            local_atencion: local_atencion,
            es_ingreso: false,
            // caja: caja.id
        };

        const resultado_validacion = await validarPago(data_validacion);

        if (!resultado_validacion.ok)
            return res.status(404).json(resultado_validacion);

        const modelo = await OperacionFinanciera.findById(id)
            .populate({
                path: "producto.tipo",
                select: "codigo descripcion",
            })
            .populate({
                path: "persona",
                select: "nombre apellido_paterno apellido_materno documento_identidad",
            })
            .populate({
                path: "analista",
                select: "usuario nombre_usuario documento_identidad_usuario"
                    /*,
                                populate: {
                                    path: "usuario",
                                    select: "persona",
                                    populate: {
                                        path: "persona",
                                        select: "nombre apellido_paterno apellido_materno",
                                    }
                                }*/
            });
        // modelo.desembolso.se_desembolso_prestamo = true;

        // const analista = await Analista.findById({ '_id': modelo.analista._id });
        const monto_desembolso = modelo.monto_capital;
        const recibo = resultado_validacion.recibo;

        const desembolso = {
            se_desembolso_prestamo: true,
            recibo: {
                local_atencion: recibo.local_atencion,
                serie: recibo.serie,
                numero: recibo.numero,
                fecha: recibo.fecha,
                monto_desembolso: monto_desembolso,
                es_vigente: true
            }
        };

        modelo.desembolso = desembolso;

        // modelo.desembolo.se_desembolso_prestamo = true;
        // modelo.desembolo.recibo.serie = recibo.serie;
        // modelo.desembolo.recibo.numero = recibo.numero;
        // modelo.desembolo.recibo.fecha = recibo.fecha;
        // modelo.desembolo.recibo.monto_desembolso = monto_desembolso;


        modelo.comentario.push({
            tipo: 'Editado',
            id_usuario: req.header('id_usuario_sesion'),
            usuario: req.header('usuario_sesion'),
            nombre: req.header('nombre_sesion'),
            fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
            comentario: 'Se realizó desembolso'
        });

        await modelo.save();

        // const monto_desembolso = modelo.monto_capital;
        // const recibo = resultado_validacion.recibo;

        const modelo_pago = new PagoOperacionFinanciera();

        modelo_pago.es_ingreso = false;

        modelo_pago.diario = {
            caja_diario: resultado_validacion.caja_diario,
            // caja_diario: caja_diario.id,
            caja: resultado_validacion.caja,
            // caja: caja.id,
            cajero: resultado_validacion.cajero,
            estado: 'Abierto'
        };

        modelo_pago.recibo = {
            estado: 'Vigente',
            local_atencion: req.header('local_atencion'),
            documento_identidad_cajero: resultado_validacion.documento_identidad_cajero,
            serie: recibo.serie,
            numero: recibo.numero,
            fecha: recibo.fecha,
            ejercicio: now.format('YYYY'),
            monto_total: monto_desembolso.toFixed(1),
            frase: ''
        };

        modelo_pago.producto = {
            producto: modelo.producto.tipo,
            codigo: modelo.producto.codigo,
            codigo: modelo.producto.descripcion,
            codigo_programacion: modelo.producto.codigo_programacion,
            descripcion_programacion: modelo.producto.descripcion_programacion,
            persona: modelo.persona._id, //id_socio,
            nombre_persona: modelo.persona.apellido_paterno +
                ' ' + modelo.persona.apellido_materno +
                ', ' + modelo.persona.nombre,
            documento_identidad_persona: modelo.persona.documento_identidad, //TODO verificar
            analista: modelo.analista._id, //TODO verificar
            nombre_analista: modelo.analista.nombre_usuario, //TODO verificar
            documento_identidad_analista: modelo.analista.documento_identidad_usuario,

            operacion_financiera: modelo.id,
            // monto_gasto: monto_total_gasto,
            // monto_ahorro_inicial: monto_total_ahorro_inicial,
            // monto_ahorro_voluntario: monto_total_ahorro_voluntario,
            // monto_ahorro_programado: monto_total_ahorro_programado,
            // monto_amortizacion_capital: monto_total_amortizacion_capital,
            // monto_interes: monto_total_interes,
            // monto_mora: monto_total_mora
            es_desembolso: true,
            monto_desembolso: monto_desembolso
        };

        modelo_pago.detalle = [];

        // modelo_pago.detalle.push({
        //     producto: {
        //         // operacion_financiera_detalle: cuota.id,
        //         numero_cuota: cuota.numero_cuota,
        //         monto_gasto: monto_gasto_a_pagar,
        //         monto_ahorro_inicial: monto_ahorro_inicial_a_pagar,
        //         // monto_retiro_ahorro_inicial: cuota.monto_retiro_ahorro_inicial,
        //         monto_ahorro_voluntario: monto_ahorro_voluntario_a_pagar,
        //         // monto_retiro_ahorro_voluntario: cuota.monto_retiro_ahorro_voluntario,
        //         monto_ahorro_programado: monto_ahorro_programado_a_pagar,
        //         // monto_retiro_ahorro_programado: cuota.monto_retiro_ahorro_programado,
        //         monto_amortizacion_capital: monto_amortizacion_capital_a_pagar,
        //         monto_interes: monto_interes_a_pagar,
        //         // monto_interes_ganado: cuota.monto_interes_ganado,
        //         // monto_retiro_interes_ganado: cuota.monto_retiro_interes_ganado,
        //         monto_mora: monto_mora_a_pagar
        //     }
        // });

        await modelo_pago.save();

        const data_recibo = {

            institucion: {
                denominacion: 'Buenavista La Bolsa S.A.C.',
                agencia: 'Agencia Ayacucho',
                direccion: 'Jr. Roma N° 170',
                ruc: '20574744599',
                frase: ''
            },
            persona: {
                documento_identidad: modelo.persona.documento_identidad,
                nombre_completo: modelo.persona.apellido_paterno +
                    ' ' + modelo.persona.apellido_materno +
                    ', ' + modelo.persona.nombre
            },


            // documento_identidad_socio: documento_identidad_socio,
            // nombres_apellidos_socio: nombres_apellidos_socio,
            analista: modelo.analista.nombre_usuario,
            // analista: modelo.analista.usuario.persona.nombre +
            //     ' ' + modelo.analista.usuario.persona.apellido_paterno +
            //     ' ' + modelo.analista.usuario.persona.apellido_materno,

            producto: {
                descripcion: modelo.producto.programacion, //TODO corregir programacion
                // cuota: 0,
                monto_desembolso: monto_desembolso.toFixed(2)
                    // monto_gasto: monto_total_gasto.toFixed(2),
                    // monto_ahorro_inicial: monto_total_ahorro_inicial.toFixed(2),
                    // monto_ahorro_voluntario: monto_total_ahorro_voluntario.toFixed(2),
                    // monto_ahorro_programado: monto_total_ahorro_programado.toFixed(2),
                    // monto_amortizacion_capital: monto_total_amortizacion_capital.toFixed(2),
                    // monto_interes: monto_total_interes.toFixed(2),
                    // monto_mora: monto_total_mora.toFixed(2),
            },
            recibo: {
                usuario: req.header('usuario_sesion'),
                numero: recibo.numero,
                fecha: recibo.fecha,
                tipo_impresion: 'Original',
                monto_total: monto_desembolso.toFixed(2)
            }
        };

        res.json({
            ok: true,
            recibo: data_recibo
                // recibo: getRecibo(data_recibo)
        })

        // res.json({
        //     ok: true,
        //     msg: "Desembolso realizado satisfactoriamente.",
        // });

    } catch (error) {

        const controller = "operacion-financiera-pago.controller.js -> desembolsar_operacion_financiera";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

const pagar_operacion_financiera = async(req, res) => {

    // const { id_operacion_financiera } = req.body;
    const id_usuario_sesion = req.header('id_usuario_sesion');
    const usuario_sesion = req.header('usuario_sesion');
    const local_atencion = req.header("local_atencion");
    const ip = requestIp.getClientIp(req).replace('::ffff:', '');
    const now = dayjs();

    const {
        operacion_financiera,
        monto_ahorro_voluntario,
        monto_recibido,
        cuotas,
        id_socio,
        documento_identidad_socio,
        nombres_apellidos_socio
    } = req.body;

    try {

        const data_validacion = {
            ip: ip,
            id_usuario_sesion: id_usuario_sesion,
            local_atencion: local_atencion,
            // cajero: usuario_sesion,
            es_ingreso: true,
            es_masivo: false
        };

        const resultado_validacion = await validarPago(data_validacion);

        if (!resultado_validacion.ok)
            return res.status(404).json(resultado_validacion)

        const comentario = {
            tipo: 'Nuevo',
            id_usuario: req.header('id_usuario_sesion'),
            usuario: req.header('usuario_sesion'),
            nombre: req.header('nombre_sesion'),
            fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
            comentario: 'Pago realizado por cajero'
        };

        const data = {
            data_validacion: resultado_validacion,
            monto_recibido: monto_recibido,
            monto_ahorro_voluntario: monto_ahorro_voluntario,
            modelo_pago_operacion_financiera: req.body,
            cuotas: cuotas,
            id_socio: id_socio,
            operacion_financiera: operacion_financiera,
            es_masivo: false,
            comentario: comentario
        };

        const recibo = resultado_validacion.recibo;

        const resultado_pago = await pagarProducto(data);

        const data_recibo = {

            institucion: {
                // denominacion: 'Buenavista La Bolsa S.A.C.',
                denominacion: 'BUENAVISTA LA BOLSA S.A.C.',
                agencia: 'Agencia Ayacucho',
                direccion: 'Jr. Roma N° 170',
                ruc: '20574744599',
                frase: ''
            },
            persona: {
                documento_identidad: resultado_pago.model_operacion_financiera.persona.documento_identidad,
                nombre_completo: resultado_pago.model_operacion_financiera.persona.nombre +
                    ' ' + resultado_pago.model_operacion_financiera.persona.apellido_paterno +
                    ' ' + resultado_pago.model_operacion_financiera.persona.apellido_materno
            },
            analista: resultado_pago.model_operacion_financiera.analista.nombre_usuario,
            producto: {
                descripcion: resultado_pago.model_operacion_financiera.producto.tipo.descripcion,
                cuota: resultado_pago.cuota_menor === resultado_pago.cuota_mayor ? resultado_pago.cuota_menor : resultado_pago.cuota_menor + ' - ' + resultado_pago.cuota_mayor,
                monto_gasto: resultado_pago.monto_total_gasto.toFixed(2),
                monto_ahorro_inicial: resultado_pago.monto_total_ahorro_inicial.toFixed(2),
                monto_ahorro_voluntario: resultado_pago.monto_total_ahorro_voluntario.toFixed(2),
                monto_ahorro_programado: resultado_pago.monto_total_ahorro_programado.toFixed(2),
                monto_amortizacion_capital: resultado_pago.monto_total_amortizacion_capital.toFixed(2),
                monto_interes: resultado_pago.monto_total_interes.toFixed(2),
                monto_mora: resultado_pago.monto_total_mora.toFixed(2),
            },
            recibo: {
                usuario: req.header('usuario_sesion'),
                numero: recibo.numero,
                fecha: recibo.fecha,
                tipo_impresion: 'Original',
                monto_total: resultado_pago.monto_total.toFixed(2)
            }
        };

        res.json({
            ok: true,
            recibo: data_recibo
                // recibo: getRecibo(data_recibo)
        })
    } catch (error) {

        const controller = "operacion-financiera-pago.controller.js -> pagar_operacion_financiera";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

const registrarIngresoEgreso = async(req, res = response) => {
    // const id_usuario_sesion = "5f48329023ab991c688ccca8"; //req.header("id_usuario_sesion");
    const id_usuario_sesion = req.header("id_usuario_sesion");
    const local_atencion = req.header("local_atencion");
    // const ip = "192.168.1.31"; //requestIp.getClientIp(req).replace("::ffff:", "");
    const ip = requestIp.getClientIp(req).replace("::ffff:", "");
    const { es_ingreso } = req.body;
    const now = dayjs();

    try {
        const data_validacion = {
            ip: ip,
            id_usuario_sesion: id_usuario_sesion,
            local_atencion: local_atencion,
            es_ingreso,
            // caja: caja.id
            es_masivo: false
        };

        const comentario = {
            tipo: 'Nuevo',
            id_usuario: req.header('id_usuario_sesion'),
            usuario: req.header('usuario_sesion'),
            nombre: req.header('nombre_sesion'),
            fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
            comentario: 'Pago concepto realizado por cajero'
        };

        const resultado_validacion = await validarPago(data_validacion);

        if (!resultado_validacion.ok)
            return res.status(404).json(resultado_validacion);
        // return resultado_validacion;

        const recibo = resultado_validacion.recibo;

        // console.log(req.body)

        const modelo = new PagoOperacionFinanciera(req.body);

        modelo.diario = {
            caja_diario: resultado_validacion.caja_diario,
            // caja_diario: caja_diario.id,
            caja: resultado_validacion.caja,
            cajero: resultado_validacion.cajero,
            // caja: caja.id,
            estado: "Abierto",
        };
        modelo.es_ingreso = req.body.es_ingreso;

        modelo.recibo = {
            estado: "Vigente",
            local_atencion: recibo.local_atencion,
            documento_identidad_cajero: resultado_validacion.documento_identidad_cajero,
            serie: recibo.serie,
            numero: recibo.numero,
            fecha: recibo.fecha,
            ejercicio: now.format('YYYY'),
            monto_total: req.body.monto,
            frase: ''
        };

        modelo.comentario.push(comentario);

        // console.log(modelo)

        await modelo.save();

        // if (modelo.concepto.responsable) {

        //     const responsable = await Usuario.findById(
        //         modelo.concepto.responsable,
        //         "id persona"
        //     ).populate(
        //         "persona",
        //         "nombre apellido_paterno apellido_materno documento_identidad"
        //     );
        //     const documento_identidad_responsable =
        //         responsable.persona.documento_identidad;
        //     const nombres_apellidos_responsable =
        //         responsable.persona.nombre +
        //         ", " +
        //         responsable.persona.apellido_paterno +
        //         " " +
        //         responsable.persona.apellido_materno;
        // }

        // const id = req.body.concepto.concepto;
        // const concepto = await PagoConcepto.findById(id);

        // console.log(modelo);
        // console.log(concepto);

        // const data_recibo = {
        //     agencia: "Agencia Ayacucho",
        //     numero: recibo.numero,
        //     documento_identidad_responsable: documento_identidad_responsable,
        //     nombres_apellidos_responsable: nombres_apellidos_responsable,
        //     concepto: concepto.descripcion,
        //     monto_total: req.body.monto,
        //     usuario: req.header("usuario_sesion"),
        //     fecha: recibo.fecha,
        //     impresion: "Original",
        // };
        // return res.json({
        //     ok: true,
        //     recibo: getRecibo(data_recibo),
        // });


        const data_recibo = {

            institucion: {
                denominacion: 'Buenavista La Bolsa S.A.C.',
                agencia: 'Agencia Ayacucho',
                direccion: 'Jr. Roma N° 170',
                ruc: '20574744599',
                frase: ''
            },
            // persona: {
            //     documento_identidad: documento_identidad_socio,
            //     nombre_completo: nombres_apellidos_socio
            // },

            responsable: {
                documento_identidad: modelo.concepto.documento_identidad_responsable,
                nombre_completo: modelo.concepto.nombre_responsable
            },


            // documento_identidad_socio: documento_identidad_socio,
            // nombres_apellidos_socio: nombres_apellidos_socio,
            // analista: 'XXX XXX XXX',
            // analista: modelo.analista.usuario.persona.nombre +
            //     ' ' + modelo.analista.usuario.persona.apellido_paterno +
            //     ' ' + modelo.analista.usuario.persona.apellido_materno,

            // producto: {
            //     descripcion: modelo.producto.tipo.descripcion,
            //     // cuota: 0,
            //     monto_desembolso: monto_desembolso
            //         // monto_gasto: monto_total_gasto.toFixed(2),
            //         // monto_ahorro_inicial: monto_total_ahorro_inicial.toFixed(2),
            //         // monto_ahorro_voluntario: monto_total_ahorro_voluntario.toFixed(2),
            //         // monto_ahorro_programado: monto_total_ahorro_programado.toFixed(2),
            //         // monto_amortizacion_capital: monto_total_amortizacion_capital.toFixed(2),
            //         // monto_interes: monto_total_interes.toFixed(2),
            //         // monto_mora: monto_total_mora.toFixed(2),
            // },
            concepto: {
                producto: modelo.es_ingreso ? 'Ingresos institución' : 'Egresos institución',
                descripcion: modelo.concepto.descripcion,
                sub_concepto: modelo.concepto.descripcion_sub_concepto,
                detalle: modelo.concepto.detalle,
                numero_comprobante: modelo.concepto.numero_comprobante
                    // descripcion: concepto.descripcion,
                    // sub_concepto: 'XXX XXX XXX'
            },
            recibo: {
                usuario: req.header('usuario_sesion'),
                numero: recibo.numero,
                fecha: recibo.fecha,
                tipo_impresion: 'Original',
                monto_total: req.body.monto.toFixed(2)
            }
        };

        res.json({
            ok: true,
            recibo: data_recibo
                // recibo: getRecibo(data_recibo)
        })
    } catch (error) {

        const controller = "operacion-financiera-pago.controller.js -> registrarIngresoEgreso";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const anular_recibo = async(req, res = response) => {

    const id = req.params.id;
    const now = dayjs();
    const {
        comentario
    } = req.body;

    try {

        const modelo = await PagoOperacionFinanciera.findById(id);

        if (modelo.diario.estado == 'Cerrado')
            return res.status(404).json({
                ok: false,
                msg: 'El recibo no puede ser anulado por que caja diario ya fue cerrado.'
            })

        modelo.recibo.estado = 'Anulado';
        // modelo.comentario.push();

        modelo.comentario.push({
            tipo: 'Editado',
            id_usuario: req.header('id_usuario_sesion'),
            usuario: req.header('usuario_sesion'),
            nombre: req.header('nombre_sesion'),
            fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
            comentario: comentario
        });

        await modelo.save();

        // const modelo = new PagoOperacionFinanciera(req.body);

        for (let i = 0; i < modelo.detalle.length; i++) {

            const cuota = await OperacionFinancieraDetalle.findById(modelo.detalle[i].producto.operacion_financiera_detalle);

            for (let j = 0; j < cuota.pagos.length; j++) {

                if (cuota.pagos[j].recibo.serie === modelo.recibo.serie &&
                    cuota.pagos[j].recibo.numero === modelo.recibo.numero) {

                    cuota.pagos[j].es_vigente = false;
                    // await cuota.save();
                }
            }

            await cuota.save();
        }

        //TODO validar que si hay pagos de cuota 0 no permita anular desembolso

        if (modelo.producto.es_desembolso) {

            const producto = await OperacionFinanciera.findById(modelo.producto.operacion_financiera);

            producto.desembolso.se_desembolso_prestamo = false;
            producto.desembolso.recibo = {};
            producto.comentario.push({
                tipo: 'Editado',
                id_usuario: req.header('id_usuario_sesion'),
                usuario: req.header('usuario_sesion'),
                nombre: req.header('nombre_sesion'),
                fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
                comentario: comentario
            });

            await producto.save();
        }

        return res.json({
            ok: true,
            // recibo: 'Anulación satisfactoriamente.',
            msg: 'Se anuló el recibo satisfactoriamente.'
        });

    } catch (error) {

        const controller = "operacion-financiera-pago.controller.js -> anular_recibo";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

const pagar_operacion_financiera_por_analista = async(req, res = response) => {

    // const { id_operacion_financiera } = req.body;
    const id_usuario_sesion = req.header('id_usuario_sesion');
    const local_atencion = req.header("local_atencion");
    const ip = requestIp.getClientIp(req).replace('::ffff:', '');
    const now = dayjs();

    // const {
    //     lista
    // } = req.body;

    const {
        // operacion_financiera,
        // monto_ahorro_voluntario,
        // monto_recibido,
        // cuotas,
        // id_socio,
        // documento_identidad_socio,
        // nombres_apellidos_socio
        lista
    } = req.body;

    try {

        const data_validacion = {
            ip: ip,
            id_usuario_sesion: id_usuario_sesion,
            local_atencion: local_atencion,
            es_ingreso: true,
            es_masivo: true
        };

        const resultado_validacion = await validarPago(data_validacion);

        if (!resultado_validacion.ok)
            return res.status(404).json(resultado_validacion)

        // const data = {
        //     data_validacion: resultado_validacion,
        //     monto_recibido: monto_recibido,
        //     monto_ahorro_voluntario: monto_ahorro_voluntario,
        //     modelo_pago_operacion_financiera: req.body,
        //     cuotas: cuotas,
        //     id_socio: id_socio,
        //     operacion_financiera: operacion_financiera
        // };

        // const recibo = resultado_validacion.recibo;

        // const resultado_pago = await pagarProducto(data);

        // // const operaion_financiera = req.params.id;
        // const now = dayjs();
        // const {
        //     lista
        // } = req.body;

        // try {

        const comentario = {
            tipo: 'Nuevo',
            id_usuario: req.header('id_usuario_sesion'),
            usuario: req.header('usuario_sesion'),
            nombre: req.header('nombre_sesion'),
            fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
            comentario: 'Pre pago realizado por analista'
        };

        for (let i = 0; i < lista.length; i++) {

            const operacion_financiera = await OperacionFinanciera.findById(lista[i].operacion_financiera);
            const cuotas = await OperacionFinancieraDetalle.find({
                // 'operacion_financiera': new ObjectId(operacion_financiera.operacion_financiera),
                'operacion_financiera': lista[i].operacion_financiera,
                // "operacion_financiera": "5f852f40f1ba56266499fbb3",
                "estado": { $in: ["Pendiente", "Amortizado"] },
                "es_vigente": true,
                "es_borrado": false
            }, '_id');

            let cuotas_procesada = [];

            for (let j = 0; j < cuotas.length; j++) {

                cuotas_procesada.push(cuotas[j]._id);
            }

            const correlativo_recibo = parseInt(resultado_validacion.recibo.numero.split("-").pop()) + i;
            resultado_validacion.recibo.numero = "I-" + correlativo_recibo.toString().padStart(8, "00000000");

            // numero_recibo = parseInt(resultado_validacion.recibo.numero.split("-").pop()) + i;

            const data = {
                data_validacion: resultado_validacion,
                monto_recibido: lista[i].monto_recibido,
                monto_ahorro_voluntario: lista[i].monto_ahorro_voluntario,
                // modelo_pago_operacion_financiera: req.body,
                cuotas: cuotas_procesada,
                id_socio: operacion_financiera.persona,
                operacion_financiera: lista[i].operacion_financiera,
                es_masivo: true,
                comentario: comentario
            };

            const resultado_pago = await pagarProducto(data);
        }

        return res.json({
            ok: true,
            // recibo: 'Anulación satisfactoriamente.',
            msg: 'Se registró satisfactoriamente.'
        });

    } catch (error) {

        const controller = "operacion-financiera-pago.controller.js -> pagar_operacion_financiera_por_analista";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

const confirmar_pago_analista = async(req, res = response) => {

    // const id = req.params.id;
    const id_usuario_sesion = req.header('id_usuario_sesion');
    const analista = req.params.analista;
    const local_atencion = req.header("local_atencion");
    const ip = requestIp.getClientIp(req).replace('::ffff:', '');
    const now = dayjs();
    // const {
    //     comentario
    // } = req.body;

    try {

        // const modelo = await PagoOperacionFinanciera.findById(id);

        const comentario = {
            tipo: 'Editado',
            id_usuario: req.header('id_usuario_sesion'),
            usuario: req.header('usuario_sesion'),
            nombre: req.header('nombre_sesion'),
            fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
            comentario: 'Confirmación de pagos de analista realizado por cajero'
        };

        const data_validacion = {
            ip: ip,
            id_usuario_sesion: id_usuario_sesion,
            local_atencion: local_atencion,
            // cajero: usuario_sesion,
            es_ingreso: true,
            es_masivo: false
        };

        const resultado_validacion = await validarPago(data_validacion);

        /*
        return {
        ok: true,
        caja_diario: caja_diario.id,
        caja: caja.id,
        cajero: caja.usuario,
        documento_identidad_cajero: caja.documento_identidad_cajero,
        recibo,
    };
        */

        await PagoOperacionFinanciera.updateMany({
            // "recibo.serie": caja.serie,
            "diario.caja_diario": resultado_validacion.caja_diario,
            "producto.analista": analista,
            // "comentario": { $elemMatch: { "id_usuario": id } },
            // "comentario": { "id_usuario": analista },
            "recibo.estado": "Previgente",
            "es_vigente": true,
            "es_borrado": false
        }, {
            // recibo: { "estado": "Vigente" },
            // recibo: { $set: { "estado": "Vigente" } },
            // $set: { recibo: { "estado": "Vigente" } },
            // $set: { "recibo.$[elem].estado": "Vigente" },
            $set: { "recibo.estado": "Vigente" },
            // arrayFilters: { "elem.estado": "Previgente" },
            // arrayFilters: [{ "elem.estado": { $gte: 85 } }],
            // { $set: { "grades.$[element]": 100 } },
            // { arrayFilters: [{ "element": { $gte: 100 } }] }
            $push: { "comentario": comentario },
            // upsert: true
        });

        return res.json({
            ok: true,
            // recibo: 'Anulación satisfactoriamente.',
            msg: 'Se confirmaron los pagos de analista satisfactoriamente.'
        });

    } catch (error) {

        const controller = "operacion-financiera-pago.controller.js -> confirmar_pago_analista";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

const crear_pagar_ahorro = async(req, res) => {

    const id_usuario_sesion = req.header('id_usuario_sesion');
    const local_atencion = req.header("local_atencion");
    // const usuario_sesion = req.header('usuario_sesion');
    const ip = requestIp.getClientIp(req).replace('::ffff:', '');
    const now = dayjs();

    // const {
    //     operacion_financiera,
    //     // monto_ahorro_voluntario,
    //     monto_recibido,
    //     // cuotas,
    //     id_socio,
    //     documento_identidad_socio,
    //     nombres_apellidos_socio,
    //     es_ingreso
    // } = req.body;

    // try {

    const {
        documento_identidad_socio,
        nombres_apellidos_socio,
        detalle,
        comentario,
        monto_recibido
    } = req.body;

    // const session = await OperacionFinanciera.startSession();
    // session.startTransaction();
    try {
        // const opts = { session };

        const operacion_financiera = new OperacionFinanciera(req.body);
        // const operacion_financiera = new OperacionFinanciera(req.body);
        const now = dayjs();

        operacion_financiera.local_atencion = req.header('local_atencion');

        operacion_financiera.comentario = [{
            tipo: 'Nuevo',
            id_usuario: req.header('id_usuario_sesion'),
            usuario: req.header('usuario_sesion'),
            nombre: req.header('nombre_sesion'),
            fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
            comentario
        }];

        const modelo = await operacion_financiera.save();
        // const modelo = await operacion_financiera.save(opts);

        // let operacion_financiera_detalle;

        // operacion_financiera_detalle = new OperacionFinancieraDetalle(detalle[i]);

        // // for (let i = 0; i < detalle.length; i++) {

        // operacion_financiera_detalle = new OperacionFinancieraDetalle(detalle);
        // operacion_financiera_detalle.operacion_financiera = modelo.id;
        // operacion_financiera_detalle.persona = modelo.persona;

        // await operacion_financiera_detalle.save(opts);
        // // }


        // for (let i = 0; i < detalle.length; i++) {

        //     operacion_financiera_detalle = new OperacionFinancieraDetalle(detalle[i]);
        //     operacion_financiera_detalle.operacion_financiera = modelo.id;
        //     operacion_financiera_detalle.persona = modelo.persona;

        //     await operacion_financiera_detalle.save(opts);
        // }
        // for (let i = 0; i < detalle.length; i++) {

        //     operacion_financiera_detalle = new OperacionFinancieraDetalle(detalle[i]);
        //     operacion_financiera_detalle.operacion_financiera = modelo.id;
        //     operacion_financiera_detalle.persona = modelo.persona;

        //     await operacion_financiera_detalle.save(opts);
        // }

        // await session.commitTransaction();
        // session.endSession();





        const data_validacion = {
            ip: ip,
            id_usuario_sesion: id_usuario_sesion,
            local_atencion: local_atencion,
            // cajero: req.header('usuario_sesion'),
            es_ingreso: true,
            es_masivo: false
        };

        const resultado_validacion = await validarPago(data_validacion);

        if (!resultado_validacion.ok)
            return res.status(404).json(resultado_validacion)

        const comentario_2 = {
            tipo: 'Nuevo',
            id_usuario: req.header('id_usuario_sesion'),
            usuario: req.header('usuario_sesion'),
            nombre: req.header('nombre_sesion'),
            fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
            comentario: 'Ahorro realizado por cajero'
        };

        // const cuota = new OperacionFinancieraDetalle();

        // cuota.operacion_financiera = operacion_financiera;
        // cuota.persona = id_socio;
        // cuota.estado = 'Vigente';
        // cuota.numero_cuota = 0;
        // cuota.nombre_dia_cuota = '';
        // cuota.fecha_cuota = '01/01/2020';
        // cuota.fecha_plazo_cuota = '01/01/2020';
        // cuota.ingresos.monto_gasto = 0;
        // cuota.ahorros.monto_ahorro_voluntario = es_ingreso ? monto_recibido : 0;
        // cuota.ahorros.monto_retiro_ahorro_voluntario = es_ingreso ? 0 : monto_recibido;
        // cuota.comentario.push(comentario);

        // await cuota.save();

        const data = {
            data_validacion: resultado_validacion,
            // monto_recibido: monto_ahorro_voluntario,
            // monto_recibido: monto_recibido,
            monto_recibido: monto_recibido,
            // modelo_pago_operacion_financiera: req.body,
            // cuota: cuota,
            id_socio: modelo.persona,
            operacion_financiera: modelo.id,
            // es_masivo: false,
            es_ingreso: true,
            comentario: comentario_2
        };

        const recibo = resultado_validacion.recibo;

        const resultado_pago = await pagarAhorro(data);

        // const data_recibo = {

        //     institucion: {
        //         // denominacion: 'Buenavista La Bolsa S.A.C.',
        //         denominacion: 'BUENAVISTA LA BOLSA S.A.C.',
        //         agencia: 'Agencia Ayacucho',
        //         ruc: '20574744599',
        //         frase: ''
        //     },
        //     persona: {
        //         documento_identidad: '12345678', //documento_identidad_socio,
        //         nombre_completo: 'XXX XXX XXX', //nombres_apellidos_socio
        //     },
        //     // analista: resultado_pago.model_operacion_financiera.analista.usuario.persona.nombre +
        //     //     ' ' + resultado_pago.model_operacion_financiera.analista.usuario.persona.apellido_paterno +
        //     //     ' ' + resultado_pago.model_operacion_financiera.analista.usuario.persona.apellido_materno,
        //     producto: {
        //         descripcion: resultado_pago.model_operacion_financiera.producto.tipo.descripcion,
        //         // cuota: resultado_pago.cuota_menor === resultado_pago.cuota_mayor ? resultado_pago.cuota_menor : resultado_pago.cuota_menor + ' - ' + resultado_pago.cuota_mayor,
        //         // monto_gasto: resultado_pago.monto_total_gasto.toFixed(2),
        //         // monto_ahorro_inicial: resultado_pago.monto_total_ahorro_inicial.toFixed(2),
        //         monto_ahorro_voluntario: resultado_pago.monto_total_ahorro_voluntario //.toFixed(2),
        //             // monto_ahorro_programado: resultado_pago.monto_total_ahorro_programado.toFixed(2),
        //             // monto_amortizacion_capital: resultado_pago.monto_total_amortizacion_capital.toFixed(2),
        //             // monto_interes: resultado_pago.monto_total_interes.toFixed(2),
        //             // monto_mora: resultado_pago.monto_total_mora.toFixed(2),
        //     },
        //     recibo: {
        //         usuario: req.header('usuario_sesion'),
        //         numero: recibo.numero,
        //         fecha: recibo.fecha,
        //         tipo_impresion: 'Original',
        //         monto_total: resultado_pago.monto_total //.toFixed(2)
        //     }
        // };

        // console.log(resultado_pago);

        const data_recibo = {

            institucion: {
                // denominacion: 'Buenavista La Bolsa S.A.C.',
                denominacion: 'BUENAVISTA LA BOLSA S.A.C.',
                agencia: 'Agencia Ayacucho',
                direccion: 'Jr. Roma N° 170',
                ruc: '20574744599',
                frase: ''
            },
            persona: {
                documento_identidad: resultado_pago.model_operacion_financiera.persona.documento_identidad,
                nombre_completo: resultado_pago.model_operacion_financiera.persona.nombre +
                    ' ' + resultado_pago.model_operacion_financiera.persona.apellido_paterno +
                    ' ' + resultado_pago.model_operacion_financiera.persona.apellido_materno
            },
            // analista: resultado_pago.model_operacion_financiera.analista.usuario.persona.nombre +
            //     ' ' + resultado_pago.model_operacion_financiera.analista.usuario.persona.apellido_paterno +
            //     ' ' + resultado_pago.model_operacion_financiera.analista.usuario.persona.apellido_materno,
            analista: resultado_pago.model_operacion_financiera.analista.nombre_usuario,
            producto: {
                descripcion: resultado_pago.model_operacion_financiera.producto.tipo.descripcion,
                // cuota: resultado_pago.cuota_menor === resultado_pago.cuota_mayor ? resultado_pago.cuota_menor : resultado_pago.cuota_menor + ' - ' + resultado_pago.cuota_mayor,
                // monto_gasto: resultado_pago.monto_total_gasto.toFixed(2),
                // monto_ahorro_inicial: resultado_pago.monto_total_ahorro_inicial.toFixed(2),
                monto_ahorro_voluntario: resultado_pago.monto_recibido.toFixed(2),
                // monto_ahorro_programado: resultado_pago.monto_total_ahorro_programado.toFixed(2),
                // monto_amortizacion_capital: resultado_pago.monto_total_amortizacion_capital.toFixed(2),
                // monto_interes: resultado_pago.monto_total_interes.toFixed(2),
                // monto_mora: resultado_pago.monto_total_mora.toFixed(2),
            },
            recibo: {
                usuario: req.header('usuario_sesion'),
                numero: recibo.numero,
                fecha: recibo.fecha,
                tipo_impresion: 'Original',
                monto_total: resultado_pago.monto_total.toFixed(2)
                    // monto_total: resultado_pago.monto_total.toFixed(2)
            }
        };

        res.json({
            ok: true,
            recibo: data_recibo
                // recibo: getRecibo(data_recibo)
        })
    } catch (error) {

        // await session.abortTransaction();
        // session.endSession();

        const controller = "operacion-financiera-pago.controller.js -> crear_pagar_ahorro";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

const pagar_ahorro = async(req, res) => {

    const id_usuario_sesion = req.header('id_usuario_sesion');
    const local_atencion = req.header("local_atencion");
    const ip = requestIp.getClientIp(req).replace('::ffff:', '');
    const now = dayjs();

    const {
        operacion_financiera,
        // monto_ahorro_voluntario,
        monto_recibido,
        // cuotas,
        id_socio,
        documento_identidad_socio,
        nombres_apellidos_socio,
        es_ingreso
    } = req.body;

    try {

        const data_validacion = {
            ip: ip,
            id_usuario_sesion: id_usuario_sesion,
            local_atencion: local_atencion,
            es_ingreso: es_ingreso,
            es_masivo: false
        };

        const resultado_validacion = await validarPago(data_validacion);

        if (!resultado_validacion.ok)
            return res.status(404).json(resultado_validacion)

        const comentario = {
            tipo: 'Nuevo',
            id_usuario: req.header('id_usuario_sesion'),
            usuario: req.header('usuario_sesion'),
            nombre: req.header('nombre_sesion'),
            fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
            comentario: 'Ahorro realizado por cajero'
        };

        // const cuota = new OperacionFinancieraDetalle();

        // cuota.operacion_financiera = operacion_financiera;
        // cuota.persona = id_socio;
        // cuota.estado = 'Vigente';
        // cuota.numero_cuota = 0;
        // cuota.nombre_dia_cuota = '';
        // cuota.fecha_cuota = '01/01/2020';
        // cuota.fecha_plazo_cuota = '01/01/2020';
        // cuota.ingresos.monto_gasto = 0;
        // cuota.ahorros.monto_ahorro_voluntario = es_ingreso ? monto_recibido : 0;
        // cuota.ahorros.monto_retiro_ahorro_voluntario = es_ingreso ? 0 : monto_recibido;
        // cuota.comentario.push(comentario);

        // await cuota.save();

        const data = {
            data_validacion: resultado_validacion,
            // monto_recibido: monto_ahorro_voluntario,
            // monto_recibido: monto_recibido,
            monto_recibido: monto_recibido,
            // modelo_pago_operacion_financiera: req.body,
            // cuota: cuota,
            id_socio: id_socio,
            operacion_financiera: operacion_financiera,
            // es_masivo: false,
            es_ingreso: es_ingreso,
            comentario: comentario
        };

        const recibo = resultado_validacion.recibo;

        const resultado_pago = await pagarAhorro(data);

        // const data_recibo = {

        //     institucion: {
        //         // denominacion: 'Buenavista La Bolsa S.A.C.',
        //         denominacion: 'BUENAVISTA LA BOLSA S.A.C.',
        //         agencia: 'Agencia Ayacucho',
        //         ruc: '20574744599',
        //         frase: ''
        //     },
        //     persona: {
        //         documento_identidad: documento_identidad_socio,
        //         nombre_completo: nombres_apellidos_socio
        //     },
        //     // analista: resultado_pago.model_operacion_financiera.analista.usuario.persona.nombre +
        //     //     ' ' + resultado_pago.model_operacion_financiera.analista.usuario.persona.apellido_paterno +
        //     //     ' ' + resultado_pago.model_operacion_financiera.analista.usuario.persona.apellido_materno,
        //     producto: {
        //         descripcion: resultado_pago.model_operacion_financiera.producto.tipo.descripcion,
        //         // cuota: resultado_pago.cuota_menor === resultado_pago.cuota_mayor ? resultado_pago.cuota_menor : resultado_pago.cuota_menor + ' - ' + resultado_pago.cuota_mayor,
        //         // monto_gasto: resultado_pago.monto_total_gasto.toFixed(2),
        //         // monto_ahorro_inicial: resultado_pago.monto_total_ahorro_inicial.toFixed(2),
        //         monto_ahorro_voluntario: resultado_pago.monto_total_ahorro_voluntario //.toFixed(2),
        //             // monto_ahorro_programado: resultado_pago.monto_total_ahorro_programado.toFixed(2),
        //             // monto_amortizacion_capital: resultado_pago.monto_total_amortizacion_capital.toFixed(2),
        //             // monto_interes: resultado_pago.monto_total_interes.toFixed(2),
        //             // monto_mora: resultado_pago.monto_total_mora.toFixed(2),
        //     },
        //     recibo: {
        //         usuario: req.header('usuario_sesion'),
        //         numero: recibo.numero,
        //         fecha: recibo.fecha,
        //         tipo_impresion: 'Original',
        //         monto_total: resultado_pago.monto_total //.toFixed(2)
        //     }
        // };

        // console.log(resultado_pago)

        const data_recibo = {

            institucion: {
                // denominacion: 'Buenavista La Bolsa S.A.C.',
                denominacion: 'BUENAVISTA LA BOLSA S.A.C.',
                agencia: 'Agencia Ayacucho',
                direccion: 'Jr. Roma N° 170',
                ruc: '20574744599',
                frase: ''
            },
            persona: {
                documento_identidad: resultado_pago.model_operacion_financiera.persona.documento_identidad,
                nombre_completo: resultado_pago.model_operacion_financiera.persona.nombre +
                    ' ' + resultado_pago.model_operacion_financiera.persona.apellido_paterno +
                    ' ' + resultado_pago.model_operacion_financiera.persona.apellido_materno
            },
            // analista: resultado_pago.model_operacion_financiera.analista.usuario.persona.nombre +
            //     ' ' + resultado_pago.model_operacion_financiera.analista.usuario.persona.apellido_paterno +
            //     ' ' + resultado_pago.model_operacion_financiera.analista.usuario.persona.apellido_materno,
            analista: resultado_pago.model_operacion_financiera.analista.nombre_usuario,
            producto: {
                descripcion: resultado_pago.model_operacion_financiera.producto.tipo.descripcion,
                // cuota: resultado_pago.cuota_menor === resultado_pago.cuota_mayor ? resultado_pago.cuota_menor : resultado_pago.cuota_menor + ' - ' + resultado_pago.cuota_mayor,
                // monto_gasto: resultado_pago.monto_total_gasto.toFixed(2),
                // monto_ahorro_inicial: resultado_pago.monto_total_ahorro_inicial.toFixed(2),
                monto_ahorro_voluntario: es_ingreso ? Number(resultado_pago.monto_recibido).toFixed(2) : 0,
                monto_retiro_ahorro_voluntario: es_ingreso ? 0 : Number(resultado_pago.monto_recibido).toFixed(2),
                // monto_ahorro_programado: resultado_pago.monto_total_ahorro_programado.toFixed(2),
                // monto_amortizacion_capital: resultado_pago.monto_total_amortizacion_capital.toFixed(2),
                // monto_interes: resultado_pago.monto_total_interes.toFixed(2),
                // monto_mora: resultado_pago.monto_total_mora.toFixed(2),
            },
            recibo: {
                usuario: req.header('usuario_sesion'),
                numero: recibo.numero,
                fecha: recibo.fecha,
                tipo_impresion: 'Original',
                monto_total: resultado_pago.monto_total.toFixed(2)
            }
        };

        res.json({
            ok: true,
            recibo: data_recibo
                // recibo: getRecibo(data_recibo)
        })
    } catch (error) {

        const controller = "operacion-financiera-pago.controller.js -> pagar_ahorro";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

const retirar_ahorros_operacion_financiera = async(req, res) => {

    const operacion_financiera = req.params.id;
    const id_usuario_sesion = req.header("id_usuario_sesion");
    const local_atencion = req.header("local_atencion");
    const now = dayjs();
    const ip = requestIp.getClientIp(req).replace("::ffff:", "");

    const {
        monto_retiro_ahorro_inicial,
        monto_retiro_ahorro_programado,
        monto_retiro_ahorro_voluntario,
        // operacion_financiera,
        // monto_ahorro_voluntario,
        // monto_recibido,
        // cuotas,
        id_socio,
        documento_identidad_socio,
        nombres_apellidos_socio
    } = req.body;

    // console.log(operacion_financiera)
    // console.log(monto_retiro_ahorro_inicial)
    // console.log(monto_retiro_ahorro_voluntario)
    // console.log(monto_retiro_ahorro_programado)

    try {

        const data_validacion = {
            ip: ip,
            id_usuario_sesion: id_usuario_sesion,
            local_atencion: local_atencion,
            es_ingreso: false,
            // caja: caja.id
        };

        const resultado_validacion = await validarPago(data_validacion);

        if (!resultado_validacion.ok)
            return res.status(404).json(resultado_validacion);

        const comentario = {
            tipo: 'Nuevo',
            id_usuario: req.header('id_usuario_sesion'),
            usuario: req.header('usuario_sesion'),
            nombre: req.header('nombre_sesion'),
            fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
            comentario: 'Retiro total realizado'
        };

        const recibo = resultado_validacion.recibo;
        const cuota = new OperacionFinancieraDetalle();

        cuota.operacion_financiera = operacion_financiera;
        cuota.persona = id_socio;
        cuota.estado = 'Vigente';
        cuota.numero_cuota = 0;
        cuota.nombre_dia_cuota = '';
        cuota.fecha_cuota = now.format('DD/MM/YYYY');
        cuota.fecha_plazo_cuota = now.format('DD/MM/YYYY');
        cuota.fecha_plazo_cuota = now.format('DD/MM/YYYY');
        cuota.ejercicio = now.format('YYYY');
        // cuota.ingresos.monto_gasto = 0;
        cuota.ahorros.monto_retiro_ahorro_inicial = monto_retiro_ahorro_inicial || 0;
        cuota.ahorros.monto_retiro_ahorro_programado = monto_retiro_ahorro_programado || 0;
        cuota.ahorros.monto_retiro_ahorro_voluntario = monto_retiro_ahorro_voluntario || 0;

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
                // monto_ahorro_voluntario: data.es_ingreso ? data.monto_recibido : 0,
                monto_retiro_ahorro_inicial: monto_retiro_ahorro_inicial || 0,
                monto_retiro_ahorro_programado: monto_retiro_ahorro_programado || 0,
                monto_retiro_ahorro_voluntario: monto_retiro_ahorro_voluntario || 0,
                // monto_ahorro_programado: 0,
            }
        });

        // console.log('entro 1')

        // // cuota.comentario.data.comentario;

        // console.log('entro 2')

        const cuota_guardada = await cuota.save();

        // await OperacionFinancieraDetalle.updateMany({
        //     "operacion_financiera": id,
        //     // "estado": "Prependiente",
        //     // "ahorros.monto_ahorro_inicial": { $in: ["Pendiente", "Amortizado"] },

        //     $or: [
        //         { 'ahorros.monto_ahorro_inicial': { $gt: 0 } },
        //         { 'ahorros.monto_ahorro_programado': { $gt: 0 } },
        //         { 'ahorros.monto_ahorro_voluntario': { $gt: 0 } }
        //     ],

        //     "es_vigente": true,
        //     "es_borrado": false
        // }, { "estado": "Pendiente" });

        // const modelo = await OperacionFinancieraDetalle.aggregate(
        //     [
        //         { $match: { operacion_financiera: id /*, estado: "Pendiente"*/ , es_vigente: true, es_borrado: false } },
        //         {
        //             $group: {
        //                 _id: "$operacion_financiera",
        //                 monto_ahorro_inicial: { $sum: "$ahorros.monto_ahorro_inicial" },
        //                 monto_retiro_ahorro_inicial: { $sum: "$ahorros.monto_retiro_ahorro_inicial" },
        //                 monto_ahorro_voluntario: { $sum: "$ahorros.monto_ahorro_voluntario" },
        //                 monto_retiro_ahorro_voluntario: { $sum: "$ahorros.monto_retiro_ahorro_voluntario" },
        //                 monto_ahorro_programado: { $sum: "$ahorros.monto_ahorro_programado" },
        //                 monto_retiro_ahorro_programado: { $sum: "$ahorros.monto_retiro_ahorro_programado" }
        //             }
        //         }
        //     ]
        // )

        // console.log(modelo)

        // const ahorros = {
        //     monto_ahorro_inicial: modelo[0].monto_ahorro_inicial - modelo[0].monto_retiro_ahorro_inicial,
        //     monto_ahorro_voluntario: modelo[0].monto_ahorro_voluntario - modelo[0].monto_retiro_ahorro_voluntario,
        //     monto_ahorro_programado: modelo[0].monto_ahorro_programado - modelo[0].monto_retiro_ahorro_programado
        // };



        const modelo = await OperacionFinanciera.findById(operacion_financiera)
            .populate({
                path: "producto.tipo",
                select: "codigo descripcion",
            })
            .populate({
                path: "persona",
                select: "nombre apellido_paterno apellido_materno documento_identidad",
            })
            .populate({
                path: "analista",
                select: "usuario nombre_usuario documento_identidad_usuario"
                    /*,
                                populate: {
                                    path: "usuario",
                                    select: "persona",
                                    populate: {
                                        path: "persona",
                                        select: "nombre apellido_paterno apellido_materno",
                                    }
                                }*/
            });
        // // modelo.desembolso.se_desembolso_prestamo = true;

        // // const analista = await Analista.findById({ '_id': modelo.analista._id });
        // const monto_desembolso = modelo.monto_capital;
        // const recibo = resultado_validacion.recibo;

        // const desembolso = {
        //     se_desembolso_prestamo: true,
        //     recibo: {
        //         local_atencion: recibo.local_atencion,
        //         serie: recibo.serie,
        //         numero: recibo.numero,
        //         fecha: recibo.fecha,
        //         monto_desembolso: monto_desembolso,
        //         es_vigente: true
        //     }
        // };

        // modelo.desembolso = desembolso;

        // // modelo.desembolo.se_desembolso_prestamo = true;
        // // modelo.desembolo.recibo.serie = recibo.serie;
        // // modelo.desembolo.recibo.numero = recibo.numero;
        // // modelo.desembolo.recibo.fecha = recibo.fecha;
        // // modelo.desembolo.recibo.monto_desembolso = monto_desembolso;


        // modelo.comentario.push({
        //     tipo: 'Editado',
        //     id_usuario: req.header('id_usuario_sesion'),
        //     usuario: req.header('usuario_sesion'),
        //     nombre: req.header('nombre_sesion'),
        //     fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
        //     comentario: 'Se realizó retiro total'
        // });

        // await modelo.save();

        // const monto_desembolso = modelo.monto_capital;
        // const recibo = resultado_validacion.recibo;

        const monto_total = Number(monto_retiro_ahorro_inicial) +
            Number(monto_retiro_ahorro_programado) +
            Number(monto_retiro_ahorro_voluntario);

        // console.log(monto_retiro_ahorro_inicial)
        // console.log(monto_retiro_ahorro_programado)
        // console.log(monto_retiro_ahorro_voluntario)
        // console.log(monto_total)
        // console.log(Number(monto_total).toFixed(2))

        const modelo_pago = new PagoOperacionFinanciera();

        modelo_pago.es_ingreso = false;

        modelo_pago.diario = {
            caja_diario: resultado_validacion.caja_diario,
            // caja_diario: caja_diario.id,
            caja: resultado_validacion.caja,
            // caja: caja.id,
            cajero: resultado_validacion.cajero,
            estado: 'Abierto'
        };

        modelo_pago.recibo = {
            estado: 'Vigente',
            local_atencion: req.header('local_atencion'),
            documento_identidad_cajero: resultado_validacion.documento_identidad_cajero,
            serie: recibo.serie,
            numero: recibo.numero,
            fecha: recibo.fecha,
            ejercicio: now.format('YYYY'),
            monto_total: Number(monto_total).toFixed(1),
            frase: ''
        };

        modelo_pago.producto = {
            producto: modelo.producto.tipo,
            codigo: modelo.producto.codigo,
            codigo: modelo.producto.descripcion,
            codigo_programacion: modelo.producto.codigo_programacion,
            descripcion_programacion: modelo.producto.descripcion_programacion,
            persona: modelo.persona._id, //id_socio,
            nombre_persona: modelo.persona.apellido_paterno +
                ' ' + modelo.persona.apellido_materno +
                ', ' + modelo.persona.nombre,
            documento_identidad_persona: modelo.persona.documento_identidad, //TODO verificar
            analista: modelo.analista._id, //TODO verificar
            nombre_analista: modelo.analista.nombre_usuario, //TODO verificar
            documento_identidad_analista: modelo.analista.documento_identidad_usuario,

            operacion_financiera: modelo.id,
            // monto_gasto: monto_total_gasto,
            monto_retiro_ahorro_inicial: monto_retiro_ahorro_inicial,
            monto_retiro_ahorro_voluntario: monto_retiro_ahorro_voluntario,
            monto_retiro_ahorro_programado: monto_retiro_ahorro_programado,
            // monto_amortizacion_capital: monto_total_amortizacion_capital,
            // monto_interes: monto_total_interes,
            // monto_mora: monto_total_mora
            es_desembolso: false,
            // monto_desembolso: monto_desembolso
        };

        modelo_pago.detalle = [];

        modelo_pago.detalle.push({
            producto: {
                operacion_financiera_detalle: cuota_guardada.id,
                numero_cuota: 0, //cuota.numero_cuota,
                // monto_gasto: monto_gasto_a_pagar,
                // monto_ahorro_inicial: monto_ahorro_inicial_a_pagar,
                monto_retiro_ahorro_inicial: monto_retiro_ahorro_inicial,
                // monto_ahorro_voluntario: monto_ahorro_voluntario_a_pagar,
                monto_retiro_ahorro_voluntario: monto_retiro_ahorro_voluntario,
                // monto_ahorro_programado: monto_ahorro_programado_a_pagar,
                monto_retiro_ahorro_programado: monto_retiro_ahorro_programado,
                // monto_amortizacion_capital: monto_amortizacion_capital_a_pagar,
                // monto_interes: monto_interes_a_pagar,
                // monto_interes_ganado: cuota.monto_interes_ganado,
                // monto_retiro_interes_ganado: cuota.monto_retiro_interes_ganado,
                // monto_mora: monto_mora_a_pagar
            }
        });

        await modelo_pago.save();

        const data_recibo = {

            institucion: {
                denominacion: 'Buenavista La Bolsa S.A.C.',
                agencia: 'Agencia Ayacucho',
                direccion: 'Jr. Roma N° 170',
                ruc: '20574744599',
                frase: ''
            },
            persona: {
                documento_identidad: modelo.persona.documento_identidad,
                nombre_completo: modelo.persona.apellido_paterno +
                    ' ' + modelo.persona.apellido_materno +
                    ', ' + modelo.persona.nombre
            },


            // documento_identidad_socio: documento_identidad_socio,
            // nombres_apellidos_socio: nombres_apellidos_socio,
            analista: modelo.analista.nombre_usuario,
            // analista: modelo.analista.usuario.persona.nombre +
            //     ' ' + modelo.analista.usuario.persona.apellido_paterno +
            //     ' ' + modelo.analista.usuario.persona.apellido_materno,

            producto: {
                descripcion: modelo.producto.programacion, //TODO corregir programacion
                // cuota: 0,
                // monto_desembolso: monto_desembolso.toFixed(2)
                // monto_gasto: monto_total_gasto.toFixed(2),
                monto_retiro_ahorro_inicial: Number(monto_retiro_ahorro_inicial).toFixed(2),
                monto_retiro_ahorro_voluntario: Number(monto_retiro_ahorro_voluntario).toFixed(2),
                monto_retiro_ahorro_programado: Number(monto_retiro_ahorro_programado).toFixed(2),
                // monto_amortizacion_capital: monto_total_amortizacion_capital.toFixed(2),
                // monto_interes: monto_total_interes.toFixed(2),
                // monto_mora: monto_total_mora.toFixed(2),
            },
            recibo: {
                usuario: req.header('usuario_sesion'),
                numero: recibo.numero,
                fecha: recibo.fecha,
                tipo_impresion: 'Original',
                monto_total: Number(monto_total).toFixed(2)
            }
        };

        res.json({
            ok: true,
            recibo: data_recibo
                // recibo: getRecibo(data_recibo)
        })

        // res.json({
        //     ok: true,
        //     msg: "Desembolso realizado satisfactoriamente.",
        // });

    } catch (error) {

        const controller = "operacion-financiera-pago.controller.js -> retirar_ahorros_operacion_financiera";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

module.exports = {

    listar,
    listar_operaciones_financieras_detalle_vigentes,
    pagar_operacion_financiera,
    registrarIngresoEgreso,
    desembolsar_operacion_financiera,
    anular_recibo,
    pagar_operacion_financiera_por_analista,
    confirmar_pago_analista,
    crear_pagar_ahorro,
    pagar_ahorro,
    listar_libro_diario,
    retirar_ahorros_operacion_financiera,
};