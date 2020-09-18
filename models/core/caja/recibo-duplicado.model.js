const { Schema, model } = require('mongoose');
const { schemaBase } = require('../../base');
const { schemaAuditoria } = require('../../auditoria');

const modelo = {

    cajero: {
        type: Schema.Types.ObjectId,
        ref: 'Persona',
        // required: true
    },
    estado_caja_diario: {
        type: String,
        required: true,
        jsonSchema: {
            enum: ["Abierto", "Cerrado"],
        },
        default: 'Abierto'
    },
    estado_pago: {
        type: String,
        required: true,
        jsonSchema: {
            enum: ["Previgente", "Vigente", "Pagado", "Anulado"],
        },
        default: 'Previgente'
    },
    es_ingreso: {
        type: Boolean,
        required: true
    },
    serie_recibo: {
        type: String,
        required: true
    },
    numero_recibo: {
        type: String,
        required: true
    },
    fecha_recibo: {
        type: String,
        required: true
    },
    comentario: {
        type: [Object],
        default: []
    }
};

const schema = Schema(
    Object.assign(modelo, schemaBase, schemaAuditoria), { collection: 'recibo_duplicado' });

schema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('ReciboDuplicado', schema);