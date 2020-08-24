const path = require('path');
const { response } = require('express');
const { v4: uuidv4 } = require('uuid');

const fileUpload = (req, res = response) => {

    const id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0)
        return res.status(400).json({
            ok: false,
            msg: 'No hay ningún documento seleccionado.'
        });

    const file = req.files.imagen;
    const nombreCortado = file.name.split('.');
    const extension = nombreCortado[nombreCortado.length - 1];
    const expensiones_validas = ['png', 'jpg', 'jpeg', 'gif'];

    if (!expensiones_validas.includes(extension))
        return res.status(400).json({
            ok: false,
            msg: 'Extensión de documento no permitido.'
        });

    const nombre_documento = `${uuidv4()}.${extension}`;
    const path = `./documents/${nombre_documento}`;

    file.mv(path, (err) => {

        if (err)
            return res.status(500).json({
                ok: false,
                msg: 'Error al subir el documento.'
            });

        res.json({
            ok: true,
            msg: 'Documento subido satisfactoriamente.',
            nombre_documento
        });
    })

}

const readFile = (req, res) => {

    const documento = req.params.documento;
    const path_documento = path.join(__dirname, `../documents/${documento}`);

    res.sendFile(path_documento, (err) => {

        if (err)
            return res.status(500).json({
                ok: false,
                msg: 'Error al leer el documento.'
            });
    });
}

module.exports = {
    fileUpload,
    readFile
}