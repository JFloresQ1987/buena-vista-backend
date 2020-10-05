const { response } = require("express");
const dayjs = require("dayjs");
const GrupoBancomunal = require("../../../models/core/registro/grupo-bancomunal.model");

const getListaDesplegable = async(req, res = response) => {

    try {

        const lista = await GrupoBancomunal.find({ es_vigente: true, es_borrado: false }, "id descripcion");

        // console.log(lista)

        res.json({
            ok: true,
            lista,
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: error.message,
        });
    }
};

module.exports = {
    getListaDesplegable
};