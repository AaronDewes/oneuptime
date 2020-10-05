const puppeteer = require('puppeteer');
const { Cluster } = require('puppeteer-cluster');
const utils = require('./test-utils');
const init = require('./test-init');

require('should');

const operationTimeOut = 100000;
const email = 'masteradmin@hackerbay.io';
const password = '1234567890';

const moveToSsoPage = async page => {
    await page.waitForSelector('#settings', { visible: true });
    await page.click('#settings');
    await page.waitForSelector('#sso');
    await page.click('#sso');
};

const createSso = async (page, data) => {
    await page.waitForSelector('#add-sso', { visible: true });
    await page.click('#add-sso');
    await page.waitForSelector('#save-button');

    if (data['saml-enabled']) await page.click('#saml-enabled-slider');

    await page.click('#domain');
    await page.type('#domain', data.domain);

    await page.click('#samlSsoUrl');
    await page.type('#samlSsoUrl', data.samlSsoUrl);

    await page.click('#certificateFingerprint');
    await page.type('#certificateFingerprint', data.certificateFingerprint);

    await page.click('#remoteLogoutUrl');
    await page.type('#remoteLogoutUrl', data.remoteLogoutUrl);

    await page.click('#ipRanges');
    await page.type('#ipRanges', data.ipRanges);

    await page.click('#save-button');
    await page.waitForSelector('#save-button', { hidden: true });
};

describe('SSO login', () => {
    let cluster;
    beforeAll(async done => {
        jest.setTimeout(200000);
        cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_PAGE,
            puppeteerOptions: utils.puppeteerLaunchConfig,
            puppeteer,
            timeout: 120000,
        });

        cluster.on('taskerror', err => {
            throw err;
        });

        cluster.task(async ({ page }) => {
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
        });
        cluster.queue();
        done();
    });

    afterAll(async done => {
        await cluster.idle();
        await cluster.close();
        done();
    });

    it(
        'Should return an error message if the domain is not defined in the database.',
        async done => {
            cluster.execute(null, async ({ page }) => {
                await page.goto(utils.ACCOUNTS_URL + '/login', {
                    waitUntil: 'networkidle2',
                });
                await page.waitForSelector('#login-button');
                await page.click('#sso-login');
                await page.click('input[name=email]');
                await page.type(
                    'input[name=email]',
                    'email@inexistent-domain.hackerbay.io'
                );
                await page.click('button[type=submit]');
                await page.waitForResponse(response =>
                    response.url().includes('/login')
                );
                const html = await page.$eval('#main-body', e => e.innerHTML);
                html.should.containEql('Domain not found.');
            });
            done();
        },
        operationTimeOut
    );

    it(
        "Should return an error message if the SSO authentication is disabled for the email's domain.",
        async done => {
            cluster.execute(null, async ({ page }) => {
                await page.goto(utils.ACCOUNTS_URL + '/login', {
                    waitUntil: 'networkidle2',
                });
                await page.waitForSelector('#login-button');
                await page.click('#sso-login');
                await page.click('input[name=email]');
                await page.type(
                    'input[name=email]',
                    'email@disabled-domain.hackerbay.io'
                );
                await Promise.all([
                    page.click('button[type=submit]'),
                    page.waitForResponse(response =>
                        response.url().includes('/login')
                    ),
                ]);
                const html = await page.$eval('#main-body', e => e.innerHTML);
                html.should.containEql('SSO disabled for this domain.');
            });
            done();
        },
        operationTimeOut
    );

    it(
        'Should redirects the user if the domain is defined in the database.',
        async done => {
            cluster.execute(
                { username: 'user1', password: 'user1pass' },
                async ({ page, data }) => {
                    const { username, password } = data;
                    await page.goto(utils.ACCOUNTS_URL + '/login', {
                        waitUntil: 'networkidle2',
                    });
                    await page.waitForSelector('#login-button');
                    await page.click('#sso-login');
                    await page.click('input[name=email]');
                    await page.type(
                        'input[name=email]',
                        'email@tests.hackerbay.io'
                    );
                    const [response] = await Promise.all([
                        page.waitForNavigation('networkidle2'),
                        page.click('button[type=submit]'),
                    ]);
                    const chain = response.request().redirectChain();
                    expect(chain.length).not.toBe(0);

                    await page.click('#username');
                    await page.type('#username', username);

                    await page.click('#password');
                    await page.type('#password', password);

                    await Promise.all([
                        page.waitForNavigation('networkidle2'),
                        page.click('button'),
                    ]);

                    await page.waitForSelector('#createButton');
                }
            );
            done();
        },
        operationTimeOut
    );
});
