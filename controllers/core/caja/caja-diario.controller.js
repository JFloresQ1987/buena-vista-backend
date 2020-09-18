const { response } = require("express");
const dayjs = require("dayjs");
const CajaDiario = require("../../../models/core/caja/caja-diaria.model");
const Operaciones = require("../../../models/core/caja/operacion-financiera-pago.model");

const actualizar = async(req, res = response) => {

    const id = req.params.id;  
    const { comentario } = req.body;
  
    try {
  
        const cajaDiario = await CajaDiario.findById(id);
  
        if (!cajaDiario) {
            return res.status(404).json({
                ok: false,
                msg: 'Caja no encontrada'
            })
        }

        const operaciones = await Operaciones.find({},"es_ingreso")
        
        
        
        
        
        
        
        

        
        
        
        
        
        
        
        
        
        
        
        
        // Actualización de la caja-cierre
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

        console.log(monto_diez_centimos, monto_doscientos_soles, monto_cien_soles, monto_cincuenta_soles, monto_veinte_centimos, monto_cincuenta_centimos )

        let monto_total = monto_doscientos_soles+ monto_cien_soles+ monto_cincuenta_soles+ monto_veinte_soles+
                          monto_diez_soles+ monto_cinco_soles+ monto_dos_soles+ monto_un_sol + monto_cincuenta_centimos + monto_veinte_centimos;
        
        // obtener valores
        modelo.cantidad_doscientos_soles_cierre = req.body.cantidad_doscientos_soles_cierre ;
        modelo.cantidad_cien_soles_cierre = req.body.cantidad_cien_soles_cierre;
        modelo.cantidad_cincuenta_soles_cierre = req.body.cantidad_cien_soles_cierre ;
        modelo.cantidad_veinte_soles_cierre = req.body.cantidad_cien_soles_cierre ;
        modelo.cantidad_diez_soles_cierre = req.body.cantidad_cien_soles_cierre ;
        modelo.cantidad_cinco_soles_cierre = req.body.cantidad_cien_soles_cierre ;
        modelo.cantidad_dos_soles_cierre = req.body.cantidad_cien_soles_cierre;
        modelo.cantidad_un_sol_cierre = req.body.cantidad_cien_soles_cierre;
        modelo.cantidad_cincuenta_centimos_cierre = req.body.cantidad_cien_soles_cierre ;
        modelo.cantidad_veinte_centimos_cierre = req.body.cantidad_cien_soles_cierre ;
        modelo.cantidad_diez_centimos_cierre = req.body.cantidad_cien_soles_cierre ;         
        modelo.cantidad_operaciones = req.body.cantidad_operaciones,
        modelo.monto_total_efectivo = monto_total,
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
            msg: 'Hable con el Adm'
        })
    }
}


  
module.exports = {
    actualizar        
};
  