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

describe('Project API', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async done => {
        jest.setTimeout(init.timeout);
        jest.retryTimes(3);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);

        // Register user
        await init.registerUser(user, page);

        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'Should create new project from dropdown after login',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await init.pageWaitForSelector(page, '#selector', {
                visible: true,
                timeout: init.timeout,
            });
            await init.page$Eval(page, '#create-project', e => e.click());
            await init.pageWaitForSelector(page, '#name', {
                visible: true,
                timeout: init.timeout,
            });
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
            await init.pageClick(page, 'input[id=Startup_month]');
            await Promise.all([
                init.pageClick(page, 'button[type=submit]'),
                page.waitForNavigation(),
            ]);
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

    test(
        'Should switch project using project switcher',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await init.pageWaitForSelector(page, '#AccountSwitcherId', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#AccountSwitcherId');
            await init.pageWaitForSelector(page, '#accountSwitcher', {
                visible: true,
                timeout: init.timeout,
            });

            const element = await page.$(
                '#accountSwitcher > div[title="Unnamed Project"]'
            );

            await element.click();
            await page.waitForNavigation();
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
