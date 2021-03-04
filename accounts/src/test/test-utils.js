const faker = require('faker');

const ACCOUNTS_URL = 'http://localhost:3003/accounts';
const ACCOUNTS_URL1 = 'http://127.0.0.1:3003/accounts';
const DASHBOARD_URL = 'http://localhost:3000/dashboard';
const DASHBOARD_URL1 = 'http://127.0.0.1:3000/dashboard';
const ADMIN_DASHBOARD_URL = 'http://localhost:3100/admin';

const puppeteerLaunchConfig = {
    args: [
        '--proxy-server=',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process', // fix issue with cross origin policy
    ],
    defaultViewport: null,
    headless: true, //change this to `false` debug locally.
};

const user = faker.helpers.createCard();

function generateWrongEmail() {
    return (
        Math.random()
            .toString(36)
            .substring(8) +
        '@' +
        Math.random()
            .toString(24)
            .substring(8) +
        '.com'
    );
}

function generateRandomString() {
    return Math.random()
        .toString(36)
        .substring(10);
}

function generateRandomBusinessEmail() {
    return `${Math.random()
        .toString(36)
        .substring(7)}@${Math.random()
        .toString(36)
        .substring(5)}.com`;
}

module.exports = {
    ACCOUNTS_URL,
    ACCOUNTS_URL1,
    DASHBOARD_URL,
    DASHBOARD_URL1,
    ADMIN_DASHBOARD_URL,
    puppeteerLaunchConfig,
    user,
    generateWrongEmail,
    generateRandomString,
    generateRandomBusinessEmail,
};
