const puppeteer = require('puppeteer');
const utils = require('./test-utils');
const init = require('./test-init');
const { Cluster } = require('puppeteer-cluster');

require('should');

// user credentials
const email = utils.generateRandomBusinessEmail();
const password = '1234567890';
// smtp credential
const smtpData = { ...utils.smtpCredential };

describe('Custom SMTP Settings', () => {
    const operationTimeOut = 500000;

    let cluster;
    beforeAll(async done => {
        jest.setTimeout(360000);

        cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_PAGE,
            puppeteerOptions: utils.puppeteerLaunchConfig,
            puppeteer,
            timeout: 500000,
        });

        cluster.on('error', err => {
            throw err;
        });

        await cluster.execute({ email, password }, async ({ page, data }) => {
            const user = {
                email: data.email,
                password: data.password,
            };
            // user
            await init.registerUser(user, page);
            await init.loginUser(user, page);
        });

        done();
    });

    afterAll(async done => {
        await cluster.idle();
        await cluster.close();
        done();
    });

    test(
        'should create a custom smtp settings',
        async done => {
            await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#projectSettings', {
                    visible: true,
                });
                await page.click('#projectSettings');
                await page.waitForSelector('#email');
                await page.click('#email');
                await page.waitForSelector('label[id=showsmtpForm]');
                await page.click('label[id=showsmtpForm]');
                await page.waitForSelector('#user');
                await page.click('#user');
                await page.type('#user', smtpData.user);
                await page.click('#pass');
                await page.type('#pass', smtpData.pass);
                await page.click('#host');
                await page.type('#host', smtpData.host);
                await page.click('#port');
                await page.type('#port', smtpData.port);
                await page.click('#from');
                await page.type('#from', smtpData.from);
                await page.$eval('#secure', elem => elem.click());
                await page.click('#saveSmtp');
                await page.waitForSelector('.ball-beat', { hidden: true });
                await page.reload();
                await page.waitForSelector('#host');
                const host = await page.$eval('#host', elem => elem.value);
                expect(host).toBe(smtpData.host);
            });

            done();
        },
        operationTimeOut
    );

    test(
        'should update a custom smtp settings',
        async done => {
            await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#projectSettings', {
                    visible: true,
                });
                await page.click('#projectSettings');
                await page.waitForSelector('#email');
                await page.click('#email');
                const from = 'test@fyipe.com';
                await page.waitForSelector('#from', { visible: true });
                await page.click('#from', { clickCount: 3 });
                await page.type('#from', from);
                await page.click('#saveSmtp');
                await page.waitForSelector('.ball-beat', { hidden: true });
                await page.reload();
                await page.waitForSelector('#from');
                const fromVal = await page.$eval('#from', elem => elem.value);
                expect(fromVal).toBe(from);
            });

            done();
        },
        operationTimeOut
    );

    test(
        'should not save a custom smtp settings if one of the input fields is missing',
        async done => {
            await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#projectSettings', {
                    visible: true,
                });
                await page.click('#projectSettings');
                await page.waitForSelector('#email');
                await page.click('#email');
                await page.waitForSelector('#port', { visible: true });
                const port = await page.$('#port');
                await port.click({ clickCount: 3 });
                await port.press('Backspace'); // clear out the input field
                await page.click('#saveSmtp');
                const error = await page.waitForSelector('#errorInfo', {
                    visible: true,
                });
                expect(error).toBeDefined();
            });

            done();
        },
        operationTimeOut
    );

    test(
        'should delete custom smtp settings',
        async done => {
            await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#projectSettings', {
                    visible: true,
                });
                await page.click('#projectSettings');
                await page.waitForSelector('#email');
                await page.click('#email');
                await page.waitForSelector('label[id=showsmtpForm]');
                await page.waitForSelector('label[id=enableSecureTransport]');
                await page.waitForSelector('#saveSmtp');
                await page.click('label[id=enableSecureTransport]');
                await page.click('label[id=showsmtpForm]');
                await page.click('#saveSmtp');
                await page.reload();
                const username = await page.$('#user');
                expect(username).toBe(null);
            });

            done();
        },
        operationTimeOut
    );

    test(
        'should display an error if custom smtp settings is already deleted',
        async done => {
            await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#projectSettings', {
                    visible: true,
                });
                await page.click('#projectSettings');
                await page.waitForSelector('#email');
                await page.click('#email');
                await page.waitForSelector('#saveSmtp');
                await page.click('#saveSmtp');
                const error = await page.waitForSelector('#errorInfo', {
                    visible: true,
                });
                expect(error).toBeDefined();
            });

            done();
        },
        operationTimeOut
    );
});
