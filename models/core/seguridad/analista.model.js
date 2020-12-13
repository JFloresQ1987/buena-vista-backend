const { Schema, model } = require("mongoose");
const { schemaBase } = require("../../base");
const { schemaAuditoria } = require("../../auditoria");

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
    producto: {
        type: Schema.Types.ObjectId,
        ref: "Producto",
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
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
        required: true,
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
        default: [],
    }
};

const AnalistaSchema = Schema(
    Object.assign(schema, schemaBase, schemaAuditoria), { collection: 'analista' }
);

AnalistaSchema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();

    object.id = _id;
    return object;
});

module.exports = model("Analista", AnalistaSchema);