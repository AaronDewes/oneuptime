const puppeteer = require('puppeteer');

const utils = require('../../test-utils');
const init = require('../../test-init');
let browser, page;
require('should');

const email = utils.generateRandomBusinessEmail();
const password = '1234567890';

describe('Users Component (IS_SAAS_SERVICE=false)', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async done => {
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);

        const user = {
            email: email,
            password: password,
        };
        await init.registerEnterpriseUser(user, page, false);

        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'should show a button to add more users to fyipe from admin dashboard',
        async done => {
            // navigating to dashboard url
            // automatically redirects to users route
            await page.goto(utils.ADMIN_DASHBOARD_URL, {
                waitUntil: 'networkidle0',
            });

            // if element does not exist it will timeout and throw
            const elem = await init.pageWaitForSelector(page, '#add_user', {
                visible: true,
                timeout: init.timeout,
            });
            expect(elem).toBeTruthy();

            done();
        },
        operationTimeOut
    );
});
