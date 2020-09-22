const { Schema, model } = require('mongoose');
const { schemaBase } = require('../../base');
const { schemaAuditoria } = require('../../auditoria');

const schema = {

    // nombre: {
    //     type: String,
    //     required: true
    // }
};

const GrupoBancomunalSchema = Schema(Object.assign(schema, schemaBase, schemaAuditoria));

PersonaSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.id = _id;
    return object;
})

module.exports = model('GrupoBancomunal', GrupoBancomunalSchema);