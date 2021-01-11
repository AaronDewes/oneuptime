const { NODE_ENV } = process.env;

if (!NODE_ENV || NODE_ENV === 'development') {
    // Load env vars from /backend/.env
    require('custom-env').env();
}

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const Main = require('./workers/main');
const cron = require('node-cron');
const config = require('./utils/config');

const cronMinuteStartTime = Math.floor(Math.random() * 50);
const cronApplicationSecurityStartTime = Math.floor(Math.random() * 50);
const cronContainerSecurityStartTime = Math.floor(Math.random() * 50);

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
app.get(['/version', 'probe/version'], function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({ probeVersion: process.env.npm_package_version });
});

// This cron runs every minute
cron.schedule('* * * * *', () => {
    setTimeout(() => {
        Main.runJob();
    }, cronMinuteStartTime * 1000);
});

cron.schedule('* * * * *', () => {
    setTimeout(() => {
        Main.runApplicationScan();
    }, cronApplicationSecurityStartTime * 1000);
});

cron.schedule('* * * * *', () => {
    setTimeout(() => {
        Main.runContainerScan();
    }, cronContainerSecurityStartTime * 1000);
});

module.exports = app;
