const { Schema, model } = require("mongoose");
const { schemaBase } = require("../../base");
const { schemaAuditoria } = require("../../auditoria");

const schema = {

    persona: {
        type: Schema.Types.ObjectId,
        ref: 'Persona',
        required: true
    },
    usuario: {
        type: String,
        required: true,
        unique: true
    },
    clave: {
        type: String,
        required: true
    },
    rol: {
        type: [String],
        default: []
    },
    debe_cambiar_clave_inicio_sesion: {
        type: Boolean,
        required: true,
        default: true
    },
    es_bloqueado: {
        type: Boolean,
        required: true,
        default: false
    },
    comentario: {
        type: [Object],
        default: []
    }
};

const UsuarioSchema = Schema(
    Object.assign(schema, schemaBase, schemaAuditoria)
);

UsuarioSchema.method("toJSON", function() {
    const { __v, _id, clave, ...object } = this.toObject();

    object.id = _id;
    return object;
});

module.exports = model("Usuario", UsuarioSchema);