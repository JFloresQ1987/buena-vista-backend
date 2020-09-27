const { Schema, model } = require("mongoose");

/* const schemaD = new Schema({
  distrito: {
    type: String,
    required: true,
    unique: true,
  },
  codigo: {
    type: String,
    required: true,
    unique: true,
  },
});
const schemaP = new Schema({
  provincia: {
    type: String,
    required: true,
    unique: true,
  },
  distritos: {
    type: [schemaD],
    required: true,
    default: [],
  },
}); */

const schema = new Schema({
  departamento: {
    type: String,
    required: true,
    unique: true,
  },
  provincias: {
    type: [
      {
        provincia: {
          type: String,
          required: true,
          unique: true,
        },
        distritos: [
          {
            distrito: { type: String, required: true, unique: true },
            codigo: { type: String, required: true, unique: true }
          },
        ]
      }
    ],
    required: true,
    default: [],
  },
}, {collection: 'ubigeo'});

module.exports = model("Ubigeo", schema);
