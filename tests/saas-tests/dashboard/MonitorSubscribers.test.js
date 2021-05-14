const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');
const csvFile = `${__dirname}/MOCKS/subscribers.csv`;
const emptyFile = `${__dirname}/MOCKS/emptyTemplateFile.csv`;
const existingSubscribers = `${__dirname}/MOCKS/existing.csv`;

require('should');
let browser, page;
// user credentials
const email = utils.generateRandomBusinessEmail();
const password = '1234567890';
const monitorName = utils.generateRandomString();
const componentName = utils.generateRandomString();

describe('Monitor Detail API', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async () => {
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);

        // Register user
        const user = {
            email,
            password,
        };
        // user
        await init.registerUser(user, page);
        await init.addMonitorToComponent(componentName, monitorName, page);
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'Should navigate to monitor details and create new subscriber from a csv file',
        async done => {
            // Navigate to Monitor details
            await init.navigateToMonitorDetails(
                componentName,
                monitorName,
                page
            );

            // click on subscribers tab
            await init.pageWaitForSelector(page, '#react-tabs-2');
            await init.pageClick(page, '#react-tabs-2');

            const importFileSelector = '#importFromCsv';
            await init.pageWaitForSelector(page, importFileSelector);
            await init.pageClick(page, importFileSelector);

            await init.pageWaitForSelector(page, '#fileInput', {
                visible: true,
                timeout: init.timeout,
            });
            const input = await page.$('#fileInput');
            await input.uploadFile(csvFile);
            await input.evaluate(upload =>
                upload.dispatchEvent(new Event('change', { bubbles: true }))
            );
            await init.pageClick(page, '#importCsvButton');
            await init.pageWaitForSelector(page, '#importCsvButton', {
                hidden: true,
            });

            const createdSubscriberSelector = '.subscriber-list-item';

            await init.pageWaitForSelector(page, createdSubscriberSelector);
            const subscriberRows = await page.$$(createdSubscriberSelector);
            const countSubscribers = subscriberRows.length;
            expect(countSubscribers).toEqual(3);
            done();
        },
        operationTimeOut
    );

    test(
        'Should not create subscribers when an empty file is submitted',
        async done => {
            // Navigate to Monitor details
            await init.navigateToMonitorDetails(
                componentName,
                monitorName,
                page
            );
            // click on subscribers tab
            await init.pageWaitForSelector(page, '#react-tabs-2');
            await init.pageClick(page, '#react-tabs-2');
            const importFileSelector = '#importFromCsv';
            await init.pageWaitForSelector(page, importFileSelector);
            await init.pageClick(page, importFileSelector);

            await init.pageWaitForSelector(page, '#fileInput', {
                visible: true,
                timeout: init.timeout,
            });
            const input = await page.$('#fileInput');
            await input.uploadFile(emptyFile);
            await input.evaluate(upload =>
                upload.dispatchEvent(new Event('change', { bubbles: true }))
            );
            await init.pageClick(page, '#importCsvButton');
            let elementHandle;
            elementHandle = await init.pageWaitForSelector(page, 'span#errorMsg');
            elementHandle = await elementHandle.getProperty('innerText');
            elementHandle = await elementHandle.jsonValue();
            elementHandle.should.be.exactly('Empty files submitted');
            done();
        },
        operationTimeOut
    );

    test(
        'Should not subscribe if subscriber has already been subscribed to that monitor',
        async done => {
            // Navigate to Monitor details
            await init.navigateToMonitorDetails(
                componentName,
                monitorName,
                page
            );
            // click on subscribers tab
            await init.pageWaitForSelector(page, '#react-tabs-2');
            await init.pageClick(page, '#react-tabs-2');
            const importFileSelector = '#importFromCsv';
            await init.pageWaitForSelector(page, importFileSelector);
            await init.pageClick(page, importFileSelector);

            await init.pageWaitForSelector(page, '#fileInput', {
                visible: true,
                timeout: init.timeout,
            });
            const input = await page.$('#fileInput');
            await input.uploadFile(csvFile);
            await input.evaluate(upload =>
                upload.dispatchEvent(new Event('change', { bubbles: true }))
            );
            await init.pageClick(page, '#importCsvButton');
            await init.pageWaitForSelector(page, '#importCsvButton', {
                hidden: true,
            });
            const createdSubscriberSelector = '.subscriber-list-item';

            await init.pageWaitForSelector(page, createdSubscriberSelector);
            const subscriberRows = await page.$$(createdSubscriberSelector);
            const countSubscribers = subscriberRows.length;
            expect(countSubscribers).toEqual(3);
            done();
        },
        operationTimeOut
    );

    test(
        'Should ignore exisiting subscribers and only add new ones',
        async done => {
            // Navigate to Monitor details
            await init.navigateToMonitorDetails(
                componentName,
                monitorName,
                page
            );
            // click on subscribers tab
            await init.pageWaitForSelector(page, '#react-tabs-2');
            await init.pageClick(page, '#react-tabs-2');
            const importFileSelector = '#importFromCsv';
            await init.pageWaitForSelector(page, importFileSelector);
            await init.pageClick(page, importFileSelector);

            await init.pageWaitForSelector(page, '#fileInput', {
                visible: true,
                timeout: init.timeout,
            });
            const input = await page.$('#fileInput');
            await input.uploadFile(existingSubscribers);
            await input.evaluate(upload =>
                upload.dispatchEvent(new Event('change', { bubbles: true }))
            );
            await init.pageClick(page, '#importCsvButton');
            await init.pageWaitForSelector(page, '#importCsvButton', {
                hidden: true,
            });
            const createdSubscriberSelector = '.subscriber-list-item';

            await init.pageWaitForSelector(page, createdSubscriberSelector);
            const subscriberRows = await page.$$(createdSubscriberSelector);
            const countSubscribers = subscriberRows.length;
            expect(countSubscribers).toEqual(4);
            done();
        },
        operationTimeOut
    );

    test(
        'Should delete a subscriber',
        async done => {
            // Navigate to Monitor details
            await init.navigateToMonitorDetails(
                componentName,
                monitorName,
                page
            );
            // click on subscribers tab
            await init.pageWaitForSelector(page, '#react-tabs-2');
            await init.pageClick(page, '#react-tabs-2');

            let initialSubscribers = '.subscriber-list-item';

            await init.pageWaitForSelector(page, initialSubscribers);
            initialSubscribers = await page.$$(initialSubscribers);
            const initialCount = initialSubscribers.length;

            await init.pageWaitForSelector(page, 'button[id=deleteSubscriber_0]');
            await init.pageClick(page, 'button[id=deleteSubscriber_0]');
            await init.pageWaitForSelector(page, '#deleteSubscriber');
            await init.pageClick(page, '#deleteSubscriber');
            await init.pageWaitForSelector(page, '#deleteSubscriber', {
                hidden: true,
            });
            await init.pageWaitForSelector(page, '#subscribersList');

            let finalSubscribers = '.subscriber-list-item';

            await init.pageWaitForSelector(page, finalSubscribers);
            finalSubscribers = await page.$$(finalSubscribers);
            const finalCount = finalSubscribers.length;

            expect(finalCount).toEqual(3);
            expect(initialCount).toBeGreaterThan(finalCount);
            done();
        },
        operationTimeOut
    );

    test(
        'Should not delete a subscriber when the cancel button is clicked',
        async done => {
            // Navigate to Monitor details
            await init.navigateToMonitorDetails(
                componentName,
                monitorName,
                page
            );
            // click on subscribers tab
            await init.pageWaitForSelector(page, '#react-tabs-2');
            await init.pageClick(page, '#react-tabs-2');

            let initialSubscribers = '.subscriber-list-item';

            await init.pageWaitForSelector(page, initialSubscribers);
            initialSubscribers = await page.$$(initialSubscribers);
            const initialCount = initialSubscribers.length;

            await init.pageWaitForSelector(page, 'button[id=deleteSubscriber_0]');
            await init.pageClick(page, 'button[id=deleteSubscriber_0]');
            await init.pageWaitForSelector(page, '#cancelDeleteSubscriber');
            await init.pageClick(page, '#cancelDeleteSubscriber');
            await init.pageWaitForSelector(page, '#subscribersList');

            let finalSubscribers = '.subscriber-list-item';

            await init.pageWaitForSelector(page, finalSubscribers);
            finalSubscribers = await page.$$(finalSubscribers);
            const finalCount = finalSubscribers.length;

            expect(finalCount).toEqual(3);
            expect(initialCount).toEqual(finalCount);
            done();
        },
        operationTimeOut
    );
});
