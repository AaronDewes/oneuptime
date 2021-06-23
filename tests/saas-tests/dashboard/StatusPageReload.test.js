const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');

let browser, page;
const user = {
    email: utils.generateRandomBusinessEmail(),
    password: '1234567890',
};
const componentName = utils.generateRandomString();
const monitorName = utils.generateRandomString();
const statusPageName = utils.generateRandomString();
const projectName = utils.generateRandomString();

/** This is a test to check:
 * No errors on page reload
 * It stays on the same page on reload
 */

describe('Fyipe Page Reload', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async done => {
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);

        await init.registerUser(user, page); // This automatically routes to dashboard page
        await init.renameProject(projectName, page);
        await init.addStatusPageToProject(statusPageName, projectName, page);
        await init.addComponent(componentName, page);
        await init.addNewMonitorToComponent(page, componentName, monitorName);
        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'Should reload the status-page and confirm there are no errors',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await init.pageWaitForSelector(page, '#statusPages', {
                visible: true,
                timeout: init.timeout,
            });
            await init.page$Eval(page, '#statusPages', e => e.click());
            const rowItem = await init.pageWaitForSelector(
                page,
                '#statusPagesListContainer > tr',
                { visible: true, timeout: init.timeout }
            );
            rowItem.click();

            await init.pageWaitForSelector(page, '#addMoreMonitors', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#addMoreMonitors');
            await init.pageWaitForSelector(page, '#monitor-0', {
                visible: true,
                timeout: init.timeout,
            });
            await init.selectDropdownValue(
                '#monitor-0 .db-select-nw',
                `${componentName} / ${monitorName}`,
                page
            );
            await init.pageClick(page, '#btnAddStatusPageMonitors');

            // To confirm no errors and stays on the same page on reload
            await page.reload({ waitUntil: 'networkidle2' });
            await init.pageWaitForSelector(page, '#cbStatusPages', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageWaitForSelector(page, `#cb${statusPageName}`, {
                visible: true,
                timeout: init.timeout,
            });
            const elem = await init.pageWaitForSelector(page, '#monitor-0', {
                visible: true,
                timeout: init.timeout,
            });
            expect(elem).toBeDefined();

            done();
        },
        operationTimeOut
    );
});
