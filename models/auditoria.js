const date_ob = new Date();

// adjust 0 before single digit date
const date = ("0" + date_ob.getDate()).slice(-2);

// current month
const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

// current year
const year = date_ob.getFullYear();

// current hours
const hours = date_ob.getHours();

// current minutes
const minutes = date_ob.getMinutes();

// current seconds
const seconds = date_ob.getSeconds();

// prints date & time in YYYY-MM-DD HH:MM:SS format
// console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);

const fecha = date + "/" + month + "/" + year;
const fecha_hora = fecha + " " + hours + ":" + minutes + ":" + seconds;

// const diaActual = new Date();
// const day = diaActual.getDate();
// const month = diaActual.getMonth() + 1;
// const year = diaActual.getFullYear();
// const fecha = day + '/' + month + '/' + year;

// const fecha = new Intl.DateTimeFormat('es-PE', { day: "2-digit", month: "2-digit", year: "numeric" }).format(Date.now())
// const fecha = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(Date.now())

const schemaAuditoria = {

    sesion_id: {
        type: Number,
        default: 0
    },
    usuario_id: {
        type: Number,
        default: 0
    },
    fecha_registro: {
        type: String,
        default: fecha_hora
    }
};

module.exports = {
    schemaAuditoria
};