process.on('exit', () => {
    /* eslint-disable no-console */
    console.log('Shutting Shutdown');
});

process.on('unhandledRejection', err => {
    /* eslint-disable no-console */
    console.error('Unhandled rejection in process occurred');
    /* eslint-disable no-console */
    console.error(err);
});

process.on('uncaughtException', err => {
    /* eslint-disable no-console */
    console.error('Uncaught exception in process occurred');
    /* eslint-disable no-console */
    console.error(err);
});

const express = require('express');
const path = require('path');
const app = express();
const child_process = require('child_process');
const cors = require('cors');
const fs = require('fs');

let chunkFile, mainChunkFile;
const directory = path.join(__dirname, 'build', 'static', 'js');
fs.readdir(directory, function(err, files) {
    const chunkRegex = /2\.(.+)\.chunk\.(js)$/;
    const mainChunkRegex = /main\.(.+)\.chunk\.(js)$/;
    if (err) {
        /* eslint-disable no-console */
        console.log('Unable to scan directory: ', err);
    }
    for (let i = 0; i < files.length; i++) {
        if (chunkRegex.test(files[i])) {
            chunkFile = files[i];
        }
        if (mainChunkRegex.test(files[i])) {
            mainChunkFile = files[i];
        }
    }
});

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
    if (req.get('host').includes('cluster.local')) {
        return next();
    }
    next();
});

app.get(['/env.js', '/dashboard/env.js'], function(req, res) {
    const isClustLocal = req.get('host').includes('cluster.local');
    if (!isClustLocal) {
        global.dashboardHost = 'https://' + req.host + '/dashboard';
        global.homeHost = 'https://' + req.host;
        global.accountsHost = 'https://' + req.host + '/accounts';
        global.backendHost = 'https://' + req.host + '/api';
    }
    if (req.host.includes('localhost')) {
        if (req.get('host').includes('localhost:')) {
            global.dashboardHost =
                'http://' + req.host + ':' + (process.env.PORT || 3002);
            global.accountsHost = 'http://' + req.host + ':' + 3003;
            global.homeHost = 'http://' + req.host + ':' + 1444;
            global.backendHost = 'http://' + req.host + ':' + 3002;
        } else if (!isClustLocal) {
            global.dashboardHost = 'http://' + req.host + '/dashboard';
            global.accountsHost = 'http://' + req.host + '/accounts';
            global.homeHost = 'http://' + req.host;
            global.backendHost = 'http://' + req.host + '/api';
        }
    }

    const env = {
        REACT_APP_IS_SAAS_SERVICE: process.env.IS_SAAS_SERVICE,
        ...(!isClustLocal && {
            REACT_APP_HOST: global.dashboardHost,
            REACT_APP_ACCOUNTS_HOST: global.accountsHost,
            REACT_APP_BACKEND_HOST: global.backendHost,
        }),
        REACT_APP_DOMAIN: req.host,
        REACT_APP_STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
        REACT_APP_PUSHNOTIFICATION_PUBLIC_KEY:
            process.env.PUSHNOTIFICATION_PUBLIC_KEY,
        REACT_APP_AMPLITUDE_PUBLIC_KEY: process.env.AMPLITUDE_PUBLIC_KEY,
        REACT_APP_VERSION: process.env.REACT_APP_VERSION,
        REACT_APP_STATUSPAGE_DOMAIN: process.env.STATUSPAGE_DOMAIN,
    };

    res.contentType('application/javascript');
    res.send('window._env = ' + JSON.stringify(env));
});

//APP VERSION
app.use(['/dashboard/api/version', '/dashboard/version'], function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.json({ dashboardVersion: process.env.npm_package_version });
});

app.use(express.static(path.join(__dirname, 'build')));
app.use('/dashboard', express.static(path.join(__dirname, 'build')));
app.use(/^\/dashboard\/static\/js\/2\.(.+)\.chunk\.js$/, function(
    req,
    res,
    next
) {
    if (chunkFile) {
        res.sendFile(path.join(__dirname, 'build', 'static', 'js', chunkFile));
    } else {
        next();
    }
});
app.use(/^\/dashboard\/static\/js\/main\.(.+)\.chunk\.js$/, function(
    req,
    res,
    next
) {
    if (mainChunkFile) {
        res.sendFile(
            path.join(__dirname, 'build', 'static', 'js', mainChunkFile)
        );
    } else {
        next();
    }
});
app.use(
    '/dashboard/static/js',
    express.static(path.join(__dirname, 'build/static/js'))
);

app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = 3000;
// eslint-disable-next-line no-console
console.log(`This project is running on port ${PORT}`);
app.listen(PORT);
