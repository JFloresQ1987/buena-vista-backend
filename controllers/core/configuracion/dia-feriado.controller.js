const { response } = require("express");
const dayjs = require("dayjs");
const DiaFeriado = require("../../../models/core/configuracion/dia-feriado.model");

const listar_solo_fechas_feriado = async(req, res = response) => {

    try {

        const now = dayjs();
        const anio = now.format('YYYY');

        const lista = await DiaFeriado.find({ anio: anio, es_vigente: true, es_borrado: false }, "fecha_feriado");

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
    listar_solo_fechas_feriado
};