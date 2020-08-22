const schemaBase = {

    observacion_administrador_base_datos: {
        type: String,
        default: ''
    },
    es_vigente: {
        type: Boolean,
        default: true
    },
    es_borrado: {
        type: Boolean,
        default: false
    }
};

module.exports = {
    schemaBase
};