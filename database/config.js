const mongoose = require('mongoose');
const { getMessage } = require('../helpers/messages');

const dbConnection = async() => {

    try {

        await mongoose, mongoose.connect(process.env.DB_CONN, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log(getMessage('msg001'));

    } catch (error) {

        console.log(error);
        throw new Error('Error al iniciar la BD.');
    }
}

module.exports = {
    dbConnection
}