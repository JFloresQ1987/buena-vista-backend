const { Schema, model } = require('mongoose');
const { schemaBase } = require('../../base');
const { schemaAuditoria } = require('../../auditoria');

const modelo = {

    diario: {
        // type: {
        caja_diario: {
            type: Schema.Types.ObjectId,
            ref: 'CajaDiario',
            required: true
        },
        caja: {
            type: Schema.Types.ObjectId,
            ref: 'Caja',
            required: true
        },
        estado: {
            type: String,
            required: true,
            jsonSchema: {
                enum: ["Abierto", "Cerrado"],
            },
            default: 'Abierto'
        }
        // cajero: {
        //     type: Schema.Types.ObjectId,
        //     ref: 'Persona',
        //     // required: true
        // }
        // },
        // default: {}
    },
    // grupo_banca_comunal: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'GrupoBancaComunal',
    //     required: true
    // },

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
    es_ingreso: {
        type: Boolean,
        required: true
    },
    recibo: {
        // type: {
        estado: {
            type: String,
            required: true,
            jsonSchema: {
                enum: ["Previgente", "Vigente", "Anulado"],
            },
            default: 'Previgente'
        },
        serie: {
            type: String,
            required: true
        },
        numero: {
            type: String,
            required: true
        },
        fecha: {
            type: String,
            required: true
        },
        ejercicio: {
            type: String,
            required: true
        },
        monto_total: {
            type: Number,
            required: true
        }
        // },
        // default: {}
    },
    producto: {
        // type: {
        persona: {
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
        // monto_total: {
        //     type: Number,
        //     required: true,
        //     default: 0
        // },
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
        }
        // },
        // default: {}
    },
    concepto: {
        // type: {
        concepto: {
            type: Schema.Types.ObjectId,
            ref: 'Concepto',
            // required: true
        },
        sub_concepto: {
            type: Schema.Types.ObjectId,
            // required: true
            // default: ''
        },
        responsable: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario'
                // required: true
        },
        // monto_total: {
        //     type: Number,
        //     required: true,
        //     default: 0
        // },
        numero_comprobante: {
            type: String,
            // required: true
            // default: ''
        },
        detalle: {
            type: String,
            // required: true
            // default: ''
        }
        // },
        // default: {}
    },
    detalle: [{
        monto_total: {
            type: Number,
            required: true,
            default: 0
        },
        producto: {
            operacion_financiera_detalle: {
                type: Schema.Types.ObjectId,
                ref: 'OperacionFinancieraDetalle',
                required: true
            },
            numero_cuota: {
                type: Number,
                // required: true,
                default: 0
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
            }
            // },
            // default: {}
        }
        // type: [Object],
        // // required: true
        // default: ''
    }],
    comentario: {
        type: [Object],
        default: []
    }
};

const schema = Schema(
    Object.assign(modelo, schemaBase, schemaAuditoria), { collection: 'pago_operacion_financiera' });

schema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('PagoOperacionFinanciera', schema);