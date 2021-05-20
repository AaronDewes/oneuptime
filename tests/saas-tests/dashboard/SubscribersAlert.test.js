const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');

require('should');

let browser, page;
// user credentials
const email = utils.generateRandomBusinessEmail();
const password = '1234567890';
const componentName = utils.generateRandomString();
const monitorName = utils.generateRandomString();
const countryCode = '+1';
const phoneNumber = '9173976235';
const subscriberEmail = utils.generateRandomBusinessEmail();

describe('Subscribers Alert logs API', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async () => {
        jest.setTimeout(init.timeout);
        jest.retryTimes(3);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);

        const user = {
            email,
            password,
        };
        await init.registerUser(user, page);

        await init.addSmtpSettings(
            utils.smtpCredential.user,
            utils.smtpCredential.pass,
            utils.smtpCredential.host,
            utils.smtpCredential.port,
            utils.smtpCredential.from,
            utils.smtpCredential.secure,
            page
        );
        await init.addTwilioSettings(
            true,
            utils.twilioCredentials.accountSid,
            utils.twilioCredentials.authToken,
            utils.twilioCredentials.phoneNumber,
            page
        );
        await init.addMonitorToComponent(componentName, monitorName, page);
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'Should add SMS subscribers.',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle0',
            });
            await init.navigateToMonitorDetails(
                componentName,
                monitorName,
                page
            );
            await init.gotoTab(utils.monitorTabIndexes.SUBSCRIBERS, page);
            await init.pageWaitForSelector(page, '#addSubscriberButton');
            await init.pageClick(page, '#addSubscriberButton');
            await init.pageWaitForSelector(page, '#alertViaId');
            await init.selectDropdownValue('#alertViaId', 'sms', page);
            await init.pageWaitForSelector(page, '#countryCodeId');
            await init.selectDropdownValue('#countryCodeId', countryCode, page);
            await init.pageType(page, '#contactPhoneId', phoneNumber);
            await init.pageClick(page, '#createSubscriber');
            await init.pageWaitForSelector(page, '#createSubscriber', {
                hidden: true,
            });
            const subscriberPhoneNumberSelector =
                '#subscribersList tbody tr:first-of-type td:nth-of-type(4)';
            await init.pageWaitForSelector(page, subscriberPhoneNumberSelector);
            const subscriberPhoneNumber = await init.page$Eval(
                page,
                subscriberPhoneNumberSelector,
                e => e.textContent
            );
            expect(subscriberPhoneNumber).toEqual(
                `${countryCode}${phoneNumber}`
            );
            done();
        },
        operationTimeOut
    );

    test(
        'Should add Email subscribers.',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle0',
            });
            await init.navigateToMonitorDetails(
                componentName,
                monitorName,
                page
            );
            await init.gotoTab(utils.monitorTabIndexes.SUBSCRIBERS, page);
            await init.pageWaitForSelector(page, '#addSubscriberButton');
            await init.pageClick(page, '#addSubscriberButton');
            await init.pageWaitForSelector(page, '#alertViaId');
            await init.selectDropdownValue('#alertViaId', 'email', page);
            await init.pageWaitForSelector(page, '#emailId');
            await init.pageType(page, '#emailId', subscriberEmail);
            await init.pageClick(page, '#createSubscriber');
            await init.pageWaitForSelector(page, '#createSubscriber', {
                hidden: true,
            });
            await page.reload({ waitUntil: 'networkidle0' });
            await init.gotoTab(utils.monitorTabIndexes.SUBSCRIBERS, page);
            const subscriberEmailSelector =
                '#subscribersList tbody tr:first-of-type td:nth-of-type(4)';
            await init.pageWaitForSelector(page, subscriberEmailSelector);
            const renderedSubscriberEmail = await init.page$Eval(
                page,
                subscriberEmailSelector,
                e => e.textContent
            );
            expect(renderedSubscriberEmail).toEqual(subscriberEmail);
            done();
        },
        operationTimeOut
    );

    test(
        'Should send SMS and Email when an incident is created.',
        async done => {
            await init.navigateToMonitorDetails(
                componentName,
                monitorName,
                page
            );

            await init.pageWaitForSelector(
                page,
                `#monitorCreateIncident_${monitorName}`
            );
            await init.pageClick(page, `#monitorCreateIncident_${monitorName}`);
            await init.pageWaitForSelector(page, '#incidentType');
            await init.selectDropdownValue('#incidentType', 'offline', page);
            await init.pageClick(page, '#createIncident');
            await init.pageWaitForSelector(page, `#incident_${monitorName}_0`);
            await init.pageWaitForSelector(page, '#notificationscroll');
            await init.pageClick(page, '#viewIncident-0');
            await init.pageWaitForSelector(page, '#incident_0');

            await page.reload({ waitUntil: 'networkidle0' });
            await init.gotoTab(utils.incidentTabIndexes.ALERT_LOGS, page);
            await init.pageWaitForSelector(
                page,
                '#subscriberAlertTable tbody tr'
            );
            const rowsCount = (await init.page$$(page, '#subscriberAlertTable tbody tr'))
                .length;
            expect(rowsCount).toEqual(2);

            const firstRowIdentifier =
                '#subscriberAlertTable tbody tr:nth-of-type(1)';
            await init.pageClick(page, firstRowIdentifier);
            await init.pageWaitForSelector(
                page,
                '#backboneModals .bs-Modal-content'
            );

            const subscriber = await init.page$Eval(
                page,
                '#backboneModals #subscriber',
                e => e.textContent
            );
            const via = await init.page$Eval(
                page,
                '#backboneModals #alertVia',
                e => e.textContent
            );
            const type = await init.page$Eval(
                page,
                '#backboneModals #eventType',
                e => e.textContent
            );
            const alertStatus = await init.page$Eval(
                page,
                '#backboneModals #alertStatus',
                e => e.textContent
            );

            expect([subscriberEmail, `${countryCode}${phoneNumber}`]).toContain(
                subscriber
            );

            expect(['sms', 'email']).toContain(via);
            expect(type).toEqual('identified');
            expect(alertStatus).toEqual('Sent');

            await init.pageClick(page, '#backboneModals #closeBtn');
            await init.pageWaitForSelector(
                page,
                '#backboneModals .bs-Modal-content',
                {
                    hidden: true,
                }
            );

            const secondRowIdentifier =
                '#subscriberAlertTable tbody tr:nth-of-type(2)';
            await init.pageClick(page, secondRowIdentifier);
            await init.pageWaitForSelector(
                page,
                '#backboneModals .bs-Modal-content'
            );

            const subscriber1 = await init.page$Eval(
                page,
                '#backboneModals #subscriber',
                e => e.textContent
            );
            const via1 = await init.page$Eval(
                page,
                '#backboneModals #alertVia',
                e => e.textContent
            );
            const type1 = await init.page$Eval(
                page,
                '#backboneModals #eventType',
                e => e.textContent
            );
            const alertStatus1 = await init.page$Eval(
                page,
                '#backboneModals #alertStatus',
                e => e.textContent
            );

            expect([subscriberEmail, `${countryCode}${phoneNumber}`]).toContain(
                subscriber1
            );
            expect(['sms', 'email']).toContain(via1);
            expect(type1).toEqual('identified');
            expect(alertStatus1).toEqual('Sent');
            done();
        },
        operationTimeOut
    );
});
