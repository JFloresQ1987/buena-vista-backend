const logger = require('../helpers/logger');
const User = require('../models/user');
const Transaction = require('../models/transaction');

const fake = async(req, res = response) => {

    const userId = "1";
    const amount = 500;

    const session = await User.startSession();
    session.startTransaction();
    try {
        const opts = { session };

        const modelo = new User({ userId: "userId", wallet: amount });
        const A = await modelo.save(opts);

        const modelo2 = new Transaction({ amount: amount, type: "credit" });
        const B = await modelo2.save(opts);

        await session.commitTransaction();
        session.endSession();

        logger.report.info('Transaccion Ok.');

        return res.json({
            ok: true,
            msg: 'Transaccion Ok.'
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        logger.report.error('Transaccion NO Ok.');

        return res.status(500).json({
            ok: false,
            msg: 'Transaccion NO Ok.'
        });
    }
}

module.exports = {
    fake
}