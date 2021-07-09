const { NODE_ENV } = process.env;

if (!NODE_ENV || NODE_ENV === 'development') {
    // Load env vars from /backend/.env
    require('custom-env').env();
}

process.on('exit', () => {
    // eslint-disable-next-line no-console
    console.log('Container Scanner Shutting Shutdown');
});

process.on('unhandledRejection', err => {
    // eslint-disable-next-line no-console
    console.error(
        'Unhandled rejection in container scanner process occurred'
    );
    // eslint-disable-next-line no-console
    console.error(err);
});

process.on('uncaughtException', err => {
    // eslint-disable-next-line no-console
    console.error('Uncaught exception in container scanner process occurred');
    // eslint-disable-next-line no-console
    console.error(err);
});

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const Main = require('./worker/main');
const cron = require('node-cron');
const config = require('./utils/config');

const cronContainerSecurityStartTime = Math.floor(Math.random() * 50);

app.use(cors());
app.set('port', process.env.PORT || 3055);

http.listen(app.get('port'), function() {
    // eslint-disable-next-line
    console.log(
        `Container Scanner Started on port ${app.get(
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
            serviceType: 'fyipe-container-scanner',
        })
    );
});

//App Version
app.get(['/container/version', '/version'], function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({ containerScannerVersion: process.env.npm_package_version });
});

//Run this cron every 5 minute.
cron.schedule('*/5 * * * *', () => {
    setTimeout(() => {
        Main.runContainerScan();
    }, cronContainerSecurityStartTime * 1000);
});

module.exports = app;
