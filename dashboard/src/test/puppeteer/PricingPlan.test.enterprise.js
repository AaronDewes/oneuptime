const puppeteer = require('puppeteer');
const utils = require('./test-utils');
const init = require('./test-init');
const { Cluster } = require('puppeteer-cluster');

require('should');

// user credentials
const email = utils.generateRandomBusinessEmail();
const password = '1234567890';
const pageName = utils.generateRandomString();

describe('Status Page', () => {
    const operationTimeOut = 500000;

    let cluster;
    beforeAll(async () => {
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
            await init.registerEnterpriseUser(user, page);
        });
    });

    afterAll(async done => {
        await cluster.idle();
        await cluster.close();
        done();
    });

    test(
        'should not show upgrade modal if IS_SAAS_SERVICE is false',
        async () => {
            await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL, {
                    waitUntil: 'networkidle0',
                });

                await page.$eval('#statusPages', elem => elem.click());
                await page.waitForSelector(
                    'button[type="button"] .bs-FileUploadButton'
                );
                await page.click('button[type="button"] .bs-FileUploadButton');
                await page.waitForSelector('#name');
                await page.click('#name');
                await page.type('#name', pageName);
                await page.click('#btnCreateStatusPage');
                // select the first item from the table row
                const rowItem = await page.waitForSelector(
                    '#statusPagesListContainer > tr',
                    { visible: true }
                );
                rowItem.click();
                await page.waitForSelector('ul#customTabList > li', {
                    visible: true,
                });
                await page.$$eval('ul#customTabList > li', elems =>
                    elems[4].click()
                );
                await page.$eval('input[name="isPrivate"]', elem =>
                    elem.click()
                );

                const modal = await page.$('#pricingPlanModal');

                expect(modal).toBeNull();
            });
        },
        operationTimeOut
    );
});
