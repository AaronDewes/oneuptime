const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');

let browser, page;
require('should');

// user credentials
const email = utils.generateRandomBusinessEmail();
const password = '1234567890';
const componentName = utils.generateRandomString();
const monitorName = utils.generateRandomString();

describe('Monitor API', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async () => {
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);

        const user = {
            email,
            password,
        };
        await init.registerUser(user, page);
        await init.addMonitorToComponent(componentName, monitorName, page); // This creates a default component and a monitor. The monitor created here will be used by other tests as required
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'should display lighthouse scores',
        async done => {
            // Navigate to Component details
            // This navigates to the monitor created alongside the created component
            await init.navigateToMonitorDetails(
                componentName,
                monitorName,
                page
            );

            await init.pageWaitForSelector(page, '#website_scanning');
            await init.pageWaitForSelector(page, '#website_postscan');

            await init.pageWaitForSelector(
                page,
                `#lighthouseLogs_${monitorName}_0`,
                {
                    visible: true,
                    timeout: operationTimeOut,
                }
            );

            let lighthousePerformanceElement = await init.pageWaitForSelector(
                page,
                `#lighthouse-performance-${monitorName}`,
                { visible: true, timeout: operationTimeOut }
            );
            lighthousePerformanceElement = await lighthousePerformanceElement.getProperty(
                'innerText'
            );
            lighthousePerformanceElement = await lighthousePerformanceElement.jsonValue();
            lighthousePerformanceElement.should.endWith('%');

            let lighthouseAccessibilityElement = await init.pageWaitForSelector(
                page,
                `#lighthouse-accessibility-${monitorName}`,
                { visible: true, timeout: operationTimeOut }
            );
            lighthouseAccessibilityElement = await lighthouseAccessibilityElement.getProperty(
                'innerText'
            );
            lighthouseAccessibilityElement = await lighthouseAccessibilityElement.jsonValue();
            lighthouseAccessibilityElement.should.endWith('%');

            let lighthouseBestPracticesElement = await init.pageWaitForSelector(
                page,
                `#lighthouse-bestPractices-${monitorName}`,
                { visible: true, timeout: operationTimeOut }
            );
            lighthouseBestPracticesElement = await lighthouseBestPracticesElement.getProperty(
                'innerText'
            );
            lighthouseBestPracticesElement = await lighthouseBestPracticesElement.jsonValue();
            lighthouseBestPracticesElement.should.endWith('%');

            let lighthouseSeoElement = await init.pageWaitForSelector(
                page,
                `#lighthouse-seo-${monitorName}`,
                { visible: true, timeout: operationTimeOut }
            );
            lighthouseSeoElement = await lighthouseSeoElement.getProperty(
                'innerText'
            );
            lighthouseSeoElement = await lighthouseSeoElement.jsonValue();
            lighthouseSeoElement.should.endWith('%');

            let lighthousePwaElement = await init.pageWaitForSelector(
                page,
                `#lighthouse-pwa-${monitorName}`,
                { visible: true, timeout: operationTimeOut }
            );
            lighthousePwaElement = await lighthousePwaElement.getProperty(
                'innerText'
            );
            lighthousePwaElement = await lighthousePwaElement.jsonValue();
            lighthousePwaElement.should.endWith('%');
            done();
        },
        operationTimeOut
    );

    test(
        'should display multiple probes and monitor chart on refresh',
        async done => {
            // Navigate to Component details
            // This navigates to the monitor created alongside the created component
            await init.navigateToMonitorDetails(
                componentName,
                monitorName,
                page
            );

            const probe0 = await init.pageWaitForSelector(page, '#probes-btn0');
            const probe1 = await init.pageWaitForSelector(page, '#probes-btn1');

            expect(probe0).toBeDefined();
            expect(probe1).toBeDefined();

            const monitorStatus = await init.pageWaitForSelector(
                page,
                `#monitor-status-${monitorName}`
            );
            const sslStatus = await init.pageWaitForSelector(
                page,
                `#ssl-status-${monitorName}`
            );

            expect(monitorStatus).toBeDefined();
            expect(sslStatus).toBeDefined();
            done();
        },
        operationTimeOut
    );
});
