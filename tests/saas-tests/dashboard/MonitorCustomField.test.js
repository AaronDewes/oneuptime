const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');

require('should');
let browser, page;
// user credentials
const email = utils.generateRandomBusinessEmail();
const password = '1234567890';
const monitorFieldText = {
        fieldName: 'textField',
        fieldType: 'text',
    },
    monitorFieldNumber = {
        fieldName: 'numField',
        fieldType: 'number',
    };
const user = {
    email,
    password,
};

describe('Monitor Custom Field', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async done => {
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);
        // user
        await init.registerUser(user, page);

        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'should configure monitor custom field in a project',
        async done => {
            await init.addCustomField(page, monitorFieldText, 'monitor');

            const firstCustomField = await init.pageWaitForSelector(
                page,
                `#customfield_${monitorFieldText.fieldName}`,
                { visible: true, timeout: init.timeout }
            );
            expect(firstCustomField).toBeDefined();
            done();
        },
        operationTimeOut
    );

    test(
        'should update a monitor custom field in a project',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await init.pageWaitForSelector(page, '#projectSettings', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#projectSettings');
            await init.pageWaitForSelector(page, '#more', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#more');
            await init.pageWaitForSelector(page, '#monitor', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#monitor');
            await page.reload({
                waitUntil: 'networkidle2',
            });
            await init.gotoTab(2, page);

            await init.pageWaitForSelector(page, '#editCustomField_0', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#editCustomField_0');
            await init.pageWaitForSelector(page, '#customFieldForm', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#fieldName');
            await init.pageType(
                page,
                '#fieldName',
                monitorFieldNumber.fieldName
            );
            await init.selectByText(
                '#fieldType',
                monitorFieldNumber.fieldType,
                page
            );
            await init.pageClick(page, '#updateCustomField');
            await init.pageWaitForSelector(page, '#updateCustomField', {
                hidden: true,
            });

            const updatedField = await init.pageWaitForSelector(
                page,
                `#customfield_${monitorFieldNumber.fieldName}`,
                { visible: true, timeout: init.timeout }
            );
            expect(updatedField).toBeDefined();
            done();
        },
        operationTimeOut
    );

    test(
        'should delete a monitor custom field in a project',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await init.pageWaitForSelector(page, '#projectSettings', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#projectSettings');
            await init.pageWaitForSelector(page, '#more', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#more');
            await init.pageWaitForSelector(page, '#monitor', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#monitor');
            await page.reload({
                waitUntil: 'networkidle2',
            });
            await init.gotoTab(2, page);

            await init.pageWaitForSelector(page, '#deleteCustomField_0', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#deleteCustomField_0');
            await init.pageWaitForSelector(page, '#deleteCustomFieldModalBtn', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#deleteCustomFieldModalBtn');
            await init.pageWaitForSelector(page, '#deleteCustomFieldModalBtn', {
                hidden: true,
            });

            const noCustomFields = await init.pageWaitForSelector(
                page,
                '#noCustomFields',
                { visible: true, timeout: init.timeout }
            );
            expect(noCustomFields).toBeDefined();
            done();
        },
        operationTimeOut
    );
});
