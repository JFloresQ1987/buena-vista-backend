const { Schema, model } = require('mongoose');
const { schemaBase } = require('../../base');
const { schemaAuditoria } = require('../../auditoria');

const schema = {

    descripcion: {
        type: String,
        required: true
    },
    anio: {
        type: Number,
        required: true
    },
    fecha_feriado: {
        type: String,
        required: true
    }
};

const DiaFeriadoSchema = Schema(Object.assign(schema, schemaBase, schemaAuditoria), { collection: 'dia_feriado' });

DiaFeriadoSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('DiaFeriado', DiaFeriadoSchema);