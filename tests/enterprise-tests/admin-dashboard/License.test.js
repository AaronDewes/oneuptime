const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');
let browser, page;

require('should');

// user credentials
const userEmail = utils.generateRandomBusinessEmail();
const password = '1234567890';

describe('Enterprise License API', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async done => {
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);

        const user = {
            email: userEmail,
            password: password,
        };
        // user
        await init.registerEnterpriseUser(user, page, false);
        //await browser.close();
        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'Should not confirm expired license',
        async done => {
            await page.goto(utils.ADMIN_DASHBOARD_URL);
            await init.pageWaitForSelector(page, '#settings');
            await init.pageClick(page, '#settings');

            await init.pageWaitForSelector(page, '#license');
            await init.pageClick(page, 'input[name=license]');
            await init.pageType(page, 'input[name=license]', 'expired-license');
            await init.pageClick(page, 'input[name=email]');
            await init.pageType(
                page,
                'input[name=email]',
                utils.generateRandomBusinessEmail()
            );
            await init.pageClick(page, 'button[type=submit]');

            const expiredError = await init.page$Eval(
                page,
                '#licenseError',
                e => {
                    return e.innerHTML;
                }
            );

            expect(expiredError).toEqual('License Expired');

            done();
        },
        operationTimeOut
    );
});
