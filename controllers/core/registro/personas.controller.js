const { response } = require('express');
const Persona = require('../../../models/core/registro/persona.model');
const dayjs = require('dayjs');

const listar = async(req, res) => {

    const modelo = await Persona.find({ "es_borrado": false });

    res.json({
        ok: true,
        modelo
    })
}


const actualizar = async(req, res = response) => {

    const id = req.params.id;
    const uid = req.uid;

    const { comentario } = req.body;
    console.log(comentario);

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
        modelo.comentario.push({
            tipo: 'Editado',
            idUsuario: req.header('id_usuario_sesion'),
            usuario: req.header('usuario_sesion'),
            nombre: req.header('nombre_sesion'),
            fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
            comentario
        });

        console.log(req.header('x-token'));
        console.log(req.header('id_usuario_sesion'));
        console.log(req.header('usuario_sesion'));
        console.log(req.header('nombre_sesion'));

        await modelo.save(); 
        /* const cambiosPersona = {
            ...req.body,
            usuario: uid
        }
        const personaActualizada = await Persona.findByIdAndUpdate(id, cambiosPersona, { new: true }) */
        res.json({
            ok: true,
            msg: 'Actualizar socio'
             
        })
    } catch (error) {

        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el Adm'
        })
    }
}


const crear = async(req, res = response) => {

    const { documento_identidad, comentario } = req.body;

    try {

        const existe_registro = await Persona.findOne({ documento_identidad });

        if (existe_registro) {

            return res.status(400).json({
                ok: false,
                msg: 'La persona ya esta registrada.'
            });
        }

        const modelo = new Persona(req.body);
        const now = dayjs();

        modelo.comentario = [{
            tipo: 'Nuevo',
            usuario: req.header('id_usuario_sesion'),
            usuario: req.header('usuario_sesion'),
            nombre: req.header('nombre_sesion'),
            fecha: now.format('DD/MM/YYYY hh:mm:ss a'),
            comentario
        }];
        await modelo.save();

        res.json({
            ok: true,
            modelo
        })

    } catch (error) {

        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado.'
        });
    }
}

const buscar_por_documento_identidad = async(req, res) => {

    try {

        const documento_identidad = req.params.documento_identidad;
        const persona = await Persona.findOne({ "documento_identidad": documento_identidad, "es_borrado": false });


        res.json({
            ok: true,
            persona
        })
    } catch (error) {

        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado.'
        });
    }
}

const buscar_id = async(req, res) => {

    try {

        const id = req.params.id;
        const persona = await Persona.findById(id);

        res.json({
            ok: true,
            persona
        })
    } catch (error) {

        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        });
    }
}

const buscar_por_nombre = async(req, res) => {
    const desde = Number(req.query.desde) || 0;
    try {
        let termino = req.params.termino;
        let regex = new RegExp(termino, 'i')

        const persona = await Persona.find({nombre: regex}, 
            "documento_identidad domicilio nombre apellido_paterno apellido_materno")
            .limit(15)
            .skip(desde)
            .sort({"nombre": 1});
        const total = await Persona.find({nombre: regex}).countDocuments()
        res.json({
            ok: true,
            persona,
            total
        })
        
    } catch (error) {
         console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        });
    }
}

const buscar_por_apellido = async(req, res) => {
    const desde = Number(req.query.desde) || 0;
    try {
        let termino = req.params.termino;
        let regex = new RegExp(termino, 'i')

        const persona = await Persona.find({apellido_paterno: regex}, 
            "documento_identidad domicilio nombre apellido_paterno apellido_materno")
            .limit(15)
            .skip(desde)
            .sort({"nombre": 1});;
        const total = await Persona.find({apellido_paterno: regex}).countDocuments()
        
        res.json({
            ok: true,
            persona,
            total
        })
        
    } catch (error) {
         console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        });
    }
}

const buscar_por_apellido_mat = async(req, res) => {
    const desde = Number(req.query.desde) || 0;
    try {
        let termino = req.params.termino;
        let regex = new RegExp(termino, 'i')

        const persona = await Persona.find({apellido_materno: regex}, 
            "documento_identidad domicilio nombre apellido_paterno apellido_materno")
            .limit(15)
            .skip(desde)
            .sort({"nombre": 1});;
        const total = await Persona.find({apellido_materno: regex}).countDocuments()  
        res.json({
            ok: true,
            persona,
            total
        })
        
    } catch (error) {
         console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        });
    }
}


module.exports = {
    listar,
    crear,
    actualizar,
    buscar_por_documento_identidad,
    buscar_id,
    buscar_por_nombre,
    buscar_por_apellido,
    buscar_por_apellido_mat
}