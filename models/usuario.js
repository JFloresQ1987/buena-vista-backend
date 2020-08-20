const { Schema, model } = require('mongoose');

const UsuarioSchema = Schema({
    
    usuario: {
        type: String,
        required: true,
        unique: true
    },    
    clave: {
        type: String,
        required: true
    },
    debe_cambiar_clave_inicio_sesion: {
        type: Boolean,
        required: true,
        default: true
    },
    es_bloqueado: {
        type: Boolean,
        required: true,
        default: false
    },
    es_vigente: {
        type: Boolean,
        required: true,
        default: true
    },
    es_borrado: {
        type: Boolean,
        required: true,
        default: false
    }
});

UsuarioSchema.method('toJSON', function () {
    const { __v, _id, clave, ...object } = this.toObject();
    
    object.id = _id;
    return object;
})

module.exports = model('Usuario', UsuarioSchema);