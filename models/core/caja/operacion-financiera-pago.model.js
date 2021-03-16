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
        cajero: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
        },
        estado: {
            type: String,
            required: true,
            jsonSchema: {
                enum: ["Abierto", "Cerrado"],
            },
            default: 'Abierto'
        }
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
        // institucion: {
        //     type: String,
        //     default: 'BUENAVISTA LA BOLSA S.A.C.'
        //         // ref: 'Persona',
        //         // required: true
        // },
        // ruc: {
        //     type: String,
        //     default: '20574744599'
        //         // ref: 'Persona',
        //         // required: true
        // },
        local_atencion: {
            type: String,
            // required: true,
            jsonSchema: {
                enum: ["Agencia Ayacucho", "Agencia Huanta", "Agencia San Francisco"],
            },
            default: 'Agencia Ayacucho'
        },
        documento_identidad_cajero: {
            type: String,
            default: ''
                // ref: 'Persona',
                // required: true
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
        },
        // },
        // default: {}
        frase: {
            type: String,
            default: ''
                // ref: 'Persona',
                // required: true
        }
    },
    producto: {
        // type: {
        producto: {
            type: Schema.Types.ObjectId,
            ref: 'Producto'
        },
        codigo: {
            type: String,
            default: ''
        },
        descripcion: {
            type: String,
            default: ''
        },
        codigo_programacion: {
            type: String,
            default: ''
        },
        descripcion_programacion: {
            type: String,
            default: ''
        },
        persona: {
            type: Schema.Types.ObjectId,
            ref: 'Persona',
            // required: true
        },
        nombre_persona: {
            type: String,
            default: ''
                // required: true
        },
        documento_identidad_persona: {
            type: String,
            default: ''
                // required: true
        },
        analista: {
            type: Schema.Types.ObjectId,
            ref: 'Analista'
                // required: true
        },
        nombre_analista: {
            type: String,
            default: ''
                // required: true
        },
        documento_identidad_analista: {
            type: String,
            default: ''
                // required: true
        },
        operacion_financiera: {
            type: Schema.Types.ObjectId,
            ref: 'OperacionFinanciera',
            // required: true
        },
        bancomunal: {
            // type: {
            grupo_bancomunal: {
                type: Schema.Types.ObjectId,
                ref: 'GrupoBancomunal',
            },
            codigo: {
                type: String,
                default: ''
            },
            descripcion: {
                type: String,
                default: ''
            },
            numero_ciclo: {
                type: Number,
                default: 0
            }
            // },
            // default: {}
        },
        // operacion_financiera_desembolso: {
        //     type: Schema.Types.ObjectId,
        //     ref: 'OperacionFinanciera',
        //     // required: true
        // },
        // monto_total: {
        //     type: Number,
        //     required: true,
        //     default: 0
        // },
        es_desembolso: {
            type: Boolean,
            default: false
        },
        monto_desembolso: {
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
    },
    concepto: {
        // type: {
        concepto: {
            type: Schema.Types.ObjectId,
            ref: 'Concepto',
            // required: true
        },
        codigo_concepto: {
            type: String,
            default: ''
                // required: true
        },
        descripcion: {
            type: String,
            default: ''
                // required: true
        },
        sub_concepto: {
            type: Schema.Types.ObjectId,
            // required: true
            // default: ''
        },
        codigo_sub_concepto: {
            type: String,
            default: ''
                // required: true
        },
        descripcion_sub_concepto: {
            type: String,
            default: ''
        },
        responsable: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario'
                // required: true
        },
        nombre_responsable: {
            type: String,
            default: ''
        },
        documento_identidad_responsable: {
            type: String,
            default: ''
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
            default: ''
        },
        detalle: {
            type: String,
            // required: true
            default: ''
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