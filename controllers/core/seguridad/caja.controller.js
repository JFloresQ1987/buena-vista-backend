const { response } = require("express");
const dayjs = require('dayjs');
const logger = require('../../../helpers/logger');
const { getMessage } = require('../../../helpers/messages');
const Caja = require("../../../models/core/seguridad/caja.model");

const crear = async(req, res = response) => {
    const { id, ip, serie, comentario } = req.body;

    try {
        const existe_ip = await Caja.findOne({ ip });
        const existe_serie = await Caja.findOne({ serie });


        if (existe_ip || existe_serie) {
            return res.status(400).json({
                ok: false,
                msg: "La caja ya esta registrada.",
            });
        }


        const modelo = new Caja(req.body);
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

        const controller = "caja.controller.js -> crear";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
};

const listar = async(req, res) => {
    const cajas = await Caja.find({ es_borrado: false })
        .populate({
            path: "usuario",
            select: "persona usuario",
            populate: { path: "persona", select: "nombre apellido_paterno apellido_materno" }
        });

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
            modelo.codigo = req.body.codigo,
            modelo.pc_nombre = req.body.pc_nombre,
            modelo.usuario = req.body.usuario,
            modelo.nombre_usuario = req.body.nombre_usuario,
            modelo.documento_identidad_usuario = req.body.documento_identidad_usuario,
            modelo.serie = req.body.serie,
            modelo.es_caja_principal = req.body.es_caja_principal,
            modelo.local_atencion = req.body.local_atencion,
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

        const controller = "caja.controller.js -> actualizar";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
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

        const controller = "caja.controller.js -> buscar_caja";
        logger.logError(controller, req, error);

        return res.status(500).json({
            ok: false,
            msg: getMessage('msgError500')
        });
    }
}

module.exports = {
    crear,
    listar,
    actualizar,
    buscar_caja
};