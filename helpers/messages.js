const messages = [
    { id: 'msgConnBD', msg: 'Conexión a Base de Datos iniciado correctamente.' },
    { id: 'msgError500', msg: 'Ocurrió un error inesperado, favor de contactar con informática.' },
    { id: 'msgErrorToken', msg: 'El token no es correcto.' },
    { id: 'msg003', msg: 'Error inesperdo' },
    { id: 'msg004', msg: 'Error inesperdo' },
];

const getMessage = (id) => {

    const message = messages.find(msg => msg.id === id);
    return message.msg;
}

module.exports = {
    getMessage
}