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
const member = {
    email: utils.generateRandomBusinessEmail(),
    password: '1234567890',
};

describe('API test', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async done => {
        jest.setTimeout(init.timeout);
        

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);

        // Register user
        await init.registerUser(user, page);        

        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'Should render the API page',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle2',
            });

            await init.pageWaitForSelector(page, '#projectSettings', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#projectSettings');
            await init.pageWaitForSelector(page, '#api', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#api a');
            let elementHandle = await init.page$(page, '#boxTitle', {
                visible: true,
                timeout: init.timeout,
            });
            elementHandle = await elementHandle.getProperty('innerText');
            elementHandle = await elementHandle.jsonValue();
            elementHandle.should.be.exactly('API Documentation');

            done();
        },
        operationTimeOut
    ); 
    
    test(
        'Should display the API key when clicked',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle2',
            });

            await init.pageWaitForSelector(page, '#projectSettings', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#projectSettings');
            await init.pageWaitForSelector(page, '#api', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#api a');
            let label = await init.page$(page, '#apiKey', {
                visible: true,
                timeout: init.timeout,
            });
            label = await label.getProperty('innerText');
            label = await label.jsonValue();

            await init.pageClick(page, '#apiKey');
            let newLabel = await init.page$(page, '#apiKey', {
                visible: true,
                timeout: init.timeout,
            });
            newLabel = await newLabel.getProperty('innerText');
            newLabel = await newLabel.jsonValue();
            expect(label).not.toEqual(newLabel);

            done();
        },
        operationTimeOut
    );

    test(
        'Should reset the API Key',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle2',
            });

            await init.pageWaitForSelector(page, '#projectSettings', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#projectSettings');
            await init.pageWaitForSelector(page, '#api', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#api a');

            await init.pageClick(page, '#apiKey');
            let oldApiKey = await init.page$(page, '#apiKey', {
                visible: true,
                timeout: init.timeout,
            });
            oldApiKey = await oldApiKey.getProperty('innerText');
            oldApiKey = await oldApiKey.jsonValue();

            await init.pageClick(page, 'button[id=resetApiKey]', {
                delay: 100,
            });
            await init.pageWaitForSelector(page, 'button[id=resetApiKeySave]', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, 'button[id=resetApiKeySave]');
            await init.pageWaitForSelector(page, 'button[id=resetApiKeySave]', {
                hidden: true,
            });

            let newApiKey = await init.page$(page, '#apiKey', {
                visible: true,
                timeout: init.timeout,
            });
            newApiKey = await newApiKey.getProperty('innerText');
            newApiKey = await newApiKey.jsonValue();

            expect(oldApiKey).not.toEqual(newApiKey);

            done();
        },
        operationTimeOut
    );

    test(
        'Should not access API settings if user is a member on a project',
        async done => {
            const projectName = 'Project1';
            const role = 'Member';

            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle2',
            });
            // Rename project
            await init.pageWaitForSelector(page, '#projectSettings', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#projectSettings');
            await init.pageWaitForSelector(page, 'input[name=project_name]', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, 'input[name=project_name]', {clickCount : 3});
            await init.pageType(page, 'input[name=project_name]', projectName);
            await init.pageWaitForSelector(
                page,
                'button[id=btnCreateProject]',
                {
                    visible: true,
                    timeout: init.timeout,
                }
            );
            await init.pageClick(page, 'button[id=btnCreateProject]');

            // Invite member on the project
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await init.pageWaitForSelector(page, '#teamMembers', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#teamMembers');
            await init.pageWaitForSelector(page, `#btn_${projectName}`, {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, `#btn_${projectName}`);
            await init.pageWaitForSelector(page, 'input[name=emails]', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, 'input[name=emails]');
            await init.pageType(page, 'input[name=emails]', member.email);
            await init.pageWaitForSelector(page, `#${role}_${projectName}`, {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, `#${role}_${projectName}`);
            await init.pageWaitForSelector(page, 'button[type=submit]', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, 'button[type=submit]');
            await init.pageWaitForSelector(page, 'button[type=submit]', {
                hidden: true,
            });
            await init.saasLogout(page);

            // Login as member
            //await init.loginUser(member, page);
            await init.registerAndLoggingTeamMember(member, page);
            
            await init.pageWaitForSelector(page, '#projectSettings', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#projectSettings');
            await init.pageWaitForSelector(page, '#api', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#api a');
            let elementHandle = await init.pageWaitForSelector(page, '#fyipeApi', {
                visible: true,
                timeout: init.timeout,
            });
            expect(elementHandle).toBeDefined();

            // This confirms that team member is logged in and could not change Project API
            elementHandle = await init.pageWaitForSelector(page, '#errorMessage', {
                visible: true,
                timeout: init.timeout,
            });
            expect(elementHandle).toBeDefined();
            done();
        },
        operationTimeOut
    );
});
