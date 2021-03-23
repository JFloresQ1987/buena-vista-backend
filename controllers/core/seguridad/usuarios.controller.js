const { response } = require("express");
const bcrypt = require("bcryptjs");
const dayjs = require('dayjs');
const logger = require('../../../helpers/logger');
const { getMessage } = require('../../../helpers/messages');
const Usuario = require("../../../models/core/seguridad/usuario.model");
const Persona = require("../../../models/core/registro/persona.model");

const listar = async(req, res) => {

    try {
        const desde = Number(req.query.desde) || 0;
        //const modelo = await Usuario.find({ "es_borrado": false }, 'usuario debe_cambiar_clave_inicio_sesion es_bloqueado es_vigente')

        const [usuarios, total] = await Promise.all([
            Usuario.find({
                    es_vigente: true,
                    es_borrado: false
                },
                "usuario debe_cambiar_clave_inicio_sesion es_bloqueado es_vigente rol"
            )
            .populate("persona", "nombre apellido_paterno apellido_materno documento_identidad")
            .sort({ persona: -1 })
            .skip(desde)
            .limit(10),
            Usuario.find({ es_vigente: true, es_borrado: false }).countDocuments(),
        ]);

        res.json({
            ok: true,
            usuarios,
            total,
        });

    } catch (error) {

        const controller = "usuarios.controller.js -> listar";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const listarxRol = async(req, res = response) => {

    try {
        const id = req.params.id;
        const usuarios = await Usuario.find({
            es_borrado: false,
            es_vigente: true,
            rol: { $in: id },
        }).populate("persona", "nombre apellido_paterno apellido_materno documento_identidad");
        return res.json({
            ok: true,
            usuarios,
        });

    } catch (error) {

        const controller = "usuarios.controller.js -> listarxRol";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const crear = async(req, res = response) => {
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
        persona.comentario = [{
            tipo: "Nuevo",
            usuario: req.header("id_usuario_sesion"),
            usuario: req.header("usuario_sesion"),
            nombre: req.header("nombre_sesion"),
            fecha: now.format("DD/MM/YYYY hh:mm:ss a"),
            comentario,
        }, ];
        const existe_usuario = await Usuario.findOne({ documento_identidad });
        if (existe_usuario)
            return res.status(400).json({
                ok: false,
                msg: "El usuario ya esta registrado.",
            });

        await persona.save();

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

        const controller = "usuarios.controller.js -> crear";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const getUsuario = async(req, res) => {
    try {
        const id = req.params.id;
        const usuario = await Usuario.findById(id).populate(
            "persona",
            "nombre apellido_paterno apellido_materno fecha_nacimiento documento_identidad es_masculino numero_telefono numero_celular correo_electronico domicilio referencia_domicilio ubigeo comentario"
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

        const controller = "usuarios.controller.js -> getUsuario";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const actualizar = async(req, res = response) => {
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
        usuarioM.local_atencion = req.body.local_atencion;
        await usuarioM.save();

        const persona = await Persona.findOne({ documento_identidad });
        persona.nombre = req.body.nombre;

        persona.apellido_paterno = req.body.apellido_paterno;
        persona.apellido_materno = req.body.apellido_materno;
        persona.fecha_nacimiento = req.body.fecha_nacimiento;
        persona.ubigeo = {
            // codigo: "101",
            departamento: req.body.departamento,
            provincia: req.body.provincia,
            distrito: req.body.distrito,
        };
        persona.numero_celular = req.body.numero_celular;
        persona.numero_telefono = req.body.numero_telefono;
        persona.correo_electronico = req.body.correo_electronico;
        persona.domicilio = req.body.domicilio;
        persona.referencia_domicilio = req.body.referencia_domicilio;
        // persona.local_atencion = req.body.local_atencion;
        persona.comentario.push({
            tipo: "Editado",
            usuario: req.header("id_usuario_sesion"),
            usuario: req.header("usuario_sesion"),
            nombre: req.header("nombre_sesion"),
            fecha: now.format("DD/MM/YYYY hh:mm:ss a"),
            comentario,
        });
        await persona.save();
        res.json({
            ok: true,
            msg: "Usuario editado Correctamente",
        });
    } catch (error) {

        const controller = "usuarios.controller.js -> actualizar";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const cambiarClaveAdministrador = async(req, res = response) => {
    try {
        const id = req.params.id;
        const usuario = await Usuario.findById(id);
        usuario.clave = req.body.clave;
        const now = dayjs();
        const salt = bcrypt.genSaltSync();
        usuario.clave = bcrypt.hashSync(usuario.clave, salt);
        usuario.comentario.push({
            tipo: "Editado",
            usuario: req.header("id_usuario_sesion"),
            usuario: req.header("usuario_sesion"),
            nombre: req.header("nombre_sesion"),
            fecha: now.format("DD/MM/YYYY hh:mm:ss a"),
            comentario: "Cambio de Clave",
        });
        await usuario.save();

        return res.json({
            ok: true,
            msg: "Clave cambiada correctamente",
        });
    } catch (error) {

        const controller = "usuarios.controller.js -> cambiarClaveAdministrador";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const cambiarClaveUsuario = async(req, res = response) => {
    try {
        const { usuario, old_password, password } = req.body;
        const modelo = await Usuario.findOne({ usuario });

        const clave_valido = bcrypt.compareSync(old_password, modelo.clave);
        if (!clave_valido) {
            return res.status(400).json({
                ok: false,
                msg: "La clave anterior no es la correcta",
            });
        }

        modelo.clave = password;

        const salt = bcrypt.genSaltSync();
        modelo.clave = bcrypt.hashSync(modelo.clave, salt);

        await modelo.save();

        return res.json({
            ok: true,
            msg: "Clave cambiada correctamente",
        });
    } catch (error) {

        const controller = "usuarios.controller.js -> cambiarClaveUsuario";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const cambiarVigencia = async(req, res = response) => {
    try {
        const id = req.params.id;
        const { comentario } = req.body;
        const now = dayjs();
        const usuario = await Usuario.findById(id);
        usuario.es_vigente = !usuario.es_vigente;
        usuario.comentario.push({
            tipo: "Editado",
            usuario: req.header("id_usuario_sesion"),
            usuario: req.header("usuario_sesion"),
            nombre: req.header("nombre_sesion"),
            fecha: now.format("DD/MM/YYYY hh:mm:ss a"),
            comentario,
        });

        await usuario.save();
        return res.json({
            ok: true,
            msg: usuario.es_vigente ? "Usuario vigente!" : "Usuario dado de baja.",
        });
    } catch (error) {

        const controller = "usuarios.controller.js -> cambiarVigencia";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

module.exports = {
    listar,
    crear,
    getUsuario,
    actualizar,
    listarxRol,
    cambiarClaveAdministrador,
    cambiarClaveUsuario,
    cambiarVigencia,
};