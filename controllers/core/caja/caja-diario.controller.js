const { response } = require("express");
const dayjs = require("dayjs");
const CajaDiario = require("../../../models/core/caja/caja-diario.model");
const Operaciones = require("../../../models/core/caja/operacion-financiera-pago.model");

const cerrarCaja = async(req, res = response) => {

    
    try {
        const id = req.params.id;  
        const { comentario } = req.body;
  
        //const cajaDiario = await CajaDiario.findById(id);
        
        const cajaDiario = await CajaDiario.findOne({estado:"Abierto"});

        // if (!cajaDiario) {
        //     return res.status(404).json({
        //         ok: false,
        //         msg: 'Caja no encontrada'
        //     })
        // }
        
        const operaciones = await Operaciones.find({"estado_pago": "Vigente", "caja_diario": cajaDiario.id/* , "cajero": id */ },"monto_total es_ingreso",function(err, obj){   
            let ingreso = []
            let monto_ingreso= 0;
            let egreso = []
            let monto_egreso= 0;
            obj.forEach(i => {
                if (i.es_ingreso == true){
                    ingreso.push(i.monto_total)
                } else if (i.es_ingreso == false){
                    egreso.push(i.monto_total)
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
          
        
        
        
        // Actualización de la caja-cierre
        console.log("id aqui wwwwwwwwwwwwwwwwwwwwwwww", id)
        const modelo = await CajaDiario.findById(id);
        const now = dayjs();
        
        
        
        // asignar valores
        let monto_doscientos_soles = req.body.cantidad_doscientos_soles_cierre * 200;
        let monto_cien_soles = req.body.cantidad_cien_soles_cierre * 100;
        let monto_cincuenta_soles = req.body.cantidad_cincuenta_soles_cierre * 50;
        let monto_veinte_soles = req.body.cantidad_veinte_soles_cierre * 20;
        let monto_diez_soles = req.body.cantidad_diez_soles_cierre * 10;
        let monto_cinco_soles = req.body.cantidad_cinco_soles_cierre * 5;
        let monto_dos_soles = req.body.cantidad_dos_soles_cierre * 2;
        let monto_un_sol = req.body.cantidad_un_sol_cierre;
        let monto_cincuenta_centimos = (req.body.cantidad_cincuenta_centimos_cierre*5)/10;
        let monto_veinte_centimos = ((req.body.cantidad_veinte_centimos_cierre*2)/10);
        let monto_diez_centimos = (req.body.cantidad_diez_centimos_cierre)/10;

        // console.log(monto_diez_centimos, monto_doscientos_soles, monto_cien_soles, monto_cincuenta_soles, monto_veinte_centimos, monto_cincuenta_centimos )

        let monto_total = monto_doscientos_soles+ monto_cien_soles+ monto_cincuenta_soles+ monto_veinte_soles+
                          monto_diez_soles+ monto_cinco_soles+ monto_dos_soles+ monto_un_sol + monto_cincuenta_centimos + monto_veinte_centimos;
        
        // // obtener valores
        modelo.cajero = req.body.cajero;
        modelo.cantidad_doscientos_soles_cierre = req.body.cantidad_doscientos_soles_cierre ;
        modelo.cantidad_cien_soles_cierre = req.body.cantidad_cien_soles_cierre;
        modelo.cantidad_cincuenta_soles_cierre = req.body.cantidad_cincuenta_soles_cierre ;
        modelo.cantidad_veinte_soles_cierre = req.body.cantidad_veinte_soles_cierre ;
        modelo.cantidad_diez_soles_cierre = req.body.cantidad_diez_soles_cierre ;
        modelo.cantidad_cinco_soles_cierre = req.body.cantidad_cinco_soles_cierre ;
        modelo.cantidad_dos_soles_cierre = req.body.cantidad_dos_soles_cierre;
        modelo.cantidad_un_sol_cierre = req.body.cantidad_un_sol_cierre;
        modelo.cantidad_cincuenta_centimos_cierre = req.body.cantidad_cincuenta_centimos_cierre ;
        modelo.cantidad_veinte_centimos_cierre = req.body.cantidad_veinte_centimos_cierre ;
        modelo.cantidad_diez_centimos_cierre = req.body.cantidad_diez_centimos_cierre ;         
        modelo.monto_total_efectivo = monto_total,
        modelo.monto_total_operaciones = monto_total_operaciones,
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
            msg: 'Caja actualizada'
             
        })
    } catch (error) {
  
        console.log(error);
        res.json({
            ok: false,
            msg: 'Hable con el Adssadasdm'
        })
    }
}




const cargarCaja = async(req, res) => {
    
    const id = req.params.id; 
    
    try {
        
        const cajaDiario = await (await CajaDiario.findOne({estado:"Abierto"}, "monto_total_apertura"));
       

        const cant_operaciones = await Operaciones.find({ "es_vigente": true, "caja_diario": cajaDiario["_id"] }).countDocuments();
        
        const obtenerCaja = await Operaciones.find({"estado_pago": "Vigente", "caja_diario": cajaDiario.id}, 
                                                    " es_ingreso monto_total", function(err, obj){
            let ingreso = []
            let monto_ingreso= 0;
            let egreso = []
            let monto_egreso= 0;
            obj.forEach(i => {
                if (i.es_ingreso == true){
                    ingreso.push(i.monto_total)
                } else if (i.es_ingreso == false){
                    egreso.push(i.monto_total)
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
                monto_total_apertura : cajaDiario["monto_total_apertura"],
                cant_operaciones,
                cajaDiario,
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
  