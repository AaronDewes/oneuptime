const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');

let browser, page;
require('should');

// user credentials
const email = 'masteradmin@hackerbay.io';
const password = '1234567890';

const smtpName = 'Hackerbay';
const wrongPassword = utils.generateRandomString();

describe('SMTP Settings API', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async () => {
        jest.setTimeout(init.timeout);
        jest.retryTimes(3);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);

        const user = {
            email: email,
            password: password,
        };
        // user
        // await init.registerEnterpriseUser(user, page);
        await init.loginAdminUser(user, page);
    });

    afterAll(async () => {
        await browser.close();
    });

    test(
        'Should not submit empty fields',
        async done => {
            await page.goto(utils.ADMIN_DASHBOARD_URL);
            await init.pageWaitForSelector(page, '#settings');
            await init.pageClick(page, '#settings a');

            await init.pageWaitForSelector(page, '#smtp');
            await init.pageClick(page, '#smtp a');

            await init.pageWaitForSelector(page, '#smtp-form');
            await init.pageClick(page, '#email-enabled');
            await init.pageClick(page, '#customSmtp');

            const originalValues = await init.page$$Eval(page, 'input', e =>
                e.map(field => field.value)
            );
            await init.pageClick(page, 'input[name=email]');
            await init.pageType(page, 'input[name=email]', '');
            await init.pageClick(page, 'input[name=password]');
            await init.pageType(page, 'input[name=password]', '');
            await init.pageClick(page, 'input[name=smtp-server]');
            await init.pageType(page, 'input[name=smtp-server]', '');
            await init.pageClick(page, 'input[name=smtp-port]');
            await init.pageType(page, 'input[name=smtp-port]', '');
            await init.pageClick(page, 'input[name=from]');
            await init.pageType(page, 'input[name=from]', '');
            await init.pageClick(page, 'input[name=from-name]');
            await init.pageType(page, 'input[name=from-name]', '');
            await init.pageClick(page, 'button[type=submit]');

            // All fields should validate false
            expect((await page.$$('span.field-error')).length).toEqual(
                (await page.$$('input')).length -
                    4 /** There 10 input values and 6 span-errors */
            );

            //Since we did not save the settings, reloading the page automatically removes the input values

            // All fields should remain as were
            expect(
                await init.page$$Eval(page, 'input', e =>
                    e.map(field => field.value)
                )
            ).toEqual(originalValues);
            done();
        },
        operationTimeOut
    );

    test(
        'Should save valid form data',
        async done => {
            await page.goto(utils.ADMIN_DASHBOARD_URL);
            await init.pageWaitForSelector(page, '#settings');
            await init.pageClick(page, '#settings');

            await init.pageWaitForSelector(page, '#smtp');
            await init.pageClick(page, '#smtp a');
            await init.pageWaitForSelector(page, '#smtp-form');
            await init.pageClick(page, '#email-enabled');
            await init.pageClick(page, '#customSmtp');

            await init.pageClick(page, 'input[name=email]');
            await init.pageType(
                page,
                'input[name=email]',
                utils.smtpCredential.user
            );
            await init.pageClick(page, 'input[name=password]');
            await init.pageType(
                page,
                'input[name=password]',
                utils.smtpCredential.pass
            );
            await init.pageClick(page, 'input[name=smtp-server]');
            await init.pageType(
                page,
                'input[name=smtp-server]',
                utils.smtpCredential.host
            );
            await init.pageClick(page, 'input[name=smtp-port]');
            await init.pageType(
                page,
                'input[name=smtp-port]',
                utils.smtpCredential.port
            );
            await init.pageClick(page, 'input[name=from]');
            await init.pageType(
                page,
                'input[name=from]',
                utils.smtpCredential.from
            );
            await init.pageClick(page, 'input[name=from-name]');
            await init.pageType(page, 'input[name=from-name]', smtpName);
            await init.page$Eval(page, '#smtp-secure', element =>
                element.click()
            );
            await init.pageClick(page, 'button[type=submit]');

            await page.reload();

            const value = await init.page$Eval(
                page,
                'input[name=email]',
                e => e.value
            );

            expect(value).toEqual(utils.smtpCredential.user);
            done();
        },
        operationTimeOut
    );

    test(
        'Should open a test success modal with valid smtp settings',
        async done => {
            await page.goto(utils.ADMIN_DASHBOARD_URL);
            await init.pageWaitForSelector(page, '#settings');
            await init.pageClick(page, '#settings');

            await init.pageWaitForSelector(page, '#smtp');
            await init.pageClick(page, '#smtp a');
            await init.pageWaitForSelector(page, '#smtp-form');

            await init.pageClick(page, '#testSmtpSettingsButton');
            await init.pageWaitForSelector(page, 'input[name=test-email]');
            await init.pageType(page, 'input[name=test-email]', email);
            await init.pageClick(page, '#customSmtpBtn');
            await init.pageClick(page, '#confirmSmtpTest');

            await init.pageWaitForSelector(page, '#test-result');
            let elem = await page.$('#test-result');
            elem = await elem.getProperty('innerText');
            elem = await elem.jsonValue();

            expect(elem).toEqual('Test Email Sent');
            done();
        },
        operationTimeOut
    );

    test(
        'Should open a test failed modal with invalid smtp settings',
        async done => {
            await page.goto(utils.ADMIN_DASHBOARD_URL);
            await init.pageWaitForSelector(page, '#settings');
            await init.pageClick(page, '#settings');

            await init.pageWaitForSelector(page, '#smtp');
            await init.pageClick(page, '#smtp a');
            await init.pageWaitForSelector(page, '#smtp-form');

            await init.pageClick(page, 'input[name=password]');
            await init.pageType(page, 'input[name=password]', wrongPassword);

            await init.pageClick(page, '#testSmtpSettingsButton');
            await init.pageWaitForSelector(page, 'input[name=test-email]');
            await init.pageType(page, 'input[name=test-email]', email);
            await init.pageClick(page, '#customSmtpBtn');
            await init.pageClick(page, '#confirmSmtpTest');

            await init.pageWaitForSelector(page, '#test-result');
            let elem = await page.$('#test-result');
            elem = await elem.getProperty('innerText');
            elem = await elem.jsonValue();

            expect(elem).toEqual('Test Failed');
            done();
        },
        operationTimeOut
    );
});
