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
const incidentFieldText = {
        fieldName: 'textField',
        fieldType: 'text',
    },
    incidentFieldNumber = {
        fieldName: 'numField',
        fieldType: 'number',
    };

describe('Incident Custom Field', () => {
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
        'should configure incident custom field in a project',
        async done => {
            await init.addCustomField(page, incidentFieldText, 'incident');

            const firstCustomField = await init.pageWaitForSelector(
                page,
                `#customfield_${incidentFieldText.fieldName}`,
                { visible: true, timeout: init.timeout }
            );
            expect(firstCustomField).toBeDefined();
            done();
        },
        operationTimeOut
    );

    test(
        'should update a incident custom field in a project',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await init.pageWaitForSelector(page, '#projectSettings', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#projectSettings');
            await init.pageWaitForSelector(page, '#more');
            await init.pageClick(page, '#more');
            await init.pageWaitForSelector(page, '#incidentSettings', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#incidentSettings');
            await page.reload({
                waitUntil: 'networkidle2',
            });
            await init.gotoTab(6, page);

            await init.pageWaitForSelector(page, '#editCustomField_0', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#editCustomField_0');
            await init.pageWaitForSelector(page, '#customFieldForm', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#fieldName', { clickCount: 3 });
            await init.pageType(
                page,
                '#fieldName',
                incidentFieldNumber.fieldName
            );
            await init.selectByText(
                '#fieldType',
                incidentFieldNumber.fieldType,
                page
            );
            await init.pageWaitForSelector(page, '#updateCustomField', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#updateCustomField');
            await init.pageWaitForSelector(page, '#updateCustomField', {
                hidden: true,
            });

            const updatedField = await init.pageWaitForSelector(
                page,
                `#customfield_${incidentFieldNumber.fieldName}`,
                { visible: true, timeout: init.timeout }
            );
            expect(updatedField).toBeDefined();
            done();
        },
        operationTimeOut
    );

    test(
        'should delete a incident custom field in a project',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await init.pageWaitForSelector(page, '#projectSettings', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#projectSettings');
            await init.pageWaitForSelector(page, '#more');
            await init.pageClick(page, '#more');
            await init.pageWaitForSelector(page, '#incidentSettings', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#incidentSettings');
            await page.reload({
                waitUntil: 'networkidle2',
            });
            await init.gotoTab(6, page);

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
