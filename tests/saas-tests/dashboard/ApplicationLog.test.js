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
const applicationLogName = 'AppLogName'

describe('Log Containers', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async () => {
        jest.setTimeout(init.timeout);
        

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);

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
            await init.pageWaitForSelector(page, '#components', {
                timeout: 120000,
            });
            await init.pageClick(page, '#components');

            // Fill and submit New Component form
            await init.pageWaitForSelector(page, '#form-new-component');
            await init.pageWaitForSelector(page, 'input[id=name]', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, 'input[id=name]');
            await page.focus('input[id=name]');
            await init.pageType(page, 'input[id=name]', componentName);
            await init.pageClick(page, '#addComponentButton');
            await init.pageWaitForSelector(page, '#form-new-monitor', {
                visible: true,
                timeout: init.timeout,
            });
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await init.pageWaitForSelector(page, '#components', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#components');

            let spanElement = await init.pageWaitForSelector(
                page,
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
            await init.pageWaitForSelector(page, '#logs');
            await init.pageClick(page, '#logs');

            // Fill and submit New Application  log form
            await init.pageWaitForSelector(page, '#form-new-application-log');
            await init.pageWaitForSelector(page, 'input[id=name]', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, 'input[id=name]');
            await page.focus('input[id=name]');
            await init.pageType(page, 'input[id=name]', applicationLogName);
            await init.pageClick(page, 'button[type=submit]');

            let spanElement = await init.pageWaitForSelector(
                page,
                `span#application-log-title-${applicationLogName}`
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();
            spanElement.should.be.exactly(applicationLogName);

            // find the log api key button which appears only on the details page
            const logKeyElement = await init.pageWaitForSelector(
                page,
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
            const appLogName =  'NewAppLog';
            // create a new resource category
            await init.addResourceCategory(categoryName, page);
            //navigate to component details
            await init.navigateToComponentDetails(componentName, page);
            // go to logs
            await init.pageWaitForSelector(page, '#logs');
            await init.pageClick(page, '#logs');
            // create a new log and select the category
            // Fill and submit New Application  log form
            await init.pageWaitForSelector(page, '#form-new-application-log');
            await init.pageWaitForSelector(page, 'input[id=name]', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, 'input[id=name]');
            await page.focus('input[id=name]');
            await init.pageType(page, 'input[id=name]', appLogName);
            await init.selectDropdownValue(
                '#resourceCategory',
                categoryName,
                page
            );
            await init.pageClick(page, 'button[type=submit]');
            // confirm the category shows in the details page.
            await init.pageWaitForSelector(page, `#${appLogName}-badge`, {
                visible: true,
                timeout: init.timeout,
            });
            let spanElement = await init.pageWaitForSelector(page,`#${appLogName}-badge`);
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
            await init.pageWaitForSelector(page, '#logs');
            await init.pageClick(page, '#logs');

            // Fill and submit New Application  log form
            await init.pageWaitForSelector(page, '#form-new-application-log');
            await init.pageWaitForSelector(page, 'input[id=name]', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, 'input[id=name]');
            await page.focus('input[id=name]');
            await init.pageType(page, 'input[id=name]', '');
            await init.pageClick(page, 'button[type=submit]');

            await init.pageWaitForSelector(
                page,
                '#form-new-application-log span#field-error',
                { visible: true, timeout: init.timeout }
            );
            let spanElement = await init.page$(
                page,
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

            let spanElement = await init.pageWaitForSelector(
                page,
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
            const errorElement = await init.pageWaitForSelector(
                page,
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
            await init.pageWaitForSelector(
                page,
                `#filter_${applicationLogName}`
            );
            await init.pageClick(page, `#filter_${applicationLogName}`);

            // select the drop down and confirm the current value as all
            let logTypeElement = await init.pageWaitForSelector(     
                /** React-Select Library is used in the dashboard 
                 * This reminds puppeteer that the <input /> is hidden
                 * as init.pageWaitForSelector is 'visible : true' by default  */           
                page, 'input[name=log_type_selector]', { hidden : true }
            );
            logTypeElement = await logTypeElement.getProperty('value');

            logTypeElement = await logTypeElement.jsonValue();
            logTypeElement.should.be.exactly('');

            // click on the warning tab
            await init.pageWaitForSelector(
                page,
                `#${applicationLogName}-warning`
            );
            await init.pageClick(page, `#${applicationLogName}-warning`);

            // confim that thee drop down current value is warning
            logTypeElement = await init.pageWaitForSelector(
                page,
                'input[name=log_type_selector]', { hidden : true }
            );
            logTypeElement = await logTypeElement.getProperty('value');

            logTypeElement = await logTypeElement.jsonValue();
            logTypeElement.should.be.exactly('warning');

            // click on the info tab
            await init.pageWaitForSelector(page, `#${applicationLogName}-info`);
            await init.pageClick(page, `#${applicationLogName}-info`);

            // confim that thee drop down current value is info
            logTypeElement = await init.pageWaitForSelector(
                page,
                'input[name=log_type_selector]', { hidden : true }
            );
            logTypeElement = await logTypeElement.getProperty('value');

            logTypeElement = await logTypeElement.jsonValue();
            logTypeElement.should.be.exactly('info');

            // click on the error tab
            await init.pageWaitForSelector(
                page,
                `#${applicationLogName}-error`
            );
            await init.pageClick(page, `#${applicationLogName}-error`);

            // confim that thee drop down current value is error
            logTypeElement = await init.pageWaitForSelector(
                page,
                'input[name=log_type_selector]', { hidden : true }
            );
            logTypeElement = await logTypeElement.getProperty('value');

            logTypeElement = await logTypeElement.jsonValue();
            logTypeElement.should.be.exactly('error');

            // click on the all tab
            await init.pageWaitForSelector(page, `#${applicationLogName}-all`);
            await init.pageClick(page, `#${applicationLogName}-all`);

            // confim that thee drop down current value is all
            logTypeElement = await init.pageWaitForSelector(
                page,
                'input[name=log_type_selector]', { hidden : true }
            );
            logTypeElement = await logTypeElement.getProperty('value');

            logTypeElement = await logTypeElement.jsonValue();
            logTypeElement.should.be.exactly('');

            done();
        },
        operationTimeOut
    );
    
    /**Test Split */
});
