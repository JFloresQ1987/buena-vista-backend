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
    es_prestamo: {
        type: Boolean,
        required: true,
        default: true
    },
    programacion: {
        type: [Object],
        default: []
    },
    configuracion: {
        type: {},
        default: []
    },
    comentario: {
        type: [Object],
        default: []
    }
};

const schema = Schema(
    Object.assign(modelo, schemaBase, schemaAuditoria), { collection: 'producto' });

// const PersonaSchema = Schema(Object.assign(schema, schemaBase, schemaAuditoria), { collection: 'productos' });

schema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('Producto', schema);