const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');

require('should');

let browser, page;
// user credentials

const email = utils.generateRandomBusinessEmail();
const password = '1234567890';

const user = {
    email,
    password,
};

describe('Enterprise Project API', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async done => {
        jest.setTimeout(init.timeout);
        jest.retryTimes(3);
        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);
        // Register user
        await init.registerEnterpriseUser(user, page);
        done();
    });

    afterAll(async done => {
        browser.close();
        done();
    });

    test(
        'Should create new project from dropdown after login for disabled payment',
        async done => {
            await init.adminLogout(page);
            await init.loginUser(user, page);
            await init.pageWaitForSelector(page, '#selector', { visble: true });
            await init.page$Eval(page, '#create-project', e => e.click());
            await init.pageWaitForSelector(page, '#name', { visble: true });
            await init.pageWaitForSelector(page, 'input[id=name]', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, 'input[id=name]');
            await page.focus('input[id=name]');
            await init.pageType(
                page,
                'input[id=name]',
                utils.generateRandomString()
            );

            const projectPlan = await init.page$(
                page,
                'input[id=Startup_month]'
            );
            expect(projectPlan).toBeDefined(); // Startup_month is part of the modal that gets popped out.

            await init.pageClick(page, 'button[type=submit]');
            // eslint-disable-next-line no-undef
            localStorageData = await page.evaluate(() => {
                const json = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    json[key] = localStorage.getItem(key);
                }
                return json;
            });
            // eslint-disable-next-line no-undef
            localStorageData.should.have.property('project');
            done();
        },
        operationTimeOut
    );
});
