const { response } = require("express");
const dayjs = require("dayjs");
const CajaDiario = require("../../../models/core/caja/caja-diario.model");
const Operaciones = require("../../../models/core/caja/operacion-financiera-pago.model");

const cerrarCaja = async(req, res = response) => {
    
    
    try {
        const id = req.params.id;
        const { comentario } = req.body;
        const now = dayjs();
        
        //const cajaDiario = await CajaDiario.findById(id);
        const modelo = await CajaDiario.findOne({"caja": id, "estado": "Abierto"});

        const operaciones = await Operaciones.find({
                "recibo.estado": "Vigente",
                "diario.caja_diario": modelo.id,
                "diario.estado": "Abierto",
                "diario.caja": modelo.caja
            }, "recibo.monto_total es_ingreso ",
            function(err, obj) {
                let ingreso = []
                let monto_ingreso = 0;
                let egreso = []
                let monto_egreso = 0;
                obj.forEach(i => {
                    if (i.es_ingreso == true) {
                        console.log(i.recibo.monto_total);
                        ingreso.push(i.recibo.monto_total)
                    } else if (i.recibo.es_ingreso == false) {
                        egreso.push(i.recibo.monto_total)
                    }
                });
                ingreso.forEach(element => {
                    monto_ingreso += element
                });
                egreso.forEach(element => {
                    monto_egreso += element
                });
                monto_total_operaciones = monto_ingreso - monto_egreso
                return monto_total_operaciones;
            })
            console.log(monto_total_operaciones);

        const actualizarOperaciones = await Operaciones.updateMany({
            "es_vigente": true,
            "diario.caja_diario": modelo["_id"],
            "diario.caja": modelo.caja
        }, {"diario.estado" :"Cerrado"})

        // Actualización de la caja-cierre
        
        // asignar valores
        let monto_doscientos_soles = req.body.cantidad_doscientos_soles_cierre * 200;
        let monto_cien_soles = req.body.cantidad_cien_soles_cierre * 100;
        let monto_cincuenta_soles = req.body.cantidad_cincuenta_soles_cierre * 50;
        let monto_veinte_soles = req.body.cantidad_veinte_soles_cierre * 20;
        let monto_diez_soles = req.body.cantidad_diez_soles_cierre * 10;
        let monto_cinco_soles = req.body.cantidad_cinco_soles_cierre * 5;
        let monto_dos_soles = req.body.cantidad_dos_soles_cierre * 2;
        let monto_un_sol = req.body.cantidad_un_sol_cierre;
        let monto_cincuenta_centimos = (req.body.cantidad_cincuenta_centimos_cierre * 5) / 10;
        let monto_veinte_centimos = ((req.body.cantidad_veinte_centimos_cierre * 2) / 10);
        let monto_diez_centimos = (req.body.cantidad_diez_centimos_cierre) / 10;
        // console.log(monto_diez_centimos, monto_doscientos_soles, monto_cien_soles, monto_cincuenta_soles, monto_veinte_centimos, monto_cincuenta_centimos )

        let monto_total = (monto_doscientos_soles + monto_cien_soles + monto_cincuenta_soles + monto_veinte_soles +
            monto_diez_soles + monto_cinco_soles + monto_dos_soles + monto_un_sol + monto_cincuenta_centimos + 
            monto_veinte_centimos+ monto_diez_centimos);
        
        // // obtener valores      
        modelo.cierre = {
            cantidad_doscientos_soles_cierre: req.body.cantidad_doscientos_soles_cierre,
            cantidad_cien_soles_cierre: req.body.cantidad_cien_soles_cierre,
            cantidad_cincuenta_soles_cierre: req.body.cantidad_cincuenta_soles_cierre,
            cantidad_veinte_soles_cierre: req.body.cantidad_veinte_soles_cierre,
            cantidad_diez_soles_cierre: req.body.cantidad_diez_soles_cierre,
            cantidad_cinco_soles_cierre: req.body.cantidad_cinco_soles_cierre,
            cantidad_dos_soles_cierre: req.body.cantidad_dos_soles_cierre,
            cantidad_un_sol_cierre: req.body.cantidad_un_sol_cierre,
            cantidad_cincuenta_centimos_cierre: req.body.cantidad_cincuenta_centimos_cierre,
            cantidad_veinte_centimos_cierre: req.body.cantidad_veinte_centimos_cierre,
            cantidad_diez_centimos_cierre: req.body.cantidad_diez_centimos_cierre,
        },
        modelo.monto_total_efectivo = monto_total,
        modelo.monto_total_operaciones = monto_total_operaciones,
        // modelo.cantidad_operaciones = ,
        //modelo.estado = "Cerrado",
        modelo.comentario.push({
            tipo: 'Editado',
            idUsuario: req.header('id_usuario_sesion'),
            usuario: req.header('usuario_sesion'),
            nombre: req.header('nombre_sesion'),
            fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
            comentario
        });
        
        // Guardar cambios
        
        await modelo.save();
        res.json({
            ok: true,
            operaciones,
            actualizarOperaciones,
            msg: 'Caja actualizada'

        })
    } catch (error) {

        console.log(error);
        res.json({
            ok: false,
            msg: 'Hable con el Admin!!!!!!!!'
        })
    }
}




const cargarCaja = async(req, res) => {

    const id = req.params.id;

    try {

        const cajaDiario = await  CajaDiario.findOne({ estado: "Abierto" },
            "monto_total_apertura apertura.fecha_apertura id caja")
        console.log(cajaDiario.caja);
        /* const fechasApertura = await CajaDiario.find({estado: "Abierto" }, "apertura.fecha_apertura")
        console.log(fechasApertura); */

        const cant_operaciones = await Operaciones.find({
                "es_vigente": true,
                "diario.caja_diario": cajaDiario["_id"],
                "diario.caja": cajaDiario.caja
            })
            .countDocuments();

        const obtenerCaja = await Operaciones.find({
                "recibo.estado": "Vigente",
                "diario.caja_diario": cajaDiario.id,
                "diario.caja": cajaDiario.caja,
                "diario.estado": "Abierto"
            },
            " es_ingreso recibo.monto_total",
            function(err, obj) {
                let ingreso = []
                let egreso = []
                let monto_ingreso = 0;
                let monto_egreso = 0;
                obj.forEach(i => {
                    if (i.es_ingreso == true) {
                        console.log(i.recibo.monto_total);
                        ingreso.push(i.recibo.monto_total)
                    } else if (i.es_ingreso == false) {
                        egreso.push(i.recibo.monto_total)
                    }
                });
                ingreso.forEach(element => {
                    monto_ingreso += element
                });
                egreso.forEach(element => {
                    monto_egreso += element
                });
                monto_total_operaciones = monto_ingreso - monto_egreso
                return res.json({
                    ok: true,
                    monto_total_operaciones,
                    monto_total_apertura: cajaDiario["monto_total_apertura"],
                    cant_operaciones,
                    idCaja:cajaDiario.caja,
                    fecha_apertura: cajaDiario.apertura.fecha_apertura,
                    /* cajaDiario, */
                })
            })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado.'
        });
    }
}


module.exports = {
    cerrarCaja,
    cargarCaja
};