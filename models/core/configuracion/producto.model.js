const { Schema, model } = require('mongoose');
const { schemaBase } = require('../../base');
const { schemaAuditoria } = require('../../auditoria');

const modelo = {

    descripcion: {
        type: String,
        required: true,
        default: ''
    },
    abreviatura: {
        type: String,
        required: true,
        default: ''
    },
    programacion: {
        type: [Object],
        default: []
    },
    comentario: {
        type: [Object],
        default: []
    }
};

const schema = Schema(
    Object.assign(modelo, schemaBase, schemaAuditoria));

schema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('Producto', schema);