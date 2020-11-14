const { Schema, model } = require('mongoose');
const { schemaBase } = require('../../base');
const { schemaAuditoria } = require('../../auditoria');
// const bancomunalModel = require('./bancomunal.model');
// const Bancomunal = require('./bancomunal.model');
// const Bancomunal = require('./models/core/registro/bancomunal.model');

const modelo = {

    producto: {
        // type: {
        tipo: {
            type: Schema.Types.ObjectId,
            ref: 'Producto',
            required: true
        },
        codigo_programacion: {
            type: String,
            // required: true,
            // jsonSchema: {
            //     enum: ["inverse", "info", "primary", "danger", "warning", "success"],
            // },
            default: ''
        },
        programacion: {
            type: String,
            // required: true,
            // jsonSchema: {
            //     enum: ["inverse", "info", "primary", "danger", "warning", "success"],
            // },
            default: ''
        },
        // tipo: {
        //     type: String,
        //     required: true,
        //     jsonSchema: {
        //         enum: ["CD", "CM", "PEX", "BC"],
        //     },
        //     default: ''
        // },
        color: {
            type: String,
            // required: true,
            jsonSchema: {
                enum: ["inverse", "info", "primary", "danger", "warning", "success"],
            },
            default: 'inverse'
        },
        es_prestamo: {
            type: Boolean,
            // required: false,
            default: true
        }
        // }
    },
    // producto: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Producto',
    //     required: true
    // },
    configuracion: {
        // type: {
        tasa_ahorro_inicial: {
            type: Number,
            required: true,
            default: 0
        },
        tasa_aporte_capital: {
            type: Number,
            required: true,
            default: 0
        },
        tasa_ahorro_programado: {
            type: Number,
            required: true,
            default: 0
        },
        tasa_interes: {
            type: Number,
            required: true,
            default: 0
        },
        tasa_interes_ganado: {
            type: Number,
            required: true,
            default: 0
        },
        tasa_mora: {
            type: Number,
            required: true,
            default: 0
        }
        // },
        // default: {}
    },
    bancomunal: {
        // type: {
        grupo_bancomunal: {
            type: Schema.Types.ObjectId,
            ref: 'GrupoBancomunal',
        },
        numero_ciclo: {
            type: Number,
            // default: 0
        }
        // },
        // default: {}
    },
    // grupo_bancomunal: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'GrupoBancomunal',
    //     required: true
    // },
    persona: {
        type: Schema.Types.ObjectId,
        ref: 'Persona',
        required: true
    },
    analista: {
        type: Schema.Types.ObjectId,
        ref: 'Analista',
        // required: true
    },
    // programacion: {
    //     type: String,
    //     required: true,
    //     // jsonSchema: {
    //     //     enum: ["inverse", "info", "primary", "danger", "warning", "success"],
    //     // },
    //     default: ''
    // },
    // tipo: {
    //     type: String,
    //     required: true,
    //     jsonSchema: {
    //         enum: ["CD", "CM", "PEX", "BC"],
    //     },
    //     default: ''
    // },
    // color: {
    //     type: String,
    //     required: true,
    //     jsonSchema: {
    //         enum: ["inverse", "info", "primary", "danger", "warning", "success"],
    //     },
    //     default: 'inverse'
    // },    
    estado: {
        type: String,
        required: true,
        jsonSchema: {
            enum: ["Vigente", "Previgente", "Pagado", "Anulado"],
            // enum: ["Previgente", "Vigente", "Pagado", "Anulado"],
        },
        default: 'Vigente'
            // default: 'Previgente'
    },
    // numero_ciclo: {
    //     type: Number,
    //     required: true,
    //     default: 0
    // },
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
    desembolso: {
        se_desembolso_prestamo: {
            type: Boolean,
            // required: false,
            default: false
        },
        recibo: {
            // type: {
            local_atencion: {
                type: String,
                // required: true,
                // jsonSchema: {
                //     enum: ["Ayacucho", "Huanta", "San Francisco"],
                // },
                // default: 'Ayacucho'
            },
            serie: {
                type: String,
                // required: true

            },
            numero: {
                type: String,
                // required: true
            },
            fecha: {
                type: String,
                // required: true
            },
            monto_desembolso: {
                type: Number,
                // required: true,
                // default: 0
            },
            es_vigente: {
                type: Boolean,
                default: true
            }
        }
    },
    // tasa_aporte_inicial: {
    //     type: Number,
    //     required: true,
    //     default: 0
    // },
    // tasa_aporte_capital: {
    //     type: Number,
    //     required: true,
    //     default: 0
    // },
    // tasa_aporte_programado: {
    //     type: Number,
    //     required: true,
    //     default: 0
    // },
    // tasa_interes: {
    //     type: Number,
    //     required: true,
    //     default: 0
    // },
    // tasa_mora: {
    //     type: Number,
    //     required: true,
    //     default: 0
    // },
    // se_desembolso_prestamo: {
    //     type: Boolean,
    //     // required: false,
    //     default: false
    // },
    es_congelado: {
        type: Boolean,
        // required: false,
        default: false
    },
    comentario: {
        type: [Object],
        default: []
    }
};

const schema = Schema(
    Object.assign(modelo, schemaBase, schemaAuditoria), { collection: 'operacion_financiera' });

schema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('OperacionFinanciera', schema);