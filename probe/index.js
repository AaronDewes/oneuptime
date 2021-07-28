// if new relic license key exists. Then load the key.
if (process.env.NEW_RELIC_LICENSE_KEY) {
    require('newrelic');
}

const { NODE_ENV } = process.env;

if (!NODE_ENV || NODE_ENV === 'development') {
    // Load env vars from /backend/.env
    require('custom-env').env();
}

process.on('exit', () => {
    // eslint-disable-next-line no-console
    console.log('Probe Shutting Shutdown');
});

process.on('unhandledRejection', err => {
    // eslint-disable-next-line no-console
    console.error('Unhandled rejection in probe process occurred');
    // eslint-disable-next-line no-console
    console.error(err);
});

process.on('uncaughtException', err => {
    // eslint-disable-next-line no-console
    console.error('Uncaught exception in probe process occurred');
    // eslint-disable-next-line no-console
    console.error(err);
});

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const Main = require('./workers/main');
const cron = require('node-cron');
const config = require('./utils/config');

const cronMinuteStartTime = Math.floor(Math.random() * 50);

app.use(cors());
app.set('port', process.env.PORT || 3008);

http.listen(app.get('port'), function() {
    // eslint-disable-next-line
    console.log(
        `Probe with Probe Name ${config.probeName} and Probe Key ${
            config.probeKey
        } Started on port ${app.get('port')}. Fyipe API URL: ${
            config.serverUrl
        }`
    );
});

app.get('/', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(
        JSON.stringify({
            status: 200,
            message: 'Service Status - OK',
            serviceType: 'fyipe-probe',
        })
    );
});

//App Version
app.get(['/probe/version', '/version'], function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({ probeVersion: process.env.npm_package_version });
});

// This cron runs every other minute.
cron.schedule('* * * * *', () => {
    setTimeout(() => {
        Main.runJob();
    }, cronMinuteStartTime * 1000);
});

module.exports = app;
