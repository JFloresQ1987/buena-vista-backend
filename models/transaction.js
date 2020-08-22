const { Schema, model } = require('mongoose');

const TransactionSchema = Schema({
    // user: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User'
    // },
    amount: Number,
    type: String,
    type: {
        type: String,
        required: true
    },
});

module.exports = model('Transaction', TransactionSchema);