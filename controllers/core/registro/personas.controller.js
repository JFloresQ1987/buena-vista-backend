const { response } = require('express');
const dayjs = require('dayjs');
const logger = require('../../../helpers/logger');
const { getMessage } = require('../../../helpers/messages');
const Persona = require('../../../models/core/registro/persona.model');
const Ubigeo = require('../../../models/core/ubigeo.model');

const listar = async(req, res) => {

    try {

        const modelo = await Persona.find({ "es_borrado": false });

        res.json({
            ok: true,
            modelo
        })

    } catch (error) {

        const controller = "personas.controller.js -> listar";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}


const actualizar = async(req, res = response) => {

    const id = req.params.id;
    const uid = req.uid;

    const { comentario } = req.body;

    try {

        const persona = await Persona.findById(id)

        if (!persona) {
            return res.status(404).json({
                ok: false,
                msg: 'Persona no encontrada'
            })
        }

        const modelo = await Persona.findById(id)
        const now = dayjs();

        modelo.nombre = req.body.nombre,
            modelo.apellido_paterno = req.body.apellido_paterno,
            modelo.apellido_materno = req.body.apellido_materno,
            modelo.documento_identidad = req.body.documento_identidad,
            modelo.fecha_nacimiento = req.body.fecha_nacimiento,
            modelo.es_masculino = req.body.es_masculino,
            modelo.numero_telefono = req.body.numero_telefono,
            modelo.numero_celular = req.body.numero_celular,
            modelo.correo_electronico = req.body.correo_electronico,
            modelo.domicilio = req.body.domicilio,
            modelo.referencia_domicilio = req.body.referencia_domicilio,
            modelo.avatar = req.body.avatar,
            modelo.ubigeo = {
                // cocigo: "101",
                departamento: req.body.departamento,
                provincia: req.body.provincia,
                distrito: req.body.distrito,
            }
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
            msg: "Actualizar socio",
        });
    } catch (error) {

        const controller = "personas.controller.js -> actualizar";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const crear = async(req, res = response) => {
    const { documento_identidad, comentario } = req.body;

    try {
        const existe_registro = await Persona.findOne({ documento_identidad });

        if (existe_registro) {
            return res.status(400).json({
                ok: false,
                msg: "La persona ya esta registrada.",
            });
        }

        const modelo = new Persona(req.body);

        modelo.ubigeo = {
            // cocigo: "101",
            departamento: req.body.departamento,
            provincia: req.body.provincia,
            distrito: req.body.distrito,
        }

        const now = dayjs();

        modelo.comentario = [{
            tipo: "Nuevo",
            usuario: req.header("id_usuario_sesion"),
            usuario: req.header("usuario_sesion"),
            nombre: req.header("nombre_sesion"),
            fecha: now.format("DD/MM/YYYY hh:mm:ss a"),
            comentario,
        }, ];
        await modelo.save();

        res.json({
            ok: true,
            modelo,
        });
    } catch (error) {

        const controller = "personas.controller.js -> crear";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const buscar_por_documento_identidad = async(req, res) => {
    try {
        const documento_identidad = req.params.documento_identidad;
        const persona = await Persona.findOne({
            documento_identidad: documento_identidad,
            es_borrado: false,
        });

        res.json({
            ok: true,
            persona,
        });
    } catch (error) {

        const controller = "personas.controller.js -> buscar_por_documento_identidad";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const buscar_id = async(req, res) => {
    try {
        const id = req.params.id;
        const persona = await Persona.findById(id);

        res.json({
            ok: true,
            persona,
        });
    } catch (error) {

        const controller = "personas.controller.js -> buscar_id";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const buscar_por_nombre = async(req, res) => {
    const desde = Number(req.query.desde) || 0;
    try {
        let termino = req.params.termino;
        let regex = new RegExp(termino, "i");

        const persona = await Persona.find({ nombre: regex },
                "documento_identidad domicilio nombre apellido_paterno apellido_materno"
            )
            .limit(15)
            .skip(desde)
            .sort({ nombre: 1 });
        const total = await Persona.find({ nombre: regex }).countDocuments();
        res.json({
            ok: true,
            persona,
            total,
        });
    } catch (error) {

        const controller = "personas.controller.js -> buscar_por_nombre";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const buscar_por_apellido = async(req, res) => {
    const desde = Number(req.query.desde) || 0;
    try {
        let termino = req.params.termino;
        let regex = new RegExp(termino, "i");

        const persona = await Persona.find({ apellido_paterno: regex },
                "documento_identidad domicilio nombre apellido_paterno apellido_materno"
            )
            .limit(15)
            .skip(desde)
            .sort({ nombre: 1 });
        const total = await Persona.find({
            apellido_paterno: regex,
        }).countDocuments();

        res.json({
            ok: true,
            persona,
            total,
        });
    } catch (error) {

        const controller = "personas.controller.js -> buscar_por_apellido";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const buscar_por_apellido_mat = async(req, res) => {
    const desde = Number(req.query.desde) || 0;
    try {
        let termino = req.params.termino;
        let regex = new RegExp(termino, "i");

        const persona = await Persona.find({ apellido_materno: regex },
                "documento_identidad domicilio nombre apellido_paterno apellido_materno"
            )
            .limit(15)
            .skip(desde)
            .sort({ nombre: 1 });
        const total = await Persona.find({
            apellido_materno: regex,
        }).countDocuments();
        res.json({
            ok: true,
            persona,
            total,
        });
    } catch (error) {

        const controller = "personas.controller.js -> buscar_por_apellido_mat";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const datos_persona_reporte = async(req, res) => {

    try {
        const id = req.params.id;
        const persona = await Persona.findById(
            id,
            "apellido_paterno apellido_materno nombre documento_identidad ubigeo domicilio numero_celular"
        );
        u = {};
        const ubigeo = await Ubigeo.findById(persona.ubigeo.departamento);
        u["departamento"] = ubigeo.departamento;
        ubigeo.provincias.forEach((p) => {
            if (String(p._id) === String(persona.ubigeo.provincia)) {
                u["provincia"] = p.provincia;
                p.distritos.forEach((d) => {
                    if (String(d._id) === String(persona.ubigeo.distrito)) {
                        u["distrito"] = d.distrito;
                    }
                });
            }
        });

        const model = {
            numero_celular: persona.numero_celular,
            nombre: persona.nombre,
            documento_identidad: persona.documento_identidad,
            domicilio: persona.domicilio,
            apellido_paterno: persona.apellido_paterno,
            apellido_materno: persona.apellido_materno,
            ubigeo: u
        }
        return res.json({
            ok: true,
            persona: model,
        });

    } catch (error) {

        const controller = "personas.controller.js -> datos_persona_reporte";
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
    actualizar,
    buscar_por_documento_identidad,
    buscar_id,
    buscar_por_nombre,
    buscar_por_apellido,
    buscar_por_apellido_mat,
    datos_persona_reporte,
};