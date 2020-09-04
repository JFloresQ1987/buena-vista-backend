const { Schema, model } = require('mongoose');
const { schemaBase } = require('../../base');
const { schemaAuditoria } = require('../../auditoria');

const modelo = {

    // concepto: {
    //     type: String,
    //     required: true,
    //     default: ''
    // },
    estado: {
        type: String,
        required: true,
        jsonSchema: {
            enum: ["Previgente", "Vigente", "Pagado", "Anulado"],
        },
        default: 'Previgente'
    },
    numero_cuota: {
        type: Number,
        required: true,
        default: 0
    },
    fecha_cuota: {
        type: String,
        // required: true,
        default: ''
    },
    fecha_plazo_cuota: {
        type: String,
        // required: true,
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
    monto_interes_ganado: {
        type: Number,
        required: true,
        default: 0
    },
    monto_retiro_interes_ganado: {
        type: Number,
        required: true,
        default: 0
    },
    monto_mora: {
        type: Number,
        required: true,
        default: 0
    },
    pagos: {
        type: [Object],
        default: []
    },
    // monto_redondeo: {
    //     type: Number,
    //     required: true,
    //     default: 0
    // },
    // monto_saldo_capital: {
    //     type: Number,
    //     required: true,
    //     default: 0
    // },
    operacion_financiera: {
        type: Schema.Types.ObjectId,
        ref: 'OperacionFinanciera',
        required: true
    },
    persona: {
        type: Schema.Types.ObjectId,
        ref: 'Persona',
        required: true
    },
    // analista: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Persona',
    //     required: true
    // }
    // grupo_banca_comunal: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'GrupoBancaComunal',
    //     required: true
    // }
};

const schema = Schema(
    Object.assign(modelo, schemaBase, schemaAuditoria), { collection: 'operaciones_financieras_detalle' });

schema.method('toJSON', function() {
    const { __v, _id, monto_amortizacion_capital, monto_interes, monto_ahorro_programado, ...object } = this.toObject();

    object.id = _id;
    object.monto_amortizacion_capital = Math.round(monto_amortizacion_capital * 100) / 100;
    object.monto_interes = Math.round(monto_interes * 100) / 100;
    object.monto_ahorro_programado = monto_ahorro_programado;
    object.monto_cuota = Math.ceil((monto_amortizacion_capital + monto_interes + monto_ahorro_programado) * 10) / 10;
    return object;
})

module.exports = model('OperacionFinancieraDetalle', schema);