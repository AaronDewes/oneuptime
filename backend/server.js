const express = require('express');
const app = express();

const { NODE_ENV } = process.env;

if (!NODE_ENV || NODE_ENV === 'development') {
    // Load env vars from /backend/.env
    require('custom-env').env();
}

process.on('exit', () => {
    /* eslint-disable no-console */
    console.log('Server Shutting Shutdown');
});

process.on('uncaughtException', err => {
    /* eslint-disable no-console */
    console.error('Uncaught exception in server process occurred');
    /* eslint-disable no-console */
    console.error(err);
});

const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    path: '/api/socket.io',
});
const redisAdapter = require('socket.io-redis');
const bodyParser = require('body-parser');
const cors = require('cors');

io.adapter(
    redisAdapter({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    })
);

global.io = io;

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

    // Add this to global object, and this can be used anywhere where you need backend host.
    global.apiHost = 'https://' + req.hostname + '/api';
    global.accountsHost = 'https://' + req.hostname + '/accounts';
    global.homeHost = 'https://' + req.hostname;
    global.dashboardHost = 'https://' + req.hostname + '/dashboard';

    if (
        req.hostname.includes('localhost') ||
        req.hostname.includes('127.0.0.1')
    ) {
        if (
            req.get('host').includes('localhost:') ||
            req.get('host').includes('127.0.0.1:')
        ) {
            global.apiHost =
                'http://' +
                req.hostname +
                ':' +
                (process.env.PORT || 3002) +
                '/api';
            global.accountsHost =
                'http://' + req.hostname + ':' + 3003 + '/accounts';
            global.homeHost = 'http://' + req.hostname + ':' + 1444;
            global.dashboardHost =
                'http://' + req.hostname + ':' + 3000 + '/dashboard';
        } else {
            global.apiHost = 'http://' + req.hostname + '/api';
            global.accountsHost = 'http://' + req.hostname + '/accounts';
            global.homeHost = 'http://' + req.hostname;
            global.dashboardHost = 'http://' + req.hostname + '/dashboard';
        }
    }

    next();
});

// Add limit of 10 MB to avoid "Request Entity too large error"
// https://stackoverflow.com/questions/19917401/error-request-entity-too-large
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));

const { RATE_LIMITTER_ENABLED } = process.env;
if (RATE_LIMITTER_ENABLED === 'true') {
    const rateLimiter = require('./backend/middlewares/rateLimit');
    app.use(rateLimiter);
}
//View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'views')));
app.use('/api', express.static(path.join(__dirname, 'views')));

app.use(require('./backend/middlewares/auditLogs').log);

// Routes(API)
app.use(['/alert', '/api/alert'], require('./backend/api/alert'));
app.use(['/user', '/api/user'], require('./backend/api/user'));
app.use(['/token', '/api/token'], require('./backend/api/token'));
app.use(['/team', '/api/team'], require('./backend/api/team'));
app.use(['/project', '/api/project'], require('./backend/api/project'));
app.use(['/invoice', '/api/invoice'], require('./backend/api/invoice'));
app.use(['/schedule', '/api/schedule'], require('./backend/api/schedule'));
app.use(['/monitor', '/api/monitor'], require('./backend/api/monitor'));
app.use(
    ['/statusPage', '/api/statusPage'],
    require('./backend/api/statusPage')
);
app.use(['/file', '/api/file'], require('./backend/api/file'));
app.use(['/incident', '/api/incident'], require('./backend/api/incident'));
app.use(['/incidentPriorities', '/api/incidentPriorities'], require('./backend/api/incidentPriorities'));
app.use(['/reports', '/api/reports'], require('./backend/api/report'));
app.use(['/lead', '/api/lead'], require('./backend/api/lead'));
app.use(['/feedback', '/api/feedback'], require('./backend/api/feedback'));
app.use(['/twilio', '/api/twilio'], require('./backend/api/twilio'));
app.use(['/sso', '/api/sso'], require('./backend/api/sso'));
app.use(['/zapier', '/api/zapier'], require('./backend/api/zapier'));
app.use(['/slack', '/api/slack'], require('./backend/api/slack'));
app.use(['/webhook', '/api/webhook'], require('./backend/api/webHook'));

app.use(['/server', '/api/server'], require('./backend/api/server'));

app.use(
    ['/notification', '/api/notification'],
    require('./backend/api/notification')
);
app.use(['/stripe', '/api/stripe'], require('./backend/api/stripe'));
app.use(
    ['/subscriber', '/api/subscriber'],
    require('./backend/api/subscriber')
);
app.use(
    ['/subscriberAlert', '/api/subscriberAlert'],
    require('./backend/api/subscriberAlert')
);
app.use(
    ['/emailTemplate', '/api/emailTemplate'],
    require('./backend/api/emailTemplate')
);
app.use(['/emailSmtp', '/api/emailSmtp'], require('./backend/api/emailSmtp'));
app.use(
    ['/smsTemplate', '/api/smsTemplate'],
    require('./backend/api/smsTemplate')
);
app.use(['/smsSmtp', '/api/smsSmtp'], require('./backend/api/smsSmtp'));
app.use(
    ['/monitorCategory', '/api/monitorCategory'],
    require('./backend/api/monitorCategory')
);
app.use(
    ['/monitorCriteria', '/api/monitorCriteria'],
    require('./backend/api/monitorCriteria')
);
app.use(
    ['/scheduledEvent', '/api/scheduledEvent'],
    require('./backend/api/scheduledEvent')
);
app.use(['/probe', '/api/probe'], require('./backend/api/probe'));
app.use(['/version', '/api/version'], require('./backend/api/version'));
app.use(['/tutorial', '/api/tutorial'], require('./backend/api/tutorial'));
app.use(['/audit-logs', '/api/audit-logs'], require('./backend/api/auditLogs'));
app.use(['/component', '/api/component'], require('./backend/api/component'));
app.use(
    ['/application-log', '/api/application-log'],
    require('./backend/api/applicationLog')
);
app.use(
    ['/globalConfig', '/api/globalConfig'],
    require('./backend/api/globalConfig')
);
app.use(
    ['/domainVerificationToken', '/api/domainVerificationToken'],
    require('./backend/api/domainVerificationToken')
);
app.use(
    ['/security', '/api/security'],
    require('./backend/api/containerSecurity')
);
app.use(
    ['/security', '/api/security'],
    require('./backend/api/applicationSecurity')
);
app.use(
    ['/credential', '/api/credential'],
    require('./backend/api/gitCredential')
);
app.use(
    ['/credential', '/api/credential'],
    require('./backend/api/dockerCredential')
);
app.use(
    ['/securityLog', '/api/securityLog'],
    require('./backend/api/applicationSecurityLog')
);
app.use(
    ['/securityLog', '/api/securityLog'],
    require('./backend/api/containerSecurityLog')
);

app.set('port', process.env.PORT || 3002);

const server = http.listen(app.get('port'), function() {
    // eslint-disable-next-line
    console.log('Server Started on port ' + app.get('port'));
});

app.get(['/', '/api'], function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(
        JSON.stringify({
            status: 200,
            message: 'Service Status - OK',
            serviceType: 'fyipe-api',
        })
    );
});

app.use('/*', function(req, res) {
    res.status(404).render('notFound.ejs', {});
});

//attach cron jobs
require('./backend/workers/main');

module.exports = app;
module.exports.close = function() {
    server.close();
};
