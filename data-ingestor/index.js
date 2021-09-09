/* eslint-disable no-console */
const { NODE_ENV } = process.env;
if (!NODE_ENV || NODE_ENV === 'development') {
    // Load env vars from /data-ingestor/.env
    require('custom-env').env();
}

const express = require('express');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const { mongoUrl } = require('./utils/config');
const MongoClient = require('mongodb').MongoClient;

process.on('exit', () => {
    console.log('Server Shutting Shutdown');
});

process.on('unhandledRejection', err => {
    console.error('Unhandled rejection in server process occurred');
    console.error(err);
});

process.on('uncaughtException', err => {
    console.error('Uncaught exception in server process occurred');
    console.error(err);
});

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: `data-ingestor@${process.env.npm_package_version}`,
    environment: process.env.NODE_ENV,
    integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Tracing.Integrations.Express({
            app,
        }),
    ],
    tracesSampleRate: 1.0,
});

// mongodb
function getMongoClient() {
    return new MongoClient(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}
// setup mongodb connection
const client = getMongoClient();
(async function() {
    try {
        console.log('connecting to db');
        await client.connect();
        console.log('connected to db');
    } catch (error) {
        console.log('connection error: ', error);
    }
})();

// attach the database to global object
global.db = client.db('fyipedb');

// Sentry: The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use(cors());

app.use(function(req, res, next) {
    if (typeof req.body === 'string') {
        req.body = JSON.parse(req.body);
    }
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header(
        'Access-Control-Allow-Headers',
        'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept,Authorization'
    );

    return next();
});

// Add limit of 10 MB to avoid "Request Entity too large error"
// https://stackoverflow.com/questions/19917401/error-request-entity-too-large
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json({ limit: '10mb' }));

app.use(['/probe', '/api/probe'], require('./api/probe'));

app.use(Sentry.Handlers.errorHandler());

app.set('port', process.env.PORT || 3200);

http.listen(app.get('port'), function() {
    // eslint-disable-next-line
    console.log('data-ingestor server started on port ' + app.get('port'));
});

module.exports = app;
