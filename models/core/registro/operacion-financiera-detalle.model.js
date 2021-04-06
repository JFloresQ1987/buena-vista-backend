const { Schema, model } = require('mongoose');
const { schemaBase } = require('../../base');
const { schemaAuditoria } = require('../../auditoria');

const modelo = {

    operacion_financiera: {
        type: Schema.Types.ObjectId,
        ref: 'OperacionFinanciera',
        required: true
    },
    bancomunal: {
        // type: {
        grupo_bancomunal: {
            type: Schema.Types.ObjectId,
            ref: 'GrupoBancomunal',
        },
        numero_ciclo: {
            type: Number,
            default: 0
        }
        // },
        // default: {}
    },
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
    // producto: {
    //     type: String,
    //     required: true,
    //     default: ''
    // },
    // concepto: {
    //     type: String,
    //     required: true,
    //     default: ''
    // },
    estado: {
        type: String,
        required: true,
        jsonSchema: {
            enum: ["Prependiente", "Vigente", "Pendiente", "Amortizado", "Pagado", "Anulado"],
        },
        default: 'Prependiente'
    },
    numero_cuota: {
        type: Number,
        required: true,
        default: 0
    },
    nombre_dia_cuota: {
        type: String,
        // required: true,
        default: ''
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
    ingresos: {
        // type: {
        monto_gasto: {
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
        monto_mora: {
            type: Number,
            required: true,
            default: 0
        }
        // },
        // default: {}
    },
    // ingresos2: {
    //     type: {
    //         monto_gasto: {
    //             type: Number,
    //             required: true,
    //             default: 0
    //         },
    //         monto_amortizacion_capital: {
    //             type: Number,
    //             required: true,
    //             default: 0
    //         },
    //         monto_interes: {
    //             type: Number,
    //             required: true,
    //             default: 0
    //         },
    //         monto_mora: {
    //             type: Number,
    //             required: true,
    //             default: 0
    //         }
    //     },
    //     default: {}
    // },
    ahorros: {
        // type: {
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
        monto_interes_ganado: {
            type: Number,
            required: true,
            default: 0
        },
        monto_retiro_interes_ganado: {
            type: Number,
            required: true,
            default: 0
        }
        // },
        // default: {}
    },
    monto_saldo_capital: {
        type: Number,
        required: true,
        default: 0
    },
    // monto_redondeo: {
    //     type: Number,
    //     required: true,
    //     default: 0
    // },    
    pagos: [{
        // pago_operacion_financiera: {
        //     type: Schema.Types.ObjectId,
        //     ref: 'PagoOperacionFinanciera',
        //     // required: true
        // },
        recibo: {
            // estado: {
            //     type: String,
            //     // required: true,
            //     // jsonSchema: {
            //     //     enum: ["Previgente", "Vigente", "Anulado"],
            //     // },
            //     // default: 'Previgente'
            // },
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
            }
        },
        //     default: {}
        // },
        ingresos: {
            // type: {
            monto_gasto: {
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
            monto_mora: {
                type: Number,
                required: true,
                default: 0
            }
            // },
            // default: {}
        },
        ahorros: {
            // type: {
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
            monto_interes_ganado: {
                type: Number,
                required: true,
                default: 0
            },
            monto_retiro_interes_ganado: {
                type: Number,
                required: true,
                default: 0
            }
            // },
            // default: {}
        },
        es_vigente: {
            type: Boolean,
            default: true
        }
        // }],
        // default: []
    }]
};

const schema = Schema(
    Object.assign(modelo, schemaBase, schemaAuditoria), { collection: 'operacion_financiera_detalle' });

schema.method('toJSON', function() {
    const {
        __v,
        _id,
        // monto_amortizacion_capital,
        // monto_interes,
        // monto_ahorro_programado,
        ingresos,
        ahorros,
        pagos,
        // monto_gasto,
        // monto_ahorro_inicial,
        ...object
    } = this.toObject();

    // console.log(ingresos)
    // console.log(ahorros)

    object.id = _id;
    object.monto_amortizacion_capital = Math.round(ingresos.monto_amortizacion_capital * 100) / 100;
    object.monto_interes = Math.round(ingresos.monto_interes * 100) / 100;
    // object.monto_ahorro_programado = monto_ahorro_programado;
    object.monto_cuota = (ingresos.monto_gasto + ahorros.monto_ahorro_inicial +
        ingresos.monto_amortizacion_capital + ingresos.monto_interes + ahorros.monto_ahorro_programado).toFixed(2);
    // object.monto_cuota = (ingresos.monto_gasto + ahorros.monto_ahorro_inicial +
    //     Math.ceil((ingresos.monto_amortizacion_capital + ingresos.monto_interes + ahorros.monto_ahorro_programado) * 10) / 10).toFixed(2);

    // console.log(ingresos.monto_amortizacion_capital)
    // console.log(ingresos.monto_interes)
    // console.log(ahorros.monto_ahorro_programado)


    object.monto_ahorro_programado = ahorros.monto_ahorro_programado.toFixed(2)
    object.ingresos = ingresos;
    object.ahorros = ahorros;
    object.monto_amortizacion_capital_2 = ingresos.monto_amortizacion_capital;
    object.monto_interes_2 = ingresos.monto_interes;
    object.monto_cuota_2 = (ingresos.monto_gasto + ahorros.monto_ahorro_inicial +
        ingresos.monto_amortizacion_capital + ingresos.monto_interes + ahorros.monto_ahorro_programado);
    object.monto_ahorro_programado_2 = ahorros.monto_ahorro_programado;

    object.monto_cuota_pagada = 0;
    object.monto_ahorro_voluntario = 0;

    for (let j = 0; j < pagos.length; j++) {

        if (pagos[j].es_vigente) {

            object.monto_cuota_pagada += pagos[j].ingresos.monto_gasto || 0;
            object.monto_cuota_pagada += pagos[j].ahorros.monto_ahorro_inicial || 0;
            // object.monto_cuota_pagada += pagos[j].ahorros.monto_ahorro_voluntario || 0;
            object.monto_cuota_pagada += pagos[j].ahorros.monto_ahorro_programado || 0;
            object.monto_cuota_pagada += pagos[j].ingresos.monto_amortizacion_capital || 0;
            object.monto_cuota_pagada += pagos[j].ingresos.monto_interes || 0;
            // object.monto_cuota_pagada += pagos[j].ingresos.monto_mora || 0;

            object.monto_ahorro_voluntario = pagos[j].ahorros.monto_ahorro_voluntario || 0;
        }
    }

    object.monto_cuota_pagada = object.monto_cuota_pagada.toFixed(2);

    object.monto_ahorro_voluntario = object.monto_ahorro_voluntario.toFixed(2);
    object.monto_pago_mora = 0;
    object.monto_mora = ingresos.monto_mora.toFixed(2);
    return object;
})

module.exports = model('OperacionFinancieraDetalle', schema);