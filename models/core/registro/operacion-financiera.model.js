const { Schema, model } = require('mongoose');
const { schemaBase } = require('../../base');
const { schemaAuditoria } = require('../../auditoria');

const modelo = {

    tipo: {
        type: String,
        required: true,
        default: ''
    },
    estado: {
        type: String,
        required: true,
        default: ''
    },
    numero_ciclo: {
        type: Number,
        required: true,
        default: 0
    },
    fecha_inicio: {
        type: String,
        required: true,
        default: ''
    },
    fecha_fin: {
        type: String,
        required: true,
        default: ''
    },
    gasto_administrativo: {
        type: Number,
        required: true,
        default: 0
    },
    tasa_aporte_inicial: {
        type: Number,
        required: true,
        default: 0
    },
    tasa_aporte_capital: {
        type: Number,
        required: true,
        default: 0
    },
    tasa_aporte_programado: {
        type: Number,
        required: true,
        default: 0
    },
    tasa_aporte_interes: {
        type: Number,
        required: true,
        default: 0
    },
    tasa_aporte_mora: {
        type: Number,
        required: true,
        default: 0
    },
    comentario: {
        type: String,
        required: true,
        default: ''
    },
    persona: {
        type: Schema.Types.ObjectId,
        ref: 'Persona',
        required: true
    }
};

const schema = Schema(
    Object.assign(modelo, schemaBase, schemaAuditoria), { collection: 'operaciones_financieras' });

schema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('OperacionFinanciera', schema);