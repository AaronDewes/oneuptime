const faker = require('faker');

const user = faker.helpers.createCard();
user.email = generateRandomBusinessEmail();
user.password = generatePassword();
user.card = '4111111111111111';
user.cvv = '100';
user.expiryDate = '12/23';
user.message = 'Test message';

const puppeteerLaunchConfig = {
    headless: process.env.HEADLESS === 'false' ? false : true,
    defaultViewport: null,
    slowMo: process.env.SLOMO ? parseInt(process.env.SLOMO) : null,
    args: [
        '--start-maximized',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--proxy-server=',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
    ],
};

const HOME_URL = process.env.HOME_URL || 'http://localhost:1444';
const ACCOUNTS_URL = process.env.ACCOUNTS_URL || 'http://localhost:3003';
const ADMIN_DASHBOARD_URL =
    process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3100';
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';
const STATUSPAGE_URL = process.env.STATUSPAGE_URL || 'http://localhost:3006';
const APIDOCS_URL = process.env.APIDOCS_URL || 'http://localhost:1445';

function generateRandomBusinessEmail() {
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
function generatePassword() {
    return Math.random()
        .toString(36)
        .substring(7);
}
function generateRandomString() {
    return Math.random()
        .toString(36)
        .substring(8);
}

module.exports = {
    HOME_URL,
    ACCOUNTS_URL,
    ADMIN_DASHBOARD_URL,
    DASHBOARD_URL,
    BACKEND_URL,
    STATUSPAGE_URL,
    APIDOCS_URL,
    user,
    puppeteerLaunchConfig,
    generateRandomString,
    generateRandomBusinessEmail,
};
