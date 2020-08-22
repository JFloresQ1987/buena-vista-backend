const { Schema, model } = require('mongoose');

const UserSchema = Schema({
    userId: String,
    wallet: Number
});

module.exports = model('User', UserSchema);