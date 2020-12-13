const { Schema, model } = require('mongoose');
const { schemaBase } = require('../../base');
const { schemaAuditoria } = require('../../auditoria');

const schema = {

    local_atencion: {
        type: String,
        // required: true,
        jsonSchema: {
            enum: ["Agencia Ayacucho", "Agencia Huanta", "Agencia San Francisco"],
        },
        default: 'Agencia Ayacucho'
    },
    analista: {
        type: Schema.Types.ObjectId,
        ref: 'Analista'
            // required: true
    },
    // nombre_analista: {
    //     type: String,
    //     default: ''
    //         // required: true
    // },
    // documento_identidad_analista: {
    //     type: String,
    //     default: ''
    //         // required: true
    // },
    codigo: {
        type: String,
        // required: true
        default: ''
    },
    descripcion: {
        type: String,
        required: true
    },
    // numero_ciclo: {
    //     type: Number,
    //     required: true
    // },
    fecha_inicio: {
        type: String,
        required: true
    },
    fecha_fin: {
        type: String,
        required: true
    },
    personas: [{
        persona: {
            type: Schema.Types.ObjectId,
            ref: 'Persona',
            required: true
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
        es_vigente: {
            type: Boolean,
            default: true
        },
        es_borrado: {
            type: Boolean,
            default: false
        }
    }]
};

const GrupoBancomunalSchema = Schema(Object.assign(schema, schemaBase, schemaAuditoria), { collection: 'grupo_bancomunal' });

GrupoBancomunalSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('GrupoBancomunal', GrupoBancomunalSchema);