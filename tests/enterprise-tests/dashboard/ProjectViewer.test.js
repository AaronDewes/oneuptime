const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');

// user credentials
const email = utils.generateRandomBusinessEmail();
const password = '1234567890';
const subProjectName = utils.generateRandomString();
const newProjectName = utils.generateRandomString();
const statusPageName = utils.generateRandomString();
const projectViewer = {
    email: utils.generateRandomBusinessEmail(),
    password: '1234567890',
};
const user = {
    email,
    password,
};
const role = 'Viewer';

let browser, page;
describe('Sub-Project API', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async done => {
        jest.setTimeout(init.timeout);
        jest.retryTimes(3);
        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);
        // user
        await init.registerEnterpriseUser(user, page);
        await init.createUserFromAdminDashboard(projectViewer, page);
        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'should create a new sub-project',
        async done => {
            // await page.goto(utils.DASHBOARD_URL, {
            //     waitUntil: 'networkidle2',
            // });
            //Growth Plan is needed for a subproject
            await init.growthPlanUpgrade(page);
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle2',
            });

            await init.renameProject(newProjectName, page);
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle2',
            });
            await init.pageWaitForSelector(page, '#projectSettings', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#projectSettings');

            await init.pageWaitForSelector(page, '#btn_Add_SubProjects', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#btn_Add_SubProjects');
            await init.pageWaitForSelector(page, '#title', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageType(page, '#title', subProjectName);
            await init.pageClick(page, '#btnAddSubProjects');
            await init.pageWaitForSelector(page, '#title', { hidden: true });
            const subProjectSelector = await init.pageWaitForSelector(
                page,
                `#sub_project_name_${subProjectName}`,
                { visible: true, timeout: init.timeout }
            );

            expect(
                await (
                    await subProjectSelector.getProperty('textContent')
                ).jsonValue()
            ).toEqual(subProjectName);
            done();
        },
        operationTimeOut
    );

    test('should invite viewer to a subproject', async done => {
        await page.goto(utils.DASHBOARD_URL, {
            waitUntil: 'networkidle2',
        });
        await init.pageWaitForSelector(page, '#teamMembers', {
            visible: true,
            timeout: init.timeout,
        });
        await init.pageClick(page, '#teamMembers');
        let prevMemberCount = await init.page$Eval(
            page,
            `#count_${subProjectName}`,
            elem => elem.textContent
        );
        prevMemberCount = Number(prevMemberCount.split(' ')[0]);
        await init.pageWaitForSelector(
            page,
            `button[id=btn_${subProjectName}]`,
            {
                visible: true,
            }
        );
        await init.pageClick(page, `button[id=btn_${subProjectName}]`);
        await init.pageWaitForSelector(page, `#frm_${subProjectName}`, {
            visible: true,
            timeout: init.timeout,
        });
        await init.pageType(page, 'input[name=emails]', email);
        await init.pageClick(page, `#${role}_${subProjectName}`);
        await init.pageWaitForSelector(page, `#btn_modal_${subProjectName}`, {
            visible: true,
        });
        await init.pageClick(page, `#btn_modal_${subProjectName}`);
        await init.pageWaitForSelector(page, `#btn_modal_${subProjectName}`, {
            hidden: true,
        });
        await init.pageWaitForSelector(page, `#count_${subProjectName}`, {
            visible: true,
        });
        let memberCount = await init.page$Eval(
            page,
            `#count_${subProjectName}`,
            elem => elem.textContent
        );
        memberCount = Number(memberCount.split(' ')[0]);
        expect(memberCount).toEqual(prevMemberCount + 1);
        done();
    });

    test('should invite viewer to a project', async done => {
        await page.goto(utils.DASHBOARD_URL, {
            waitUntil: 'networkidle2',
        });
        await init.pageWaitForSelector(page, '#teamMembers', {
            visible: true,
            timeout: init.timeout,
        });
        await init.pageClick(page, '#teamMembers');
        await init.pageWaitForSelector(page, `#count_${newProjectName}`, {
            visible: true,
        });
        let prevMemberCount = await init.page$Eval(
            page,
            `#count_${newProjectName}`,
            elem => elem.textContent
        );
        prevMemberCount = Number(prevMemberCount.split(' ')[0]);

        await init.pageWaitForSelector(
            page,
            `button[id=btn_${newProjectName}]`,
            {
                visible: true,
            }
        );
        await init.pageClick(page, `button[id=btn_${newProjectName}]`);
        await init.pageWaitForSelector(page, `#frm_${newProjectName}`, {
            visible: true,
            timeout: init.timeout,
        });
        await init.pageType(page, 'input[name=emails]', projectViewer.email);
        await init.pageClick(page, `#${role}_${newProjectName}`);
        await init.pageWaitForSelector(page, `#btn_modal_${newProjectName}`, {
            visible: true,
        });
        await init.pageClick(page, `#btn_modal_${newProjectName}`);
        const elem = await page.$('button[id=btnConfirmInvite]');
        elem.click();
        await init.pageWaitForSelector(page, `#btn_modal_${newProjectName}`, {
            hidden: true,
        });
        await init.pageWaitForSelector(page, `#count_${newProjectName}`, {
            visible: true,
        });
        let memberCount = await init.page$Eval(
            page,
            `#count_${newProjectName}`,
            elem => elem.textContent
        );
        memberCount = Number(memberCount.split(' ')[0]);
        expect(memberCount).toEqual(prevMemberCount + 1);
        done();
    });

    test('should create a status page', async done => {
        await page.goto(utils.DASHBOARD_URL, {
            waitUntil: 'networkidle2',
        });
        await init.pageWaitForSelector(page, '#statusPages', {
            visible: true,
            timeout: init.timeout,
        });
        await init.pageClick(page, '#statusPages');
        await init.pageWaitForSelector(
            page,
            `#status_page_count_${newProjectName}`,
            {
                visible: true,
            }
        );
        let oldStatusPageCounter = await init.page$Eval(
            page,
            `#status_page_count_${newProjectName}`,
            elem => elem.textContent
        );
        oldStatusPageCounter = Number(oldStatusPageCounter.split(' ')[0]);
        await init.addStatusPageToProject(statusPageName, newProjectName, page);
        await init.pageWaitForSelector(
            page,
            `#status_page_count_${newProjectName}`,
            {
                visible: true,
            }
        );
        let statusPageCounter = await init.page$Eval(
            page,
            `#status_page_count_${newProjectName}`,
            elem => elem.textContent
        );
        statusPageCounter = Number(statusPageCounter.split(' ')[0]);
        expect(statusPageCounter).toEqual(oldStatusPageCounter + 1);
        done();
    });

    test(
        'should display subproject status pages to a subproject viewer',
        async done => {
            // Login as viewer
            await init.logout(page);
            await init.loginUser({ email, password }, page);
            await init.pageWaitForSelector(page, '#AccountSwitcherId', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#AccountSwitcherId');
            await init.pageWaitForSelector(page, '#accountSwitcher', {
                visible: true,
                timeout: init.timeout,
            });
            const element = await page.$(
                `#accountSwitcher > div[title=${newProjectName}]`
            );
            element.click();
            await init.pageWaitForSelector(page, '#statusPageTable_0', {
                visible: true,
                timeout: init.timeout,
            });
            const projectStatusPages = await page.$('#statusPageTable');
            expect(projectStatusPages).toEqual(null);

            const subProjectStatusPages = await page.$('#statusPageTable_0');
            expect(subProjectStatusPages).not.toEqual(null);
            done();
        },
        operationTimeOut
    );

    test(
        'should display project and subproject status pages to project viewers',
        async done => {
            await init.logout(page);
            await init.loginUser(projectViewer, page);
            await init.pageWaitForSelector(page, '#AccountSwitcherId', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#AccountSwitcherId');
            await init.pageWaitForSelector(page, '#accountSwitcher', {
                visible: true,
                timeout: init.timeout,
            });
            const element = await page.$(
                `#accountSwitcher > div[title=${newProjectName}]`
            );
            element.click();
            await init.pageWaitForSelector(page, '#statusPageTable_0', {
                visible: true,
                timeout: init.timeout,
            });
            const projectStatusPages = await page.$('#statusPageTable');
            expect(projectStatusPages).not.toEqual(null);

            const subProjectStatusPages = await page.$('#statusPageTable_0');
            expect(subProjectStatusPages).not.toEqual(null);
            done();
        },
        operationTimeOut
    );

    test('should redirect viewer to external status page', async done => {
        await init.logout(page);
        await init.loginUser(projectViewer, page);
        await init.pageWaitForSelector(page, '#AccountSwitcherId', {
            visible: true,
            timeout: init.timeout,
        });
        await init.pageClick(page, '#AccountSwitcherId');
        await init.pageWaitForSelector(page, '#accountSwitcher', {
            visible: true,
            timeout: init.timeout,
        });
        const element = await page.$(
            `#accountSwitcher > div[title=${newProjectName}]`
        );
        element.click();
        const rowItem = await init.pageWaitForSelector(
            page,
            '#statusPagesListContainer > tr',
            { visible: true, timeout: init.timeout }
        );
        rowItem.click();
        const statusPage = await page.$(`#cb${statusPageName}`);
        expect(statusPage).toEqual(null);
        done();
    });
});
