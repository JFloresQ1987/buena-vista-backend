const { Schema, model } = require('mongoose');
const { schemaBase } = require('../../base');
const { schemaAuditoria } = require('../../auditoria');

const schema = {

    codigo: {
        type: String,
        default: "",
        // required: true,
    },
    descripcion: {
        type: String,
        required: true,
    },
    local_atencion: {
        type: String,
        // required: true,
        jsonSchema: {
            enum: ["Agencia Ayacucho", "Agencia Huanta", "Agencia San Francisco"],
        },
        default: 'Agencia Ayacucho'
    },
    ip: {
        type: String,
        required: true
    },
    pc_nombre: {
        type: String,
        required: true,
    },
    serie: {
        type: String,
        // required: true
        default: '001'
    },
    es_caja_principal: {
        type: Boolean,
        // required: true
        default: false
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    nombre_usuario: {
        type: String,
        default: "",
        // required: true,
    },
    documento_identidad_usuario: {
        type: String,
        default: "",
        // required: true,
    },
    comentario: {
        type: [Object],
        default: []
    },
};

const CajaSchema = Schema(Object.assign(schema, schemaBase, schemaAuditoria), { collection: 'caja' });

CajaSchema.method('toJSON', function() {
    const { __v, _id, clave, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('Caja', CajaSchema);