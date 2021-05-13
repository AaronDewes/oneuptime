const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');

require('should');
let browser, page;
// user credentials
const email = utils.generateRandomBusinessEmail();
const password = '1234567890';
const slaName = 'fxPro';
const monitorUptime = '99.90';
const component = 'sampleComponent';
const monitor = 'sampleMonitor';

describe('Monitor SLA', () => {
    const operationTimeOut = 500000;

    beforeAll(async done => {
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
        );

        const user = {
            email,
            password,
        };
        // user
        await init.registerUser(user, page);

        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'should not add a monitor SLA if no name was specified',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await page.waitForSelector('#projectSettings', {
                visible: true,
            });
            await init.pageClick(page, '#projectSettings');
            await page.waitForSelector('#more');
            await init.pageClick(page, '#more');
            await page.waitForSelector('#monitor', { visible: true });
            await init.pageClick(page, '#monitor');

            await page.waitForSelector('#addMonitorSlaBtn', {
                visible: true,
            });
            await init.pageClick(page, '#addMonitorSlaBtn');
            await page.waitForSelector('#monitorSlaForm', {
                visible: true,
            });
            await init.selectByText(
                '#monitorUptimeOption',
                monitorUptime,
                page
            );
            await page.$eval('#isDefault', elem => elem.click());
            await init.pageClick(page, '#createSlaBtn');

            const monitorSla = await page.waitForSelector(`#field-error`, {
                visible: true,
            });
            expect(monitorSla).toBeDefined();
            done();
        },
        operationTimeOut
    );

    test(
        'should not add a monitor SLA if monitor uptime was not specified',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await page.waitForSelector('#projectSettings', {
                visible: true,
            });
            await init.pageClick(page, '#projectSettings');
            await page.waitForSelector('#more');
            await init.pageClick(page, '#more');
            await page.waitForSelector('#monitor', { visible: true });
            await init.pageClick(page, '#monitor');

            await page.waitForSelector('#addMonitorSlaBtn', {
                visible: true,
            });
            await init.pageClick(page, '#addMonitorSlaBtn');
            await page.waitForSelector('#monitorSlaForm', {
                visible: true,
            });
            await init.pageClick(page, '#name');
            await init.pageType(page, '#name', slaName);
            await page.$eval('#isDefault', elem => elem.click());
            await init.pageClick(page, '#createSlaBtn');
            await page.waitForSelector('.ball-beat', { visible: true });
            await page.waitForSelector('.ball-beat', { hidden: true });

            const slaError = await page.waitForSelector(`#slaError`, {
                visible: true,
            });
            expect(slaError).toBeDefined();
            done();
        },
        operationTimeOut
    );

    test(
        'should not add a monitor SLA if monitor uptime is not a numeric value',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await page.waitForSelector('#projectSettings', {
                visible: true,
            });
            await init.pageClick(page, '#projectSettings');
            await page.waitForSelector('#more');
            await init.pageClick(page, '#more');
            await page.waitForSelector('#monitor', { visible: true });
            await init.pageClick(page, '#monitor');

            await page.waitForSelector('#addMonitorSlaBtn', {
                visible: true,
            });
            await init.pageClick(page, '#addMonitorSlaBtn');
            await page.waitForSelector('#monitorSlaForm', {
                visible: true,
            });
            await init.pageClick(page, '#name');
            await init.pageType(page, '#name', slaName);
            await init.selectByText('#monitorUptimeOption', 'custom', page);
            await page.waitForSelector('#customMonitorUptime');
            await init.pageClick(page, '#customMonitorUptime');
            await init.pageType(page, '#customMonitorUptime', '12uptime');
            await page.$eval('#isDefault', elem => elem.click());
            await init.pageClick(page, '#createSlaBtn');

            const uptimeError = await page.waitForSelector('#field-error', {
                visible: true,
            });
            expect(uptimeError).toBeDefined();
            done();
        },
        operationTimeOut
    );

    test(
        'should not add a monitor SLA if monitor uptime is greater than 100%',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await page.waitForSelector('#projectSettings', {
                visible: true,
            });
            await init.pageClick(page, '#projectSettings');
            await page.waitForSelector('#more');
            await init.pageClick(page, '#more');
            await page.waitForSelector('#monitor', { visible: true });
            await init.pageClick(page, '#monitor');

            await page.waitForSelector('#addMonitorSlaBtn', {
                visible: true,
            });
            await init.pageClick(page, '#addMonitorSlaBtn');
            await page.waitForSelector('#monitorSlaForm', {
                visible: true,
            });
            await init.pageClick(page, '#name');
            await init.pageType(page, '#name', slaName);
            await init.selectByText('#monitorUptimeOption', 'custom', page);
            await page.waitForSelector('#customMonitorUptime');
            await init.pageClick(page, '#customMonitorUptime');
            await init.pageType(page, '#customMonitorUptime', '120');
            await page.$eval('#isDefault', elem => elem.click());
            await init.pageClick(page, '#createSlaBtn');

            const uptimeError = await page.waitForSelector('#field-error', {
                visible: true,
            });
            expect(uptimeError).toBeDefined();
            done();
        },
        operationTimeOut
    );

    test(
        'should not add a monitor SLA if monitor uptime is less than 1%',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await page.waitForSelector('#projectSettings', {
                visible: true,
            });
            await init.pageClick(page, '#projectSettings');
            await page.waitForSelector('#more');
            await init.pageClick(page, '#more');
            await page.waitForSelector('#monitor', { visible: true });
            await init.pageClick(page, '#monitor');

            await page.waitForSelector('#addMonitorSlaBtn', {
                visible: true,
            });
            await init.pageClick(page, '#addMonitorSlaBtn');
            await page.waitForSelector('#monitorSlaForm', {
                visible: true,
            });
            await init.pageClick(page, '#name');
            await init.pageType(page, '#name', slaName);
            await init.selectByText('#monitorUptimeOption', 'custom', page);
            await page.waitForSelector('#customMonitorUptime');
            await init.pageClick(page, '#customMonitorUptime');
            await init.pageType(page, '#customMonitorUptime', '0');
            await page.$eval('#isDefault', elem => elem.click());
            await init.pageClick(page, '#createSlaBtn');

            const uptimeError = await page.waitForSelector('#field-error', {
                visible: true,
            });
            expect(uptimeError).toBeDefined();
            done();
        },
        operationTimeOut
    );

    test(
        'should not add a monitor SLA if frequency is not a numeric value',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await page.waitForSelector('#projectSettings', {
                visible: true,
            });
            await init.pageClick(page, '#projectSettings');
            await page.waitForSelector('#more');
            await init.pageClick(page, '#more');
            await page.waitForSelector('#monitor', { visible: true });
            await init.pageClick(page, '#monitor');

            await page.waitForSelector('#addMonitorSlaBtn', {
                visible: true,
            });
            await init.pageClick(page, '#addMonitorSlaBtn');
            await page.waitForSelector('#monitorSlaForm', {
                visible: true,
            });
            await init.pageClick(page, '#name');
            await init.pageType(page, '#name', slaName);
            await init.selectByText('#frequencyOption', 'custom', page);
            await page.waitForSelector('#customFrequency');
            await init.pageClick(page, '#customFrequency');
            await init.pageType(page, '#customFrequency', '12days');
            await page.$eval('#isDefault', elem => elem.click());
            await init.pageClick(page, '#createSlaBtn');

            const frequencyError = await page.waitForSelector('#field-error', {
                visible: true,
            });
            expect(frequencyError).toBeDefined();
            done();
        },
        operationTimeOut
    );

    test(
        'should add a monitor SLA',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await page.waitForSelector('#projectSettings', {
                visible: true,
            });
            await init.pageClick(page, '#projectSettings');
            await page.waitForSelector('#more');
            await init.pageClick(page, '#more');
            await page.waitForSelector('#monitor', { visible: true });
            await init.pageClick(page, '#monitor');

            await page.waitForSelector('#addMonitorSlaBtn', {
                visible: true,
            });
            await init.pageClick(page, '#addMonitorSlaBtn');
            await page.waitForSelector('#monitorSlaForm', {
                visible: true,
            });
            await init.pageClick(page, '#name');
            await init.pageType(page, '#name', slaName);
            await init.selectByText(
                '#monitorUptimeOption',
                monitorUptime,
                page
            );
            await init.pageClick(page, '#createSlaBtn');
            await page.waitForSelector('.ball-beat', { visible: true });
            await page.waitForSelector('.ball-beat', { hidden: true });

            const monitorSla = await page.waitForSelector(
                `#monitorSla_${slaName}`,
                { visible: true }
            );
            expect(monitorSla).toBeDefined();
            done();
        },
        operationTimeOut
    );

    test(
        'should update a monitor SLA',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await page.waitForSelector('#projectSettings', {
                visible: true,
            });
            await init.pageClick(page, '#projectSettings');
            await page.waitForSelector('#more');
            await init.pageClick(page, '#more');
            await page.waitForSelector('#monitor', { visible: true });
            await init.pageClick(page, '#monitor');

            await page.waitForSelector('#editMonitorSlaBtn_0', {
                visible: true,
            });
            await init.pageClick(page, '#editMonitorSlaBtn_0');
            await page.waitForSelector('#monitorSlaForm', {
                visible: true,
            });
            await page.$eval('#isDefault', elem => elem.click()); // set isDefault to false
            await init.pageClick(page, '#editSlaBtn');
            await page.waitForSelector('.ball-beat', { visible: true });
            await page.waitForSelector('.ball-beat', { hidden: true });

            const setDefaultBtn = await page.waitForSelector(
                `#defaultMonitorSlaBtn_0`,
                { hidden: true }
            );
            expect(setDefaultBtn).toBeDefined();
            done();
        },
        operationTimeOut
    );

    test(
        'should show monitor SLA indicator in a created monitor',
        async done => {
            await init.addMonitorToComponent(component, monitor, page);
            const slaIndicator = await page.waitForSelector(
                `#noMonitorSlaBreached`,
                {
                    visible: true,
                }
            );
            expect(slaIndicator).toBeDefined();
            done();
        },
        operationTimeOut
    );

    test(
        'should show breached monitor SLA indicator when a monitor uptime is less than the specified uptime in the SLA',
        async done => {
            await init.addIncident(monitor, 'offline', page);
            await init.navigateToMonitorDetails(component, monitor, page);

            const breachedIndicator = await page.waitForSelector(
                '#monitorSlaBreached',
                { visible: true }
            );
            expect(breachedIndicator).toBeDefined();
            done();
        },
        operationTimeOut
    );

    test(
        'should delete a monitor SLA',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await page.waitForSelector('#projectSettings', {
                visible: true,
            });
            await init.pageClick(page, '#projectSettings');
            await page.waitForSelector('#more');
            await init.pageClick(page, '#more');
            await page.waitForSelector('#monitor', { visible: true });
            await init.pageClick(page, '#monitor');

            await page.waitForSelector('#deleteMonitorSlaBtn_0', {
                visible: true,
            });
            await init.pageClick(page, '#deleteMonitorSlaBtn_0');
            await page.waitForSelector('#DeleteMonitorSlaBtn');
            await init.pageClick(page, '#DeleteMonitorSlaBtn');
            await page.waitForSelector('.ball-beat', { visible: true });
            await page.waitForSelector('.ball-beat', { hidden: true });

            const monitorSla = await page.waitForSelector(
                `#monitorSla_${slaName}`,
                { hidden: true }
            );
            expect(monitorSla).toBeNull();
            done();
        },
        operationTimeOut
    );
});
