const messages = [
    { id: 'msg001', msg: 'BD iniciado.' },
    { id: 'msg002', msg: 'Error inesperdo' },
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