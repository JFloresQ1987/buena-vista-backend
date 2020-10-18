const express = require('express');
const cors = require('cors');

require('dotenv').config();
const path = require('path');

const { dbConnection } = require('./database/config.js');

const app = express();

app.use(cors());

app.use(express.json());

dbConnection();

app.use('/api/login', require('./routes/auth/auth.route'));
app.use('/api/upload', require('./routes/upload.route'));
app.use('/api/usuarios', require('./routes/core/seguridad/usuarios.route'));

app.use('/api/caja', require('./routes/core/seguridad/caja.route'));

app.use('/api/personas', require('./routes/core/registro/personas.route'));
app.use('/api/analistas', require('./routes/core/seguridad/analista.route'));
app.use('/api/operacion-financiera', require('./routes/core/registro/operacion-financiera.route'));
app.use('/api/operacion-financiera-detalle', require('./routes/core/registro/operacion-financiera-detalle.route'));
app.use('/api/producto', require('./routes/core/configuracion/producto.route'));
app.use('/api/operacion-financiera-pago', require('./routes/core/caja/operacion-financiera-pago.route'));

app.use('/api/caja-diario', require('./routes/core/caja/caja-diaria.route'));

app.use('/api/ubigeo', require('./routes/core/ubigeo.route'));
app.use('/api/pago-concepto', require('./routes/core/configuracion/pago-concepto.route'));
app.use('/api/grupo-bancomunal', require('./routes/core/registro/grupo-bancomunal.route'));
app.use('/api/dia-feriado', require('./routes/core/configuracion/dia-feriado.route'));


// app.use('/api/shared', require('./routes/shared/images.route'));
// app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, 'public/index.html'));
// });

app.listen(process.env.PORT, () => {
    console.log('Servidor corriendo en puerto ' + process.env.PORT);
});