/**
 *
 * Copyright HackerBay, Inc.
 *
 */

const mongoose = require('mongoose');
const logger = require('./logger');
const mongoUrl =
    process.env['MONGO_URL'] || 'mongodb://localhost:27017/fyipedb';

let options = {};

if (process.env.IS_MONGO_REPLICA_SET) {
    options = {
        // commented because this was having issues reading "latest" data that was saved on primary.
        // readPreference: 'secondaryPreferred',
        keepAlive: 1,
    };
}

mongoose
    .connect(mongoUrl, options)
    .then(() => {
        return logger.info('Mongo connected');
    })
    .catch(err => {
        // mongoose connection error will be handled here
        logger.error(err);
        process.exit(1);
    });

module.exports = mongoose;
