const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');

require('should');

// user credentials
let browser, page;
const user = {
    email: utils.generateRandomBusinessEmail(),
    password: '1234567890',
};

describe('Enterprise Component API', () => {
    const operationTimeOut = 100000;

    beforeAll(async done => {
        jest.setTimeout(600000);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
        );
        // Register user
        await init.registerEnterpriseUser(user, page);
        await init.adminLogout(page);
        await init.loginUser(user, page);
        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'Should create new component',
        async done => {
            const componentName = utils.generateRandomString();
            // Navigate to Components page
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle2',
            });
            await page.waitForSelector('#components', { timeout: 120000 });
            await init.pageClick(page, '#components');

            // Fill and submit New Component form
            await page.waitForSelector('#form-new-component');
            await page.waitForSelector('input[id=name]', { visible: true });
            await init.pageClick(page, 'input[id=name]');
            await page.focus('input[id=name]');
            await init.pageType(page, 'input[id=name]', componentName);
            await init.pageClick(page, 'button[type=submit]');
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle2',
            });
            await page.waitForSelector('#components', { visible: true });
            await init.pageClick(page, '#components');

            let spanElement;
            spanElement = await page.waitForSelector(
                `span#component-title-${componentName}`
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();
            spanElement.should.be.exactly(componentName);
            done();
        },
        operationTimeOut
    );
});
