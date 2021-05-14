const puppeteer = require('puppeteer');

const utils = require('../../test-utils');
const init = require('../../test-init');
let browser, page;
require('should');
const operationTimeOut = init.timeout;
const email = 'masteradmin@hackerbay.io';
const password = '1234567890';

const moveToSsoPage = async page => {
    await page.waitForSelector('#settings', { visible: true });
    await init.pageClick(page, '#settings');
    await page.waitForSelector('#sso');
    await init.pageClick(page, '#sso');
};

const createSso = async (page, data) => {
    await page.waitForSelector('#add-sso', { visible: true });
    await init.pageClick(page, '#add-sso');
    await page.waitForSelector('#save-button');

    if (data['saml-enabled'])
        await init.pageClick(page, '#saml-enabled-slider');

    await init.pageClick(page, '#domain');
    await init.pageType(page, '#domain', data.domain);

    await init.pageClick(page, '#samlSsoUrl');
    await init.pageType(page, '#samlSsoUrl', data.samlSsoUrl);

    await init.pageClick(page, '#certificateFingerprint');
    await init.pageType(
        page,
        '#certificateFingerprint',
        data.certificateFingerprint
    );

    await init.pageClick(page, '#remoteLogoutUrl');
    await init.pageType(page, '#remoteLogoutUrl', data.remoteLogoutUrl);

    await init.pageClick(page, '#ipRanges');
    await init.pageType(page, '#ipRanges', data.ipRanges);

    await init.pageClick(page, '#save-button');
    await page.waitForSelector('#save-button', { hidden: true });
};

describe('SSO login', () => {
    beforeAll(async done => {
        jest.setTimeout(init.timeout);
        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);

        const user = { email, password };
        await init.registerEnterpriseUser(user, page);
        await moveToSsoPage(page);
        await createSso(page, {
            'saml-enabled': false,
            domain: `disabled-domain.hackerbay.io`,
            samlSsoUrl:
                'http://localhost:9876/simplesaml/saml2/idp/SSOService.php',
            certificateFingerprint: 'AZERTYUIOP',
            remoteLogoutUrl: 'http://localhost:9876/logout',
            ipRanges: '127.0.0.1',
        });
        await createSso(page, {
            'saml-enabled': true,
            domain: `tests.hackerbay.io`,
            samlSsoUrl:
                'http://localhost:9876/simplesaml/saml2/idp/SSOService.php',
            certificateFingerprint: 'AZERTYUIOP',
            remoteLogoutUrl: 'http://localhost:9876/logout',
            ipRanges: '127.0.0.1',
        });
        await init.logoutUser(page);

        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    it(
        'Should return an error message if the domain is not defined in the database.',
        async done => {
            await page.goto(utils.ACCOUNTS_URL + '/login', {
                waitUntil: 'networkidle2',
            });
            await page.waitForSelector('#login-button');
            await init.pageClick(page, '#sso-login');
            await init.pageClick(page, 'input[name=email]');
            await init.pageType(
                page,
                'input[name=email]',
                'email@inexistent-domain.hackerbay.io'
            );
            await init.pageClick(page, 'button[type=submit]');
            await page.waitForResponse(response =>
                response.url().includes('/login')
            );
            const html = await page.$eval('#main-body', e => e.innerHTML);
            html.should.containEql('Domain not found.');

            done();
        },
        operationTimeOut
    );

    it(
        "Should return an error message if the SSO authentication is disabled for the email's domain.",
        async done => {
            await page.goto(utils.ACCOUNTS_URL + '/login', {
                waitUntil: 'networkidle2',
            });
            await page.waitForSelector('#login-button');
            await init.pageClick(page, '#sso-login');
            await init.pageClick(page, 'input[name=email]');
            await init.pageType(
                page,
                'input[name=email]',
                'email@disabled-domain.hackerbay.io'
            );
            await Promise.all([
                init.pageClick(page, 'button[type=submit]'),
                page.waitForResponse(response =>
                    response.url().includes('/login')
                ),
            ]);
            const html = await page.$eval('#main-body', e => e.innerHTML);
            html.should.containEql('SSO disabled for this domain.');

            done();
        },
        operationTimeOut
    );

    it(
        'Should redirects the user if the domain is defined in the database.',
        async done => {
            await page.goto(utils.ACCOUNTS_URL + '/login', {
                waitUntil: 'networkidle2',
            });
            await page.waitForSelector('#login-button');
            await init.pageClick(page, '#sso-login');
            await init.pageClick(page, 'input[name=email]');
            await init.pageType(
                page,
                'input[name=email]',
                'email@tests.hackerbay.io'
            );
            const [response] = await Promise.all([
                page.waitForNavigation('networkidle2'),
                init.pageClick(page, 'button[type=submit]'),
            ]);
            const chain = response.request().redirectChain();
            expect(chain.length).not.toBe(0);

            await init.pageClick(page, '#username');
            await init.pageType(page, '#username', email);

            await init.pageClick(page, '#password');
            await init.pageType(page, '#password', password);

            await Promise.all([
                page.waitForNavigation('networkidle2'),
                init.pageClick(page, 'button'),
            ]);

            await page.waitForSelector('#createButton');

            done();
        },
        operationTimeOut
    );
});
