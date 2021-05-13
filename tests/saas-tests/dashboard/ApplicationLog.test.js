const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');

require('should');
let browser, page;
// user credentials
const user = {
    email: utils.generateRandomBusinessEmail(),
    password: '1234567890',
};
const componentName = utils.generateRandomString();
const applicationLogName = utils.generateRandomString();
let applicationLogKey = '';

describe('Log Containers', () => {
    const operationTimeOut = 900000;

    beforeAll(async () => {
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
        );

        await init.registerUser(user, page);
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'Should create new component',
        async done => {
            // Navigate to Components page
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle2',
            });
            await page.waitForSelector('#components', { timeout: 120000 });
            await init.pageClick(page, '#components');

            // Fill and submit New Component form
            await page.waitForSelector('#form-new-component');
            await page.waitForSelector('input[id=name]', { visible: true });
            await init.pageClick(page, 'input[id=name]');
            await page.focus('input[id=name]');
            await init.pageType(page, 'input[id=name]', componentName);
            await init.pageClick(page, '#addComponentButton');
            await page.waitForSelector('#form-new-monitor', {
                visible: true,
            });
            await page.goto(utils.DASHBOARD_URL, {
            waitUntil: ['networkidle2'],
        });
            await page.waitForSelector('#components', { visible: true });
            await init.pageClick(page, '#components');

            let spanElement = await page.waitForSelector(
                `span#component-title-${componentName}`
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();
            spanElement.should.be.exactly(componentName);

            done();
        },
        operationTimeOut
    );
    test(
        'Should create new log container and confirm that it redirects to the details page',
        async done => {
            // Navigate to Component details
            await init.navigateToComponentDetails(componentName, page);
            await page.waitForSelector('#logs');
            await init.pageClick(page, '#logs');

            // Fill and submit New Application  log form
            await page.waitForSelector('#form-new-application-log');
            await page.waitForSelector('input[id=name]', { visible: true });
            await init.pageClick(page, 'input[id=name]');
            await page.focus('input[id=name]');
            await init.pageType(page, 'input[id=name]', applicationLogName);
            await init.pageClick(page, 'button[type=submit]');
            //await page.goto(utils.DASHBOARD_URL, {
            waitUntil: ['networkidle2'],
        });

            let spanElement = await page.waitForSelector(
                `span#application-log-title-${applicationLogName}`
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();
            spanElement.should.be.exactly(applicationLogName);

            // find the log api key button which appears only on the details page
            const logKeyElement = await page.waitForSelector(
                `#key_${applicationLogName}`
            );
            expect(logKeyElement).toBeDefined();

            done();
        },
        operationTimeOut
    );
    test(
        'Should create new resource category then redirect to application log page to create a container under that',
        async done => {
            const categoryName = 'Random-Category';
            const appLogName = `${applicationLogName}-sample`;
            // create a new resource category
            await init.addResourceCategory(categoryName, page);
            //navigate to component details
            await init.navigateToComponentDetails(componentName, page);
            // go to logs
            await page.waitForSelector('#logs');
            await init.pageClick(page, '#logs');
            // create a new log and select the category
            // Fill and submit New Application  log form
            await page.waitForSelector('#form-new-application-log');
            await page.waitForSelector('input[id=name]', { visible: true });
            await init.pageClick(page, 'input[id=name]');
            await page.focus('input[id=name]');
            await init.pageType(page, 'input[id=name]', appLogName);
            await init.selectByText('#resourceCategory', categoryName, page);
            await init.pageClick(page, 'button[type=submit]');
            // confirm the category shows in the details page.
            await page.waitForSelector(`#${appLogName}-badge`, {
                visible: true,
            });
            let spanElement = await page.$(`#${appLogName}-badge`);
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();
            spanElement.should.be.exactly(categoryName.toUpperCase());

            done();
        },
        operationTimeOut
    );
    test(
        'Should not create new log container',
        async done => {
            // Navigate to Component details
            await init.navigateToComponentDetails(componentName, page);
            await page.waitForSelector('#logs');
            await init.pageClick(page, '#logs');

            // Fill and submit New Application  log form
            await page.waitForSelector('#form-new-application-log');
            await page.waitForSelector('input[id=name]', { visible: true });
            await init.pageClick(page, 'input[id=name]');
            await page.focus('input[id=name]');
            await init.pageType(page, 'input[id=name]', '');
            await init.pageClick(page, 'button[type=submit]');

            await page.waitForSelector(
                '#form-new-application-log span#field-error',
                { visible: true }
            );
            let spanElement = await page.$(
                '#form-new-application-log span#field-error'
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();
            spanElement.should.be.exactly('This field cannot be left blank');

            done();
        },
        operationTimeOut
    );
    test(
        'Should open details page of created log container',
        async done => {
            await init.navigateToApplicationLogDetails(
                componentName,
                applicationLogName,
                page
            );

            let spanElement = await page.waitForSelector(
                `#application-log-title-${applicationLogName}`
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();
            spanElement.should.be.exactly(applicationLogName);

            done();
        },
        operationTimeOut
    );
    test(
        'Should display warning for empty log container',
        async done => {
            // goto thee details page
            await init.navigateToApplicationLogDetails(
                componentName,
                applicationLogName,
                page
            );

            // get the error element, Expect it to be defined
            const errorElement = await page.waitForSelector(
                `#${applicationLogName}-no-log-warning`
            );
            expect(errorElement).toBeDefined();

            done();
        },
        operationTimeOut
    );
    test(
        'Should filter log container by selected log type',
        async done => {
            // goto thee details page
            await init.navigateToApplicationLogDetails(
                componentName,
                applicationLogName,
                page
            );

            // toggle the filter section
            await page.waitForSelector(`#filter_${applicationLogName}`);
            await init.pageClick(page, `#filter_${applicationLogName}`);

            // select the drop down and confirm the current value as all
            let logTypeElement = await page.waitForSelector(
                'input[name=log_type_selector]'
            );
            logTypeElement = await logTypeElement.getProperty('value');

            logTypeElement = await logTypeElement.jsonValue();
            logTypeElement.should.be.exactly('');

            // click on the warning tab
            await page.waitForSelector(`#${applicationLogName}-warning`);
            await init.pageClick(page, `#${applicationLogName}-warning`);

            
            // confim that thee drop down current value is warning
            logTypeElement = await page.waitForSelector(
                'input[name=log_type_selector]'
            );
            logTypeElement = await logTypeElement.getProperty('value');

            logTypeElement = await logTypeElement.jsonValue();
            logTypeElement.should.be.exactly('warning');

            // click on the info tab
            await page.waitForSelector(`#${applicationLogName}-info`);
            await init.pageClick(page, `#${applicationLogName}-info`);

            
            // confim that thee drop down current value is info
            logTypeElement = await page.waitForSelector(
                'input[name=log_type_selector]'
            );
            logTypeElement = await logTypeElement.getProperty('value');

            logTypeElement = await logTypeElement.jsonValue();
            logTypeElement.should.be.exactly('info');

            // click on the error tab
            await page.waitForSelector(`#${applicationLogName}-error`);
            await init.pageClick(page, `#${applicationLogName}-error`);

            
            // confim that thee drop down current value is error
            logTypeElement = await page.waitForSelector(
                'input[name=log_type_selector]'
            );
            logTypeElement = await logTypeElement.getProperty('value');

            logTypeElement = await logTypeElement.jsonValue();
            logTypeElement.should.be.exactly('error');

            // click on the all tab
            await page.waitForSelector(`#${applicationLogName}-all`);
            await init.pageClick(page, `#${applicationLogName}-all`);

            
            // confim that thee drop down current value is all
            logTypeElement = await page.waitForSelector(
                'input[name=log_type_selector]'
            );
            logTypeElement = await logTypeElement.getProperty('value');

            logTypeElement = await logTypeElement.jsonValue();
            logTypeElement.should.be.exactly('');

            done();
        },
        operationTimeOut
    );
    test(
        'Should open edit component for created log container',
        async done => {
            await init.navigateToApplicationLogDetails(
                componentName,
                applicationLogName,
                page
            );
            await page.waitForSelector(`#edit_${applicationLogName}`);
            await init.pageClick(page, `#edit_${applicationLogName}`);

            let spanElement = await page.waitForSelector(
                `#application-log-edit-title-${applicationLogName}`
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();
            spanElement.should.be.exactly(
                `Edit Log Container ${applicationLogName}`
            );

            done();
        },
        operationTimeOut
    );
    test(
        'Should open application key for created log container',
        async done => {
            await init.navigateToApplicationLogDetails(
                componentName,
                applicationLogName,
                page
            );
            // open modal
            await page.waitForSelector(`#key_${applicationLogName}`);
            await init.pageClick(page, `#key_${applicationLogName}`);

            // click show applicaion log key
            await page.waitForSelector(
                `#show_application_log_key_${applicationLogName}`
            );
            await init.pageClick(
                page,
                `#show_application_log_key_${applicationLogName}`
            );

            // get log container key
            let spanElement = await page.waitForSelector(
                `#application_log_key_${applicationLogName}`
            );
            spanElement = await spanElement.getProperty('innerText');
            applicationLogKey = await spanElement.jsonValue();
            expect(spanElement).toBeDefined();

            // click cancel
            await page.waitForSelector(
                `#cancel_application_log_key_${applicationLogName}`
            );
            await init.pageClick(
                page,
                `#cancel_application_log_key_${applicationLogName}`
            );

            done();
        },
        operationTimeOut
    );
    test(
        'Should open application key for created log container and hide it back',
        async done => {
            await init.navigateToApplicationLogDetails(
                componentName,
                applicationLogName,
                page
            );
            await page.waitForSelector(`#key_${applicationLogName}`);
            await init.pageClick(page, `#key_${applicationLogName}`);

            // click show applicaion log key
            await page.waitForSelector(
                `#show_application_log_key_${applicationLogName}`
            );
            await init.pageClick(
                page,
                `#show_application_log_key_${applicationLogName}`
            );
            let spanElement = await page.waitForSelector(
                `#application_log_key_${applicationLogName}`
            );
            expect(spanElement).toBeDefined();

            // find the eye icon to hide log container key
            await page.waitForSelector(
                `#hide_application_log_key_${applicationLogName}`
            );
            await init.pageClick(
                page,
                `#hide_application_log_key_${applicationLogName}`
            );

            spanElement = await page.waitForSelector(
                `#show_application_log_key_${applicationLogName}`
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();

            expect(spanElement).toEqual('Click here to reveal Log API key');

            done();
        },
        operationTimeOut
    );
    test(
        'Should reset application key for created log container',
        async done => {
            await init.navigateToApplicationLogDetails(
                componentName,
                applicationLogName,
                page
            );
            // open modal
            await page.waitForSelector(`#key_${applicationLogName}`);
            await init.pageClick(page, `#key_${applicationLogName}`);

            // click show applicaion log key
            await page.waitForSelector(
                `#show_application_log_key_${applicationLogName}`
            );
            await init.pageClick(
                page,
                `#show_application_log_key_${applicationLogName}`
            );

            // get log container key
            let spanElement = await page.waitForSelector(
                `#application_log_key_${applicationLogName}`
            );
            spanElement = await spanElement.getProperty('innerText');
            applicationLogKey = await spanElement.jsonValue();

            // click reset key
            await page.waitForSelector(
                `#reset_application_log_key_${applicationLogName}`
            );
            await init.pageClick(
                page,
                `#reset_application_log_key_${applicationLogName}`
            );

            // click confirm reset key
            await page.waitForSelector(
                `#confirm_reset_application_log_key_${applicationLogName}`
            );
            await init.pageClick(
                page,
                `#confirm_reset_application_log_key_${applicationLogName}`
            );
            await page.waitForSelector(
                `#confirm_reset_application_log_key_${applicationLogName}`,
                { hidden: true }
            );

            // open modal
            await page.waitForSelector(`#key_${applicationLogName}`);
            await init.pageClick(page, `#key_${applicationLogName}`);

            // click show applicaion log key
            await page.waitForSelector(
                `#show_application_log_key_${applicationLogName}`
            );
            await init.pageClick(
                page,
                `#show_application_log_key_${applicationLogName}`
            );

            // get log container key
            spanElement = await page.waitForSelector(
                `#application_log_key_${applicationLogName}`
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();

            expect(spanElement).toBeDefined();
            spanElement.should.not.be.equal(applicationLogKey);

            done();
        },
        operationTimeOut
    );
    test(
        'Should update name for created log container',
        async done => {
            await init.navigateToApplicationLogDetails(
                componentName,
                applicationLogName,
                page
            );
            await page.waitForSelector(`#edit_${applicationLogName}`);
            await init.pageClick(page, `#edit_${applicationLogName}`);
            // Fill and submit edit Application  log form
            await page.waitForSelector('#form-new-application-log');
            await page.focus('input[id=name]');
            await init.pageType(page, 'input[id=name]', '-new');
            await init.pageClick(page, 'button[type=submit]');
            await page.waitForSelector('#addApplicationLogButton', {
                hidden: true,
            });

            await page.waitForSelector('#logs');
            await init.pageClick(page, '#logs');
            let spanElement = await page.waitForSelector(
                `#application-log-title-${applicationLogName}-new`
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();
            spanElement.should.be.exactly(`${applicationLogName}-new`);

            done();
        },
        operationTimeOut
    );
    test(
        'Should update category for created log container',
        async done => {
            const categoryName = 'Another-Category';
            // create a new resource category
            await init.addResourceCategory(categoryName, page);

            await init.navigateToApplicationLogDetails(
                componentName,
                `${applicationLogName}-new`,
                page
            );
            await page.waitForSelector(`#edit_${applicationLogName}-new`);
            await init.pageClick(page, `#edit_${applicationLogName}-new`);
            // Fill and submit edit Application  log form
            await page.waitForSelector('#form-new-application-log');
            // change category here
            await init.selectByText('#resourceCategory', categoryName, page);
            await init.pageClick(page, 'button[type=submit]');
            await page.waitForSelector('#addApplicationLogButton', {
                hidden: true,
            });

            await page.waitForSelector(`#${applicationLogName}-new-badge`, {
                visible: true,
            });
            // confirm the new category shows in the details page.
            let spanElement = await page.$(`#${applicationLogName}-new-badge`);
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();
            spanElement.should.be.exactly(categoryName.toUpperCase());

            done();
        },
        operationTimeOut
    );
    test(
        'Should delete category for created log container and reflect',
        async done => {
            const categoryName = 'Another-Category';

            // confirm the application log has a category
            await init.navigateToApplicationLogDetails(
                componentName,
                `${applicationLogName}-new`,
                page
            );

            let spanElement = await page.$(`#${applicationLogName}-new-badge`);
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();
            spanElement.should.be.exactly(categoryName.toUpperCase());

            // delete the category
            await page.goto(utils.DASHBOARD_URL, {
            waitUntil: ['networkidle2'],
        });
            await page.waitForSelector('#projectSettings');
            await init.pageClick(page, '#projectSettings');
            await page.waitForSelector('#more');
            await init.pageClick(page, '#more');

            await page.waitForSelector('li#resources a');
            await init.pageClick(page, 'li#resources a');

            await page.waitForSelector(`#delete_${categoryName}`);
            await init.pageClick(page, `#delete_${categoryName}`);
            await page.waitForSelector('#deleteResourceCategory');
            await init.pageClick(page, '#deleteResourceCategory');
            await page.waitForTimeout(5000);

            // go back to log details and confirm it is not there anymore
            const spanElementBadge = await page.$(
                `#${applicationLogName}-new-badge`,
                { hidden: true }
            );
            expect(spanElementBadge).toBeNull();

            done();
        },
        operationTimeOut
    );
});
