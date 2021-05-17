const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');

let browser, page;
// user credentials
const email = utils.generateRandomBusinessEmail();
const password = '1234567890';
const componentName = utils.generateRandomString();
const secondEmail = utils.generateRandomBusinessEmail();
const teamEmail = utils.generateRandomBusinessEmail();
const newProjectName = 'Test';
const resourceCategory = 'stat';
const user = {
    email,
    password,
};

describe('Resource Category', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async () => {
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);

        // Register user
        await init.registerUser(user, page);
        // Create Component first
        await init.addComponent(componentName, page);
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'should create a new resource category',
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

            await init.pageWaitForSelector(page, 'li#resources a', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, 'li#resources a');
            await init.pageWaitForSelector(
                page,
                '#createResourceCategoryButton',
                {
                    visible: true,
                    timeout: init.timeout,
                }
            );
            await init.pageClick(page, '#createResourceCategoryButton');
            await init.pageType(
                page,
                '#resourceCategoryName',
                utils.resourceCategoryName
            );
            await init.pageClick(page, '#addResourceCategoryButton');

            const createdResourceCategorySelector =
                '#resourceCategoryList #resource-category-name:nth-child(2)';

            await init.pageWaitForSelector(
                page,
                createdResourceCategorySelector,
                {
                    visible: true,
                    timeout: init.timeout,
                }
            );

            const createdResourceCategoryName = await page.$eval(
                createdResourceCategorySelector,
                el => el.textContent
            );

            expect(createdResourceCategoryName).toEqual(
                utils.resourceCategoryName
            );
            done();
        },
        operationTimeOut
    );

    test(
        'should show created resource category in new monitor dropdown',
        async done => {
            // Navigate to details page of component created
            await init.navigateToComponentDetails(componentName, page);
            await init.pageWaitForSelector(page, '#form-new-monitor', {
                visible: true,
                timeout: init.timeout,
            });

            let resourceCategoryCheck = false;

            await init.selectByText(
                '#resourceCategory',
                utils.resourceCategoryName,
                page
            );

            const noOption = await page.$('div.css-1gl4k7y');

            if (!noOption) {
                resourceCategoryCheck = true;
            }
            expect(resourceCategoryCheck).toEqual(true);
            done();
        },
        operationTimeOut
    );

    test(
        'should create a new monitor by selecting resource category from dropdown',
        async done => {
            // Navigate to details page of component created
            await init.navigateToComponentDetails(componentName, page);

            await init.pageWaitForSelector(page, '#form-new-monitor', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageWaitForSelector(page, 'input[id=name]', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, 'input[id=name]');
            await page.focus('input[id=name]');
            await init.pageType(page, 'input[id=name]', utils.monitorName);
            await init.selectByText(
                '#resourceCategory',
                utils.resourceCategoryName,
                page
            );
            await init.pageClick(page, '[data-testId=type_url]');
            await init.pageWaitForSelector(page, '#url', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#url');
            await init.pageType(page, '#url', 'https://google.com');
            await Promise.all([
                init.pageClick(page, 'button[type=submit]'),
                page.waitForNavigation(),
            ]);

            const createdMonitorSelector = `#monitor-title-${utils.monitorName}`;
            await init.pageWaitForSelector(page, createdMonitorSelector, {
                visible: true,
                timeout: operationTimeOut,
            });
            const createdMonitorName = await page.$eval(
                createdMonitorSelector,
                el => el.textContent
            );

            expect(createdMonitorName).toEqual(utils.monitorName);
            done();
        },
        operationTimeOut
    );

    test(
        'should delete the created resource category',
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

            await init.pageWaitForSelector(page, 'li#resources a', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, 'li#resources a');

            const deleteButtonSelector = `button#delete_${utils.resourceCategoryName}`;

            await init.pageWaitForSelector(page, deleteButtonSelector, {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, deleteButtonSelector);
            await init.pageWaitForSelector(page, '#deleteResourceCategory', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#deleteResourceCategory');
            await init.pageWaitForSelector(page, '#resourceCategoryCount', {
                visible: true,
                timeout: init.timeout,
            });

            const resourceCategoryCounterSelector = '#resourceCategoryCount';
            const resourceCategoryCount = await page.$eval(
                resourceCategoryCounterSelector,
                el => el.textContent
            );

            expect(resourceCategoryCount).toEqual('0 Resource Category');
            done();
        },
        operationTimeOut
    );
});

describe('Member Restriction', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async done => {
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);
        // user
        await init.registerUser({ email: secondEmail, password }, page);
        await init.renameProject(newProjectName, page);
        await page.goto(utils.DASHBOARD_URL, {
            waitUntil: ['networkidle2'],
        });
        await init.addUserToProject(
            {
                email: teamEmail,
                role: 'Member',
                subProjectName: newProjectName,
            },
            page
        );
        await init.addResourceCategory(resourceCategory, page);
        await init.logout(page);
        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'should show unauthorised modal when trying to add a resource category for a member who is not the admin or owner of the project',
        async done => {
            // A Subproject user has to register his/her mail before login in.
            await init.registerAndLoggingTeamMember(
                { email: teamEmail, password },
                page
            );
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle2',
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

            await init.pageWaitForSelector(page, '#resources', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#resources');
            await init.pageWaitForSelector(
                page,
                '#createResourceCategoryButton',
                {
                    visible: true,
                    timeout: init.timeout,
                }
            );
            await init.pageClick(page, '#createResourceCategoryButton');
            const modal = await init.pageWaitForSelector(
                page,
                '#unauthorisedModal',
                {
                    visible: true,
                    timeout: init.timeout,
                }
            );
            expect(modal).toBeDefined();
            done();
        },
        operationTimeOut
    );

    test(
        'should show unauthorised modal when trying to edit a resource category for a member who is not the admin or owner of the project',
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

            await init.pageWaitForSelector(page, '#resources', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#resources');
            const editBtn = `#edit_${resourceCategory}`;
            await init.pageWaitForSelector(page, editBtn, {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, editBtn);
            const modal = await init.pageWaitForSelector(
                page,
                '#unauthorisedModal',
                {
                    visible: true,
                    timeout: init.timeout,
                }
            );
            expect(modal).toBeDefined();
            done();
        },
        operationTimeOut
    );

    test(
        'should show unauthorised modal when trying to delete a resource category for a member who is not the admin or owner of the project',
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

            await init.pageWaitForSelector(page, '#resources', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#resources');
            const deleteBtn = `#delete_${resourceCategory}`;
            await init.pageWaitForSelector(page, deleteBtn, {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, deleteBtn);
            const modal = await init.pageWaitForSelector(
                page,
                '#unauthorisedModal',
                {
                    visible: true,
                    timeout: init.timeout,
                }
            );
            expect(modal).toBeDefined();
            done();
        },
        operationTimeOut
    );
});
