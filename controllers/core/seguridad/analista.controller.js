const { response } = require("express");
const bcrypt = require("bcryptjs");
const dayjs = require("dayjs");
const Analista = require("../../../models/core/seguridad/analista.model");

const listar = async(req, res = response) => {
    const desde = Number(req.query.desde) || 0;
    const [analistas, total] = await Promise.all([
        Analista.find({ es_borrado: false },
            "descripcion producto usuario es_bloqueado es_vigente"
        )
        .populate({
            path: "usuario",
            select: "rol persona usuario",
            populate: {
                path: "persona",
                select: "nombre apellido_paterno apellido_materno",
            },
        })
        .skip(desde)
        .limit(10),
        Analista.find({ es_borrado: false }).countDocuments()
    ])
    res.json({
        ok: true,
        analistas,
        total
    });
};

const crear = async(req, res = response) => {
    try {
        const { usuario, comentario } = req.body;
        const now = dayjs();
        const model = await Analista.findOne({ usuario });
        /* if (model) {
          return res.json({
            ok: false,
            msg: "El analista ya esta creado",
          });
        } */
        const analista = new Analista(req.body);
        analista.comentario = [{
            tipo: "Nuevo",
            usuario: req.header("id_usuario_sesion"),
            usuario: req.header("usuario_sesion"),
            nombre: req.header("nombre_sesion"),
            fecha: now.format("DD/MM/YYYY hh:mm:ss a"),
            comentario,
        }, ];
        await analista.save();
        return res.json({
            ok: true,
            msg: "Analista creado correctamente",
        });
    } catch (err) {
        res.status(500).json({
            ok: false,
            msg: "Error inesperado",
        });
    }
};

const getAnalista = async(req, res = response) => {
    try {
        const id = req.params.id;
        const analista = await Analista.findById(id);
        if (!analista) {
            return res.status(400).json({
                ok: false,
                msg: "Analista no encontrado",
            });
        }
        return res.json({
            ok: true,
            analista,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: error.message,
        });
    }
};

const actualizar = async(req, res = response) => {
    try {
        const id = req.params.id;
        const { comentario } = req.body;
        const now = dayjs();
        const analista = await Analista.findById(id);
        if (!analista) {
            return res.status(400).json({
                ok: false,
                msg: "Error al actualizar los datos",
            });
        }
        analista.descripcion = req.body.descripcion;
        analista.producto = req.body.producto;
        analista.usuario = req.body.usuario;
        analista.comentario.push({
            tipo: "Editado",
            idusuario: req.header("id_usuario_sesion"),
            usuario: req.header("usuario_sesion"),
            nombre: req.header("nombre_sesion"),
            fecha: now.format("DD/MM/YYYY hh:mm:ss a"),
            comentario,
        });
        await analista.save();
        return res.json({
            ok: true,
            msg: "Analista Actualizado correctamente",
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: error.message,
        });
    }
};

const getListaDesplegablexProducto = async(req, res = response) => {

    try {

        const producto = req.params.producto;
        const lista = await Analista.find({ "producto": producto, "es_vigente": true, "es_borrado": false }, "id")
            .populate({
                path: "usuario",
                select: "persona",
                populate: {
                    path: "persona",
                    select: "nombre apellido_paterno apellido_materno",
                    // $concat: ["$nombre", "$apellido_paterno", "$apellido_materno"]
                },
            });

        // console.log(lista)

        res.json({
            ok: true,
            lista,
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: error.message,
        });
    }
};

module.exports = {
    listar,
    crear,
    getAnalista,
    actualizar,
    getListaDesplegablexProducto
};