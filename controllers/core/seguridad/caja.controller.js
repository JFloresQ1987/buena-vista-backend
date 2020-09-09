const { response } = require("express");
const dayjs = require("dayjs");
const Caja = require("../../../models/core/seguridad/caja.model");

const crear = async (req, res = response) => {
  const { id, comentario } = req.body;

  try {
    const existe_registro = await Caja.findById(id);

    if (existe_registro) {
      return res.status(400).json({
        ok: false,
        msg: "La caja ya esta registrada.",
      });
    }

    const modelo = new Caja(req.body);
    const now = dayjs();

    modelo.comentario = [
      {
        tipo: "Nuevo",
        usuario: req.header("id_usuario_sesion"),
        usuario: req.header("usuario_sesion"),
        nombre: req.header("nombre_sesion"),
        fecha: now.format("DD/MM/YYYY hh:mm:ss a"),
        comentario,
      },
    ];
    await modelo.save();

    res.json({
      ok: true,
      modelo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      error: error,
      msg: "Error inesperado.",
    });
  }
};

const listar = async (req, res) => {
  const cajas = await Caja.find({ es_borrado: false })
        .populate({path:"usuario", select:"persona usuario", populate:{path:"persona", select:"nombre apellido_paterno apellido_materno"}});

  const total = await Caja.find({ es_borrado: false }).countDocuments();

  res.json({
    ok: true,
    cajas,
    total,
  });
};

const actualizar = async(req, res = response) => {

  const id = req.params.id;

  const { comentario } = req.body;

  try {

      const caja = await Caja.findById(id)

      if (!caja) {
          return res.status(404).json({
              ok: false,
              msg: 'Caja no encontrada'
          })
      }

      const modelo = await Caja.findById(id) 
      const now = dayjs();

      modelo.descripcion = req.body.descripcion,
      modelo.ip = req.body.ip,                
      modelo.pc_nombre = req.body.pc_nombre,
      modelo.usuario = req.body.usuario,
      modelo.comentario.push({
          tipo: 'Editado',
          idUsuario: req.header('id_usuario_sesion'),
          usuario: req.header('usuario_sesion'),
          nombre: req.header('nombre_sesion'),
          fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
          comentario
      });


      await modelo.save(); 
      res.json({
          ok: true,
          msg: 'Caja actualizada'
           
      })
  } catch (error) {

      console.log(error);
      res.status(500).json({
          ok: false,
          msg: 'Hable con el Adm'
      })
  }
}

const buscar_caja = async(req, res) => {

  try {

      const id = req.params.id;
      const caja = await Caja.findById(id);

      res.json({
          ok: true,
          caja
      })
  } catch (error) {

      console.log(error);
      // console.log(error.message);
      //e.message
      res.status(500).json({
          ok: false,
          msg: error.message
      });
  }
}

module.exports = {
  crear,
  listar,
  actualizar,
  buscar_caja
};
