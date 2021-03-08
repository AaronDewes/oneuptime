const puppeteer = require('puppeteer');
const utils = require('./test-utils');
const init = require('./test-init');
const { Cluster } = require('puppeteer-cluster');

require('should');

// user credentials
const email = utils.generateRandomBusinessEmail();
const password = '1234567890';

describe('Alert Warning', () => {
    const operationTimeOut = 1000000;

    let cluster;

    beforeAll(async done => {
        jest.setTimeout(2000000);

        cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_PAGE,
            puppeteerOptions: utils.puppeteerLaunchConfig,
            puppeteer,
            timeout: 1200000,
        });

        cluster.on('taskerror', err => {
            throw err;
        });

        return await cluster.execute(
            { email, password },
            async ({ page, data }) => {
                const user = {
                    email: data.email,
                    password: data.password,
                };
                await init.registerUser(user, page);             
                done();
            }
        );
    });

    afterAll(async done => {
        await cluster.idle();
        await cluster.close();
        done();
    });

    test(
        'Should show a warning alert if call and sms alerts are disabled',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#projectSettings');
                await page.click('#projectSettings');
                await page.waitForSelector('#billing');
                await page.click('#billing');

                const element = await page.waitForSelector('#alertWarning');
                expect(element).toBeDefined();
            });
        },
        operationTimeOut
    );

    test(
        'Should not show any warning alert if call and sms alerts are enabled',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#projectSettings');
                await page.click('#projectSettings');
                await page.waitForSelector('#billing');
                await page.click('#billing a');
                await page.waitForSelector('#alertEnable');

                const rowLength = await page.$$eval(
                    '#alertOptionRow > div.bs-Fieldset-row',
                    rows => rows.length
                );

                if (rowLength === 1) {
                    // enable sms and call alerts
                    // check the box
                    await page.evaluate(() => {
                        document.querySelector('#alertEnable').click();
                        document.querySelector('#alertOptionSave').click();
                    });
                }
                const element = await page.waitForSelector('#alertWarning', {
                    hidden: true,
                });
                expect(element).toBeNull();
            });
        },
        operationTimeOut
    );
});
