const { Schema, model } = require('mongoose');
const { schemaBase } = require('../../base');
const { schemaAuditoria } = require('../../auditoria');

const schema = {

    descripcion: {
        type: String,
        required: true,
    },
    ip: {
        type: String,
        required: true
    },
    pc_nombre: {
        type: String,
        required: true,
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    comentario: {
        type: [Object],
        default: []
    },
};

const CajaSchema = Schema(Object.assign(schema, schemaBase, schemaAuditoria));

CajaSchema.method('toJSON', function() {
    const { __v, _id, clave, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('Caja', CajaSchema);