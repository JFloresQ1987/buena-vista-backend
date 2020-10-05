const { Schema, model } = require('mongoose');
const { schemaBase } = require('../../base');
const { schemaAuditoria } = require('../../auditoria');

const schema = {

    descripcion: {
        type: String,
        required: true
    },
    numero_ciclo: {
        type: Number,
        required: true
    },
    fecha_inicio: {
        type: String,
        required: true
    },
    fecha_fin: {
        type: String,
        required: true
    }
};

const GrupoBancomunalSchema = Schema(Object.assign(schema, schemaBase, schemaAuditoria), { collection: 'grupo_bancomunal' });

GrupoBancomunalSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('GrupoBancomunal', GrupoBancomunalSchema);