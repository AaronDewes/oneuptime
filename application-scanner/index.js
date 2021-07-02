const { NODE_ENV } = process.env;

if (!NODE_ENV || NODE_ENV === 'development') {
    // Load env vars from /backend/.env
    require('custom-env').env();
}

process.on('exit', () => {
    /* eslint-disable no-console */
    console.log('Application Scanner Shutting Shutdown');
});

process.on('unhandledRejection', err => {
    /* eslint-disable no-console */
    console.error(
        'Unhandled rejection in application scanner process occurred'
    );
    /* eslint-disable no-console */
    console.error(err);
});

process.on('uncaughtException', err => {
    /* eslint-disable no-console */
    console.error('Uncaught exception in application scanner process occurred');
    /* eslint-disable no-console */
    console.error(err);
});

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const Main = require('./worker/main');
const cron = require('node-cron');
const config = require('./utils/config');

const cronApplicationSecurityStartTime = Math.floor(Math.random() * 50);

app.use(cors());
app.set('port', process.env.PORT || 3005);

http.listen(app.get('port'), function() {
    // eslint-disable-next-line
    console.log(
        `Application Scanner Started on port ${app.get(
            'port'
        )}. Fyipe API URL: ${config.serverUrl}`
    );
});

app.get('/', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(
        JSON.stringify({
            status: 200,
            message: 'Service Status - OK',
            serviceType: 'fyipe-application-scanner',
        })
    );
});

//App Version
app.get(['/application/version', '/version'], function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({ applicationScannerVersion: process.env.npm_package_version });
});

// Run this cron at 3 AM once a day.
cron.schedule('*/2 * * * *', () => {
    setTimeout(() => {
        Main.runApplicationScan();
    }, cronApplicationSecurityStartTime * 1000);
});

module.exports = app;
