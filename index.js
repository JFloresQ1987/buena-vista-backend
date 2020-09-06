const express = require('express');
const cors = require('cors');

require('dotenv').config();

const { dbConnection } = require('./database/config.js');

const app = express();

app.use(cors());

app.use(express.json());

dbConnection();

app.use('/api/login', require('./routes/auth/auth.route'));
app.use('/api/upload', require('./routes/upload.route'));
app.use('/api/usuarios', require('./routes/core/seguridad/usuarios.route'));
app.use('/api/personas', require('./routes/core/registro/personas.route'));
app.use('/api/analistas', require('./routes/core/seguridad/analista.route'));
app.use('/api/operacion-financiera', require('./routes/core/registro/operacion-financiera.route'));

app.listen(process.env.PORT, () => {
    console.log('Servidor corriendo en puerto ' + process.env.PORT);
});