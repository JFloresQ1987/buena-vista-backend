const { response } = require("express");
const bcrypt = require("bcryptjs");
const dayjs = require("dayjs");
const Usuario = require("../../../models/core/seguridad/usuario.model");
const Persona = require("../../../models/core/registro/persona.model");

const listar = async (req, res) => {
  //const modelo = await Usuario.find({ "es_borrado": false }, 'usuario debe_cambiar_clave_inicio_sesion es_bloqueado es_vigente')
  const usuarios = await Usuario.find(
    { es_borrado: false },
    "usuario debe_cambiar_clave_inicio_sesion es_bloqueado es_vigente"
  )
    .populate("persona", "nombre apellido_paterno apellido_materno")
    .sort({ persona: -1 });
  //).populate('persona','nombre apellido_paterno apellido_materno');

  const total = await Usuario.find({ es_borrado: false }).countDocuments();

  res.json({
    ok: true,
    usuarios,
    total,
  });
};

const crear = async (req, res = response) => {
  //const { usuario, clave } = req.body;

  try {
    const { documento_identidad, comentario } = req.body;
    const existe_registro = await Persona.findOne({ documento_identidad });

    if (existe_registro) {
      return res.status(400).json({
        ok: false,
        msg: "La persona ya esta registrado.",
      });
    }

    const persona = new Persona(req.body);
    const now = dayjs();
    persona.comentario = [
      {
        tipo: "Nuevo",
        usuario: req.header("usuario"),
        nombre: req.header("nombre"),
        fecha: now.format("DD/MM/YYYY hh:mm:ss a"),
        comentario,
      },
    ];
    const existe_usuario = await Usuario.findOne({ documento_identidad });
    if (existe_usuario)
      return res.status(400).json({
        ok: false,
        msg: "El usuario ya esta registrado.",
      });

    persona.save();

    usuario = {
      usuario: persona.documento_identidad,
      clave: persona.documento_identidad,
      persona: persona._id,
      rol: req.body.rol,
    };

    const modelo = new Usuario(usuario);

    const salt = bcrypt.genSaltSync();
    modelo.clave = bcrypt.hashSync(usuario.clave, salt);

    await modelo.save();

    res.json({
      ok: true,
      modelo,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Error inesperado.",
    });
  }
};

const getUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    const usuario = await Usuario.findById(id).populate(
      "persona",
      "nombre apellido_paterno apellido_materno fecha_nacimiento documento_identidad es_masculino numero_telefono numero_celular correo_electronico domicilio referencia_domicilio comentario"
    );
    if (usuario) {
      res.json({
        ok: true,
        usuario,
      });
    } else {
      res.json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: error,
    });
  }
};

const actualizar = async (req, res = response) => {
  try {
    const id = req.params.id;
    const { rol, comentario, documento_identidad } = req.body;
    const now = dayjs();
    const usuarioM = await Usuario.findById(id);
    if (!usuarioM) {
      return res.status(400).json({
        ok: false,
        msg: "El usuario no existe",
      });
    }
    usuarioM.rol = rol;
    await usuarioM.save();

    const persona = await Persona.findOne({ documento_identidad });
    persona.nombre = req.body.nombre;

    persona.apellido_paterno = req.body.apellido_paterno;
    persona.apellido_materno = req.body.apellido_materno;
    persona.fecha_nacimiento = req.body.fecha_nacimiento;

    persona.numero_celular = req.body.numero_celular;
    persona.numero_telefono = req.body.numero_telefono;
    persona.correo_electronico = req.body.correo_electronico;
    persona.domicilio = req.body.domicilio;

    persona.referencia_domicilio = req.body.referencia_domicilio;
    persona.comentario.push({
      tipo: "Editar",
      usuario: req.header("usuario"),
      nombre: req.header("nombre"),
      fecha: now.format("DD/MM/YYYY hh:mm:ss a"),
      comentario,
    });
    await persona.save();
    res.json({
      ok: true,
      msg: "Usuario editado Correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Error inesperado.",
    });
  }
};

// const actualizar = async (req, res = response) => {

//     const { nombre, clave, correo } = req.body;

//     const uid = req.params.id;

//     try {

//         const modelo = await Usuario.findById({ uid });

//         if(modelo){

//             return res.status(400).json({
//                 ok: false,
//                 msg: 'No existe usuario por ese id.'
//             });
//         }

//         //TODO: validar token

//         const campos = req.body;
//         delete campos.clave;

//         if(modelo.correo !== correo){

//             const existe_correo = await Usuario.findOne({ correo });

//             if(existe_correo){

//                 return res.status(400).json({
//                     ok: false,
//                     msg: 'El existe un usuario con ese correo.'
//                 });
//             }
//         }

//         campos.correo = correo;

//         const modelo = await Usuario.findByIdAndUpdate(uid, campos);

//         res.json({
//             ok: true,
//             modelo
//         })

//     } catch (error) {

//         console.log(error);
//         res.status(500).json({
//             ok: false,
//             msg: 'Error inesperado.'
//         });
//     }
// }

module.exports = {
  listar,
  crear,
  getUsuario,
  actualizar,
};
