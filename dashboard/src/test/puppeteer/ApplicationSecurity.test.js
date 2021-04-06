const puppeteer = require('puppeteer');
const utils = require('./test-utils');
const init = require('./test-init');
const { Cluster } = require('puppeteer-cluster');

require('should');

// user credentials
const email = utils.generateRandomBusinessEmail();
const password = '1234567890';
const component = 'TestComponent';
const applicationSecurityName = 'Test';

describe('Application Security Page', () => {
    const operationTimeOut = 900000;

    let cluster;
    beforeAll(async done => {
        jest.setTimeout(operationTimeOut);

        cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_PAGE,
            puppeteerOptions: utils.puppeteerLaunchConfig,
            puppeteer,
            timeout: operationTimeOut,
        });

        cluster.on('error', err => {
            throw err;
        });

        await cluster.execute({ email, password }, async ({ page, data }) => {
            const user = {
                email: data.email,
                password: data.password,
            };
            // user
            await init.registerUser(user, page);           
            done();
        });
    });

    afterAll(async done => {
        await cluster.idle();
        await cluster.close();
        done();
    });

    test(
        'should create an application security with a resource category and ensure it redirects to the details page and has category attached',
        async done => {
            const gitUsername = utils.gitCredential.gitUsername;
            const gitPassword = utils.gitCredential.gitPassword;
            const gitRepositoryUrl = utils.gitCredential.gitRepositoryUrl;

            await cluster.execute(null, async ({ page }) => {
                await init.addComponent(component, page);

                const categoryName = 'Random-Category';
                // create a new resource category
                await init.addResourceCategory(categoryName, page);
                //navigate to component details
                await init.navigateToComponentDetails(component, page);

                await page.waitForSelector('#security', { visible: true });
                await page.click('#security');
                await page.waitForSelector('#application', { visible: true });
                await page.click('#application');

                await page.waitForSelector('#applicationSecurityForm', {
                    visible: true,
                });
                await page.click('#addCredentialBtn');
                await page.waitForSelector('#gitCredentialForm', {
                    visible: true,
                });
                await page.click('#gitUsername');
                await page.type('#gitUsername', gitUsername);
                await page.click('#gitPassword');
                await page.type('#gitPassword', gitPassword);
                await page.click('#addCredentialModalBtn');
                await page.waitForSelector('#gitCredentialForm', {
                    hidden: true,
                });

                await page.click('#name');
                await page.type('#name', applicationSecurityName);
                await init.selectByText(
                    '#resourceCategory',
                    categoryName,
                    page
                ); // add category
                await page.click('#gitRepositoryUrl');
                await page.type('#gitRepositoryUrl', gitRepositoryUrl);
                await page.click('#gitCredential');
                await page.type('#gitCredential', gitUsername); // select the created credential
                await page.keyboard.press('Enter'); // Enter Key
                await page.click('#addApplicationBtn');

                await page.waitForSelector('.ball-beat', { hidden: true });
                const applicationSecurity = await page.waitForSelector(
                    `#applicationSecurityHeader_${applicationSecurityName}`,
                    { visible: true }
                );
                expect(applicationSecurity).toBeDefined();

                // find the edit button which appears only on the details page
                const editApplicationElement = await page.waitForSelector(
                    `#edit_${applicationSecurityName}`
                );
                expect(editApplicationElement).toBeDefined();

                // confirm the category shows in the details page.
                let spanElement = await page.$(
                    `#${applicationSecurityName}-badge`
                );
                spanElement = await spanElement.getProperty('innerText');
                spanElement = await spanElement.jsonValue();
                spanElement.should.be.exactly(categoryName.toUpperCase());
            });
            done();
        },
        operationTimeOut
    );

    test(
        'should scan an application security',
        async done => {
            await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#components', { visible: true });
                await page.click('#components');

                await page.waitForSelector('#component0', { visible: true });
                await page.click(`#more-details-${component}`);
                await page.waitForSelector('#security', { visible: true });
                await page.click('#security');
                await page.waitForSelector('#application', { visible: true });
                await page.click('#application');
                await page.waitForSelector(
                    `#applicationSecurityHeader_${applicationSecurityName}`,
                    { visible: true }
                );

                await page.waitForSelector(
                    `#scanningApplicationSecurity_${applicationSecurityName}`,
                    { hidden: true, timeout: operationTimeOut }
                );
                await page.click(
                    `#moreApplicationSecurity_${applicationSecurityName}`
                );
                const issueCount = await page.waitForSelector('#issueCount', {
                    visible: true,
                });
                expect(issueCount).toBeDefined();
            });
            done();
        },
        operationTimeOut
    );

    test(
        'should view details of security log',
        async done => {
            await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#components', { visible: true });
                await page.click('#components');

                await page.waitForSelector('#component0', { visible: true });
                await page.click(`#more-details-${component}`);
                await page.waitForSelector('#security', { visible: true });
                await page.click('#security');
                await page.waitForSelector('#application', { visible: true });
                await page.click('#application');
                await page.waitForSelector(
                    `#applicationSecurityHeader_${applicationSecurityName}`,
                    { visible: true }
                );
                await page.click(
                    `#moreApplicationSecurity_${applicationSecurityName}`
                );
                const securityLog = await page.waitForSelector('#securityLog', {
                    visible: true,
                });

                expect(securityLog).toBeDefined();
            });
            done();
        },
        operationTimeOut
    );

    test(
        'should also view details of a security log, on clicking the issue count section',
        async done => {
            await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#components', { visible: true });
                await page.click('#components');

                await page.waitForSelector('#component0', { visible: true });
                await page.click(`#more-details-${component}`);
                await page.waitForSelector('#security', { visible: true });
                await page.click('#security');
                await page.waitForSelector('#application', { visible: true });
                await page.click('#application');
                await page.waitForSelector(
                    `#applicationSecurityHeader_${applicationSecurityName}`,
                    { visible: true }
                );
                await page.click('#issueCount');
                const securityLog = await page.waitForSelector('#securityLog', {
                    visible: true,
                });

                expect(securityLog).toBeDefined();
            });
            done();
        },
        operationTimeOut
    );

    test(
        'should display log(s) of an application security scan',
        async done => {
            await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#components', { visible: true });
                await page.click('#components');

                await page.waitForSelector('#component0', { visible: true });
                await page.click(`#more-details-${component}`);
                await page.waitForSelector('#security', { visible: true });
                await page.click('#security');
                await page.waitForSelector('#application', { visible: true });
                await page.click('#application');
                await page.waitForSelector(
                    `#applicationSecurityHeader_${applicationSecurityName}`,
                    { visible: true }
                );
                await page.click(
                    `#moreApplicationSecurity_${applicationSecurityName}`
                );

                await page.waitForSelector('#securityLog tbody', {
                    visible: true,
                });
                // make sure the added application security
                // has atleast one security vulnerability
                const logs = await page.$$('#securityLog tbody tr');
                expect(logs.length).toBeGreaterThanOrEqual(1);
            });
            done();
        },
        operationTimeOut
    );

    test(
        'should edit an application security',
        async done => {
            const newApplicationName = 'AnotherName';
            await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#components', { visible: true });
                await page.click('#components');

                await page.waitForSelector('#component0', { visible: true });
                await page.click(`#more-details-${component}`);
                await page.waitForSelector('#security', { visible: true });
                await page.click('#security');
                await page.waitForSelector('#application', { visible: true });
                await page.click('#application');
                await page.waitForSelector(
                    `#applicationSecurityHeader_${applicationSecurityName}`,
                    { visible: true }
                );
                await page.click(
                    `#moreApplicationSecurity_${applicationSecurityName}`
                );

                await page.waitForSelector(`#edit_${applicationSecurityName}`, {
                    visible: true,
                });
                await page.click(`#edit_${applicationSecurityName}`);
                await page.waitForSelector('#editApplicationSecurityForm', {
                    visible: true,
                });
                await page.click('#name', { clickCount: 3 });
                await page.type('#name', newApplicationName);
                await page.click('#editApplicationBtn');
                await page.waitForSelector('#editApplicationSecurityForm', {
                    hidden: true,
                });

                const textContent = await page.$eval(
                    `#applicationSecurityTitle_${newApplicationName}`,
                    elem => elem.textContent
                );
                expect(textContent).toEqual(newApplicationName);
            });
            done();
        },
        operationTimeOut
    );

    test(
        'should delete an application security',
        async done => {
            const newApplicationName = 'AnotherName';
            await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#components', { visible: true });
                await page.click('#components');

                await page.waitForSelector('#component0', { visible: true });
                await page.click(`#more-details-${component}`);
                await page.waitForSelector('#security', { visible: true });
                await page.click('#security');
                await page.waitForSelector('#application', { visible: true });
                await page.click('#application');
                await page.waitForSelector(
                    `#applicationSecurityHeader_${newApplicationName}`,
                    { visible: true }
                );
                await page.click(
                    `#moreApplicationSecurity_${newApplicationName}`
                );
                await page.waitForSelector('#deleteApplicationSecurityBtn', {
                    visible: true,
                });
                await page.click('#deleteApplicationSecurityBtn');
                await page.waitForSelector(
                    '#deleteApplicationSecurityModalBtn',
                    { visible: true }
                );
                await page.click('#deleteApplicationSecurityModalBtn');
                await page.waitForNavigation();

                const applicationSecurity = await page.waitForSelector(
                    `#applicationSecurityHeader_${newApplicationName}`,
                    { hidden: true }
                );
                expect(applicationSecurity).toBeNull();
            });
            done();
        },
        operationTimeOut
    );
});
