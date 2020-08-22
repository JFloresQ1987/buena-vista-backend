const winston = require('winston');

const report = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: './logger/report.log' })
    ]
});

module.exports = {
    report
}