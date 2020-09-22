const { Schema, model } = require('mongoose');
const { schemaBase } = require('../../base');
const { schemaAuditoria } = require('../../auditoria');

const modelo = {
    estado: {
        type: String,
        required: true,
        default:'Abierto'
    },
    fecha_apertura: {
        type: String,
        required: true
    },
    fecha_cierre: {
        type: String,
        //required: true,
        default:''
    },
    cantidad_doscientos_soles_apertura: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_cien_soles_apertura: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_cincuenta_soles_apertura: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_veinte_soles_apertura: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_diez_soles_apertura: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_cinco_soles_apertura: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_dos_soles_apertura: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_un_sol_apertura: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_cincuenta_centimos_apertura: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_veinte_centimos_apertura: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_diez_centimos_apertura: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_doscientos_soles_cierre: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_cien_soles_cierre: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_cincuenta_soles_cierre: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_veinte_soles_cierre: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_diez_soles_cierre: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_cinco_soles_cierre: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_dos_soles_cierre: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_un_sol_cierre: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_cincuenta_centimos_cierre: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_veinte_centimos_cierre: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_diez_centimos_cierre: {
        type: Number,
        //required: true,
        default: 0
    },
    cantidad_operaciones: {
        type: Number,
        //required: true,
        default: 0
    },
    monto_total_apertura: {
        type: Number,
        default: 0
    },
    monto_total_operaciones:{
        type: Number,
        default: 0
    },
    monto_total_efectivo: {
        type: Number,
        default: 0
    },
    comentario: {
        type: [Object],
        default: []
    }

};

const schema = Schema(
    Object.assign(modelo, schemaBase, schemaAuditoria), { collection: 'caja_diario' });

schema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('CajDiario', schema);