const { Schema, model } = require('mongoose');
const { schemaBase } = require('../../base');
const { schemaAuditoria } = require('../../auditoria');

const schema = {

    nombre: {
        type: String,
        required: true
    },
    apellido_paterno: {
        type: String,
        required: true
    },
    apellido_materno: {
        type: String,
        required: true
    },
    documento_identidad: {
        type: String,
        required: true,
        unique: true
    },
    fecha_nacimiento: {
        type: String,
        required: true
    },
    es_masculino: {
        type: Boolean,
        required: true,
        default: true
    },
    numero_telefono: {
        type: String,
        default: ''
    },
    numero_celular: {
        type: String,
        default: ''
    },
    correo_electronico: {
        type: String,
        default: ''
    },
    domicilio: {
        type: String,
        required: true
    },
    referencia_domicilio: {
        type: String,
        required: true,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    comentario: {
        type: [Object],
        default: []
    },
    ubigeo: {
        type: [Object],
        default: []
    },
    // UBIGEO
    //departamento, provincia, distrito
};

const PersonaSchema = Schema(Object.assign(schema, schemaBase, schemaAuditoria));

PersonaSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('Persona', PersonaSchema);