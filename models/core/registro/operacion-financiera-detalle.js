const { Schema, model } = require('mongoose');
const { schemaBase } = require('../../base');
const { schemaAuditoria } = require('../../auditoria');

const modelo = {

    estado: {
        type: String,
        required: true,
        default: ''
    },
    numero_cuota: {
        type: Number,
        required: true,
        default: 0
    },
    fecha_cuota: {
        type: String,
        required: true,
        default: ''
    },
    fecha_plazo_cuota: {
        type: String,
        required: true,
        default: ''
    },
    monto_gasto: {
        type: Number,
        required: true,
        default: 0
    },
    monto_ahorro_inicial: {
        type: Number,
        required: true,
        default: 0
    },
    monto_retiro_ahorro_inicial: {
        type: Number,
        required: true,
        default: 0
    },
    monto_ahorro_voluntario: {
        type: Number,
        required: true,
        default: 0
    },
    monto_retiro_ahorro_voluntario: {
        type: Number,
        required: true,
        default: 0
    },
    monto_ahorro_programado: {
        type: Number,
        required: true,
        default: 0
    },
    monto_retiro_ahorro_programado: {
        type: Number,
        required: true,
        default: 0
    },
    monto_amortizacion_capital: {
        type: Number,
        required: true,
        default: 0
    },
    monto_interes: {
        type: Number,
        required: true,
        default: 0
    },
    monto_interes_ahorro: {
        type: Number,
        required: true,
        default: 0
    },
    monto_retiro_interes_ahorro: {
        type: Number,
        required: true,
        default: 0
    },
    monto_mora: {
        type: Number,
        required: true,
        default: 0
    },
    comentario: {
        type: String,
        required: true,
        default: ''
    },
    operacion_financiera: {
        type: Schema.Types.ObjectId,
        ref: 'OperacionFinanciera',
        required: true
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