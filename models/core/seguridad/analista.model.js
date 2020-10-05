const { Schema, model } = require("mongoose");
const { schemaBase } = require("../../base");
const { schemaAuditoria } = require("../../auditoria");

const schema = {
  descripcion: {
    type: String,
    required: true,
  },
  producto: {
    type: Schema.Types.ObjectId,
    ref: "Producto",
    required: true,
  },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  comentario: {
    type: [Object],
    default: [],
  }
};

const AnalistaSchema = Schema(
    Object.assign(schema, schemaBase, schemaAuditoria)
);

AnalistaSchema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();

    object.id = _id;
    return object;
});

module.exports = model("Analista", AnalistaSchema);