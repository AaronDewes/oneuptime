const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');

let browser, page;
const user = {
    email: utils.generateRandomBusinessEmail(),
    password: '1234567890',
};

const monitorSlaName = utils.generateRandomString();
const componentName = utils.generateRandomString();
const monitorName = utils.generateRandomString();

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

        await init.registerUser(user, page); // This automatically routes to dashboard page
        await init.addComponent(componentName, page);
        await init.addNewMonitorToComponent(page, componentName, monitorName);
        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'Should reload the monitor sla page and confirm there are no errors',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await init.pageClick(page, '#projectSettings');
            await init.pageClick(page, '#more');
            await init.pageClick(page, '#monitor');
            await init.pageClick(page, '#addMonitorSlaBtn');
            await init.pageType(page, '#name', monitorSlaName);
            await init.pageClick(page, '#addMoreMonitor');
            await init.selectByText(
                '#monitorfield_0',
                `${componentName} / ${monitorName}`,
                page
            );
            await init.selectByText('#frequencyOption', 'Every 3 months', page);
            await init.selectByText('#monitorUptimeOption', '99.90%', page);
            await init.pageClick(page, '#createSlaBtn');
            await init.pageWaitForSelector(page, '#createSlaBtn', { hidden: true });
            await init.pageWaitForSelector(page, `#monitorSla_${monitorSlaName}`, {
                visible: true,
                timeout: init.timeout,
            });
            //To confirm no errors and stays on the same page on reload
            await page.reload({ waitUntil: 'networkidle2' });
            await init.pageWaitForSelector(page, '#cbMonitors', {
                visible: true,
                timeout: init.timeout,
            });
            const spanElement = await init.pageWaitForSelector(page, 
                `#monitorSla_${monitorSlaName}`,
                { visible: true, timeout: init.timeout }
            );
            expect(spanElement).toBeDefined();
            done();
        },
        operationTimeOut
    );
});
