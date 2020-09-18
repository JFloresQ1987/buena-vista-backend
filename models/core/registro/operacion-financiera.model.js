const { Schema, model } = require('mongoose');
const { schemaBase } = require('../../base');
const { schemaAuditoria } = require('../../auditoria');

const modelo = {

    // grupo_banca_comunal: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'GrupoBancaComunal',
    //     required: true
    // },
    persona: {
        type: Schema.Types.ObjectId,
        ref: 'Persona',
        required: true
    },
    // analista: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Persona',
    //     required: true
    // },
    // producto: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Persona',
    //     required: true  
    //},
    // configuracion: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Persona',
    //     required: true  
    //},
    programacion: {
        type: String,
        required: true,
        // jsonSchema: {
        //     enum: ["inverse", "info", "primary", "danger", "warning", "success"],
        // },
        default: ''
    },
    tipo: {
        type: String,
        required: true,
        jsonSchema: {
            enum: ["CD", "CM", "PEX", "BC"],
        },
        default: ''
    },
    color: {
        type: String,
        required: true,
        jsonSchema: {
            enum: ["inverse", "info", "primary", "danger", "warning", "success"],
        },
        default: 'inverse'
    },
    estado: {
        type: String,
        required: true,
        jsonSchema: {
            enum: ["Previgente", "Vigente", "Pagado", "Anulado"],
        },
        default: 'Previgente'
    },
    numero_ciclo: {
        type: Number,
        required: true,
        default: 0
    },
    fecha_inicio: {
        type: String,
        // required: true,
        default: ''
    },
    fecha_fin: {
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
    monto_capital: {
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
    tasa_interes: {
        type: Number,
        required: true,
        default: 0
    },
    tasa_mora: {
        type: Number,
        required: true,
        default: 0
    },
    se_desembolso_prestamo: {
        type: Boolean,
        required: false,
        default: false
    },
    comentario: {
        type: [Object],
        default: []
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