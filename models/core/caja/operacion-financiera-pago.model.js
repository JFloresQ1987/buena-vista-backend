const { Schema, model } = require('mongoose');
const { schemaBase } = require('../../base');
const { schemaAuditoria } = require('../../auditoria');

const modelo = {

    caja_diario: {
        type: Schema.Types.ObjectId,
        ref: 'CajaDiario',
        required: true
    },
    cajero: {
        type: Schema.Types.ObjectId,
        ref: 'Persona',
        // required: true
    },
    operacion_financiera: {
        type: Schema.Types.ObjectId,
        ref: 'OperacionFinanciera',
        // required: true
    },
    operacion_financiera_desembolso: {
        type: Schema.Types.ObjectId,
        ref: 'OperacionFinanciera',
        // required: true
    },
    // grupo_banca_comunal: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'GrupoBancaComunal',
    //     required: true
    // },
    persona: {
        type: Schema.Types.ObjectId,
        ref: 'Persona',
        // required: true
    },
    // analista: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Persona',
    //     required: true
    // },
    // persona_responsable: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Persona',
    //     required: true
    // },
    // concepto: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Concepto',
    //     // required: true
    // },
    concepto_detalle: {
        type: String,
        // required: true
        default: ''
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
    monto_total: {
        type: Number,
        required: true
    },
    monto_gasto: {
        type: Number,
        // required: true,
        default: 0
    },
    monto_ahorro_inicial: {
        type: Number,
        // required: true,
        default: 0
    },
    monto_retiro_ahorro_inicial: {
        type: Number,
        // required: true,
        default: 0
    },
    monto_ahorro_voluntario: {
        type: Number,
        // required: true,
        default: 0
    },
    monto_retiro_ahorro_voluntario: {
        type: Number,
        // required: true,
        default: 0
    },
    monto_ahorro_programado: {
        type: Number,
        // required: true,
        default: 0
    },
    monto_retiro_ahorro_programado: {
        type: Number,
        // required: true,
        default: 0
    },
    monto_amortizacion_capital: {
        type: Number,
        // required: true,
        default: 0
    },
    monto_interes: {
        type: Number,
        // required: true,
        default: 0
    },
    monto_interes_ahorro: {
        type: Number,
        // required: true,
        default: 0
    },
    monto_retiro_interes_ahorro: {
        type: Number,
        // required: true,
        default: 0
    },
    monto_mora: {
        type: Number,
        // required: true,
        default: 0
    },
    numero_comprobante: {
        type: String,
        // required: true
        default: ''
    },
    detalle: {
        type: [Object],
        required: true
    },
    comentario: {
        type: [Object],
        default: []
    }
};

const schema = Schema(
    Object.assign(modelo, schemaBase, schemaAuditoria), { collection: 'pago_operaciones_financieras' });

schema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('PagoOperacionFinanciera', schema);