const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../../../models/core/seguridad/usuario');

const listar = async(req, res) => {

    const modelo = await Usuario.find({ "es_borrado": false }, 'usuario debe_cambiar_clave_inicio_sesion es_bloqueado es_vigente');

    res.json({
        ok: true,
        modelo
    })
}

const crear = async(req, res = response) => {

    const { usuario, clave } = req.body;

    // console.log('entroo 1')

    try {

        const existe_usuario = await Usuario.findOne({ usuario });

        if (existe_usuario)
            return res.status(400).json({
                ok: false,
                msg: 'El usuario ya esta registrado.'
            });

        const modelo = new Usuario(req.body);

        const salt = bcrypt.genSaltSync();
        modelo.clave = bcrypt.hashSync(clave, salt);

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
    crear
}