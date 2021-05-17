const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');
let browser, page;
require('should');

// user credentials
const email = utils.generateRandomBusinessEmail();
const password = '1234567890';
const { twilioCredentials } = { ...utils };

const projectName = 'project';
const componentName = 'component1';
const monitorName = 'monitor1';
const countryCode = '+1';
const phoneNumber = '9173976235';
const alertPhone = '+19173976123';
const incidentTitle = utils.generateRandomString();

describe('Custom Twilio Settings', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async done => {
        jest.setTimeout(360000);
        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);

        const user = {
            email: email,
            password: password,
        };
        // user
        await init.registerUser(user, page);
        await init.addProject(page, projectName);

        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'should create a custom twilio settings',
        async done => {
            await page.goto(utils.DASHBOARD_URL);
            await init.pageWaitForSelector(page, '#projectSettings', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#projectSettings');
            await init.pageWaitForSelector(page, '#more');
            await init.pageClick(page, '#more');
            await init.pageWaitForSelector(page, '#smsCalls');
            await init.pageClick(page, '#smsCalls');
            await init.pageWaitForSelector(page, '#enableTwilio', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#enableTwilio');
            await init.pageWaitForSelector(page, '#accountSid', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageType(
                page,
                '#accountSid',
                twilioCredentials.accountSid
            );
            await init.pageType(
                page,
                '#authToken',
                twilioCredentials.authToken
            );
            await init.pageType(
                page,
                '#phoneNumber',
                twilioCredentials.phoneNumber
            );
            await init.pageClick(page, '#submitTwilioSettings');
            await init.pageWaitForSelector(page, '.ball-beat', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageWaitForSelector(page, '.ball-beat', {
                hidden: true,
            });

            await page.reload({
                waitUntil: ['networkidle0', 'domcontentloaded'],
            });
            await init.pageWaitForSelector(page, '#accountSid', {
                visible: true,
                timeout: init.timeout,
            });
            const savedAccountSid = await page.$eval(
                '#accountSid',
                elem => elem.value
            );
            expect(savedAccountSid).toBe(twilioCredentials.accountSid);

            done();
        },
        operationTimeOut
    );

    test(
        'should send SMS to external subscribers if an incident is created.',
        async done => {
            await init.addMonitorToComponent(componentName, monitorName, page);
            await init.gotoTab(utils.monitorTabIndexes.SUBSCRIBERS, page);
            await init.pageWaitForSelector(page, '#addSubscriberButton');
            await init.pageClick(page, '#addSubscriberButton');
            await init.selectByText('#alertViaId', 'SMS', page);
            await init.pageWaitForSelector(page, '#countryCodeId');
            await init.selectByText('#countryCodeId', countryCode, page);
            await init.pageType(page, '#contactPhoneId', phoneNumber);
            await init.pageClick(page, '#createSubscriber');
            await init.pageWaitForSelector(page, '#createSubscriber', {
                hidden: true,
            });

            await init.gotoTab(utils.monitorTabIndexes.BASIC, page);
            await init.pageWaitForSelector(
                page,
                `#monitorCreateIncident_${monitorName}`
            );
            await init.pageClick(page, `#monitorCreateIncident_${monitorName}`);
            await init.pageWaitForSelector(page, '#createIncident');
            await init.selectByText('#incidentType', 'Offline', page);
            await init.pageType(page, 'input[name=title]', incidentTitle);
            await init.pageClick(page, '#createIncident');
            await init.pageWaitForSelector(page, '#createIncident', {
                hidden: true,
            });

            await init.pageWaitForSelector(page, '#closeIncident_0');
            await page.$eval('#closeIncident_0', elem => elem.click());
            await init.pageWaitForSelector(page, `#incident_${monitorName}_0`);
            await page.$eval(`#incident_${monitorName}_0`, elem =>
                elem.click()
            );
            await init.pageWaitForSelector(page, '#incident_0');

            await init.gotoTab(utils.incidentTabIndexes.ALERT_LOGS, page);
            await init.pageWaitForSelector(
                page,
                '#subscriberAlertTable > tbody > tr'
            );
            await page.$eval('#subscriberAlertTable > tbody > tr', elem =>
                elem.click()
            );
            await init.pageWaitForSelector(page, '#subscriber');
            const subscriber = await page.$eval(
                '#subscriber',
                elem => elem.textContent
            );
            expect(subscriber).toEqual(`${countryCode}${phoneNumber}`);

            done();
        },
        operationTimeOut
    );

    test(
        'should send SMS to external subscribers if an incident is acknowledged.',
        async done => {
            await page.goto(utils.DASHBOARD_URL);
            await init.navigateToMonitorDetails(
                componentName,
                monitorName,
                page
            );

            await init.pageWaitForSelector(page, `#incident_${monitorName}_0`);
            await page.$eval(`#incident_${monitorName}_0`, elem =>
                elem.click()
            );
            await init.pageWaitForSelector(page, '#btnAcknowledge_0');
            await page.$eval('#btnAcknowledge_0', e => e.click());
            await init.pageWaitForSelector(page, '#AcknowledgeText_0', {
                visible: true,
                timeout: init.timeout,
            });
            await page.reload({ waitUntil: 'networkidle0' });

            await init.gotoTab(utils.incidentTabIndexes.ALERT_LOGS, page);
            await init.pageWaitForSelector(
                page,
                '#subscriberAlertTable > tbody > tr'
            );
            // grab the last log
            await page.$eval('#subscriberAlertTable > tbody > tr', elem =>
                elem.click()
            );
            await init.pageWaitForSelector(page, '#eventType');
            const eventType = await page.$eval(
                '#eventType',
                elem => elem.textContent
            );
            expect(eventType).toEqual('acknowledged');

            done();
        },
        operationTimeOut
    );

    test(
        'should send SMS to external subscribers if an incident is resolved.',
        async done => {
            await page.goto(utils.DASHBOARD_URL);
            await init.navigateToMonitorDetails(
                componentName,
                monitorName,
                page
            );

            await init.pageWaitForSelector(page, `#incident_${monitorName}_0`);
            await page.$eval(`#incident_${monitorName}_0`, elem =>
                elem.click()
            );
            await init.pageWaitForSelector(page, '#btnResolve_0');
            await page.$eval('#btnResolve_0', e => e.click());
            await init.pageWaitForSelector(page, '#ResolveText_0', {
                visible: true,
                timeout: init.timeout,
            });
            await page.reload({ waitUntil: 'networkidle0' });

            await init.gotoTab(utils.incidentTabIndexes.ALERT_LOGS, page);
            await init.pageWaitForSelector(
                page,
                '#subscriberAlertTable > tbody > tr'
            );
            // grab the last log
            await page.$eval('#subscriberAlertTable > tbody > tr', elem =>
                elem.click()
            );
            await init.pageWaitForSelector(page, '#eventType');
            const eventType = await page.$eval(
                '#eventType',
                elem => elem.textContent
            );
            expect(eventType).toEqual('resolved');

            done();
        },
        operationTimeOut
    );

    test(
        'should render an error message if the user try to update his alert phone number without typing the right verification code.',
        async done => {
            await page.goto(utils.DASHBOARD_URL);
            await init.pageWaitForSelector(page, '#profile-menu');
            await init.pageClick(page, '#profile-menu');
            await init.pageWaitForSelector(page, '#userProfile');
            await init.pageClick(page, '#userProfile');
            await init.pageWaitForSelector(page, 'input[type=tel]');
            await init.pageType(page, 'input[type=tel]', phoneNumber);
            await init.pageClick(page, '#sendVerificationSMS');
            await init.pageWaitForSelector(page, '#otp');
            await init.pageType(page, '#otp', '654321');
            await init.pageClick(page, '#verify');
            await init.pageWaitForSelector(page, '#smsVerificationErrors');
            const message = await page.$eval(
                '#smsVerificationErrors',
                e => e.textContent
            );
            expect(message).toEqual('Invalid code !');

            done();
        },
        operationTimeOut
    );

    test(
        'should set the alert phone number if the user types the right verification code.',
        async done => {
            await page.goto(utils.DASHBOARD_URL);
            await init.pageWaitForSelector(page, '#profile-menu');
            await init.pageClick(page, '#profile-menu');
            await init.pageWaitForSelector(page, '#userProfile');
            await init.pageClick(page, '#userProfile');
            await init.pageWaitForSelector(page, 'input[type=tel]');
            await init.pageClick(page, 'input[type=tel]');
            await init.pageType(page, 'input[type=tel]', alertPhone);
            await init.pageWaitForSelector(page, '#sendVerificationSMS', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#sendVerificationSMS');
            await init.pageWaitForSelector(page, '#otp');
            await init.pageType(page, '#otp', '123456');
            await init.pageClick(page, '#verify');
            await init.pageWaitForSelector(page, '#successMessage', {
                visible: true,
                timeout: init.timeout,
            });
            const message = await page.$eval(
                '#successMessage',
                e => e.textContent
            );
            expect(message).toEqual(
                'Verification successful, this number has been updated.'
            );

            done();
        },
        operationTimeOut
    );

    test(
        'should update alert phone number if user types the right verification code.',
        async done => {
            await page.goto(utils.DASHBOARD_URL);
            await init.pageWaitForSelector(page, '#profile-menu');
            await init.pageClick(page, '#profile-menu');
            await init.pageWaitForSelector(page, '#userProfile');
            await init.pageClick(page, '#userProfile');

            await page.reload({ waitUntil: 'networkidle0' });
            await init.pageWaitForSelector(page, 'input[type=tel]');
            await init.pageClick(page, 'input[type=tel]');
            await page.keyboard.press('Backspace');
            await init.pageType(page, 'input[type=tel]', '1', {
                delay: 150,
            });
            await init.pageWaitForSelector(page, '#sendVerificationSMS', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#sendVerificationSMS');
            await init.pageWaitForSelector(page, '#otp');
            await init.pageType(page, '#otp', '123456');
            await init.pageClick(page, '#verify');
            await init.pageWaitForSelector(page, '#successMessage', {
                visible: true,
                timeout: init.timeout,
            });
            const message = await page.$eval(
                '#successMessage',
                e => e.textContent
            );
            expect(message).toEqual(
                'Verification successful, this number has been updated.'
            );

            done();
        },
        operationTimeOut
    );
});
