const { Schema, model } = require("mongoose");

const schema = new Schema({
    codigo_anterior: {
        type: String,
        required: true,
        unique: true,
    },
    codigo: {
        type: String,
        required: true,
        unique: true,
    },
    // abreviatura: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
    descripcion: {
        type: String,
        required: true,
        unique: true,
    },
    sub_conceptos: {
        type: [Object],
        required: true,
        unique: true,
        default: []
    },
    es_ingreso: {
        type: Boolean,
        required: true,
    }
}, { collection: 'pago_concepto' });

module.exports = model("PagoConcepto", schema);