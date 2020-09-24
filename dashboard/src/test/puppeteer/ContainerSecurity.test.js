const puppeteer = require('puppeteer');
const utils = require('./test-utils');
const init = require('./test-init');
const { Cluster } = require('puppeteer-cluster');

require('should');

// user credentials
const email = utils.generateRandomBusinessEmail();
const password = '1234567890';
const component = 'TestComponent';
const containerSecurityName = 'Test';
const newContainerSecurityName = 'Byter';

describe('Container Security Page', () => {
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
            await init.loginUser(user, page);
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
            const dockerRegistryUrl = utils.dockerCredential.dockerRegistryUrl;
            const dockerUsername = utils.dockerCredential.dockerUsername;
            const dockerPassword = utils.dockerCredential.dockerPassword;
            const imagePath = utils.dockerCredential.imagePath;
            const imageTags = utils.dockerCredential.imageTags || '';
            await cluster.execute(null, async ({ page }) => {
                await init.addComponent(component, page);

                const categoryName = 'Random-Category';
                // create a new resource category
                await init.addResourceCategory(categoryName, page);
                //navigate to component details
                await init.navigateToComponentDetails(component, page);

                await page.waitForSelector('#security', { visible: true });
                await page.click('#security');
                await page.waitForSelector('#container', {
                    visible: true,
                });
                await page.click('#container');

                await page.waitForSelector('#containerSecurityForm', {
                    visible: true,
                });
                await page.click('#addCredentialBtn');
                await page.waitForSelector('#dockerCredentialForm', {
                    visible: true,
                });
                await page.click('#dockerRegistryUrl');
                await page.type('#dockerRegistryUrl', dockerRegistryUrl);
                await page.click('#dockerUsername');
                await page.type('#dockerUsername', dockerUsername);
                await page.click('#dockerPassword');
                await page.type('#dockerPassword', dockerPassword);
                await page.click('#addCredentialModalBtn');
                await page.waitForSelector('#dockerCredentialForm', {
                    hidden: true,
                });

                await page.click('#name');
                await page.type('#name', containerSecurityName);
                await init.selectByText(
                    '#resourceCategoryId',
                    categoryName,
                    page
                ); // add category
                await page.click('#dockerCredential');
                await page.type('#dockerCredential', dockerUsername);
                await page.keyboard.press('Enter');
                await page.click('#imagePath');
                await page.type('#imagePath', imagePath);
                await page.click('#imageTags');
                await page.type('#imageTags', imageTags);
                await page.click('#addContainerBtn');

                await page.waitForSelector('.ball-beat', { hidden: true });
                const containerSecurity = await page.waitForSelector(
                    `#containerSecurityHeader_${containerSecurityName}`,
                    { visible: true }
                );
                expect(containerSecurity).toBeDefined();

                // find the edit button which appears only on the details page
                const editContainerElement = await page.waitForSelector(
                    `#edit_${containerSecurityName}`
                );
                expect(editContainerElement).toBeDefined();

                // confirm the category shows in the details page.
                let spanElement = await page.$(
                    `#${containerSecurityName}-badge`
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
        'should scan a container security',
        async done => {
            await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#components', { visible: true });
                await page.click('#components');

                await page.waitForSelector('#component0', { visible: true });
                await page.click(`#more-details-${component}`);
                await page.waitForSelector('#security', { visible: true });
                await page.click('#security');
                await page.waitForSelector('#container', { visible: true });
                await page.click('#container');
                await page.waitForSelector('#largeSpinner', { hidden: true });
                await page.waitForSelector(
                    `#scanningContainerSecurity_${containerSecurityName}`,
                    { hidden: true, timeout: operationTimeOut }
                );
                await page.click(
                    `#moreContainerSecurity_${containerSecurityName}`
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
        'should view details of the security log',
        async done => {
            await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#components', { visible: true });
                await page.click('#components');

                await page.waitForSelector('#component0', { visible: true });
                await page.click(`#more-details-${component}`);
                await page.waitForSelector('#security', { visible: true });
                await page.click('#security');
                await page.waitForSelector('#container', { visible: true });
                await page.click('#container');
                await page.waitForSelector('#largeSpinner', { hidden: true });
                await page.click(
                    `#moreContainerSecurity_${containerSecurityName}`
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
        'should also view details of the security log on clicking the issue count section',
        async done => {
            await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#components', { visible: true });
                await page.click('#components');

                await page.waitForSelector('#component0', { visible: true });
                await page.click(`#more-details-${component}`);
                await page.waitForSelector('#security', { visible: true });
                await page.click('#security');
                await page.waitForSelector('#container', { visible: true });
                await page.click('#container');
                await page.waitForSelector('#largeSpinner', { hidden: true });

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
        'should display log(s) of a container security scan',
        async done => {
            await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#components', { visible: true });
                await page.click('#components');

                await page.waitForSelector('#component0', { visible: true });
                await page.click(`#more-details-${component}`);
                await page.waitForSelector('#security', { visible: true });
                await page.click('#security');
                await page.waitForSelector('#container', { visible: true });
                await page.click('#container');
                await page.waitForSelector('#largeSpinner', { hidden: true });
                await page.click(
                    `#moreContainerSecurity_${containerSecurityName}`
                );

                await page.waitForSelector('#securityLog tbody', {
                    visible: true,
                });
                // make sure the added container security
                // have atlest one security vulnerability
                const logs = await page.$$('#securityLog tbody tr');
                expect(logs.length).toBeGreaterThanOrEqual(1);
            });
            done();
        },
        operationTimeOut
    );

    test(
        'should edit container security',
        async done => {
            await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#components', { visible: true });
                await page.click('#components');

                await page.waitForSelector('#component0', { visible: true });
                await page.click(`#more-details-${component}`);
                await page.waitForSelector('#security', { visible: true });
                await page.click('#security');
                await page.waitForSelector('#container', { visible: true });
                await page.click('#container');
                await page.waitForSelector('#largeSpinner', { hidden: true });
                await page.click(
                    `#moreContainerSecurity_${containerSecurityName}`
                );

                await page.waitForSelector(`#edit_${containerSecurityName}`, {
                    visible: true,
                });
                await page.click(`#edit_${containerSecurityName}`);
                await page.waitForSelector('#editContainerSecurityForm', {
                    visible: true,
                });
                await page.click('#name', { clickCount: 3 });
                await page.type('#name', newContainerSecurityName);
                await page.click('#editContainerBtn');
                await page.waitForSelector('#editContainerSecurityForm', {
                    hidden: true,
                });

                const textContent = await page.$eval(
                    `#containerSecurityTitle_${newContainerSecurityName}`,
                    elem => elem.textContent
                );
                expect(textContent).toEqual(newContainerSecurityName);
            });
            done();
        },
        operationTimeOut
    );

    test(
        'should delete container security',
        async done => {
            await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#components', { visible: true });
                await page.click('#components');

                await page.waitForSelector('#component0', { visible: true });
                await page.click(`#more-details-${component}`);
                await page.waitForSelector('#security', { visible: true });
                await page.click('#security');
                await page.waitForSelector('#container', { visible: true });
                await page.click('#container');
                await page.waitForSelector('#largeSpinner', { hidden: true });
                await page.click(
                    `#moreContainerSecurity_${newContainerSecurityName}`
                );
                await page.waitForSelector('#deleteContainerSecurityBtn', {
                    visible: true,
                });
                await page.click('#deleteContainerSecurityBtn');
                await page.waitForSelector('#deleteContainerSecurityModalBtn', {
                    visible: true,
                });
                await page.click('#deleteContainerSecurityModalBtn');
                await page.waitForNavigation();

                const containerSecurity = await page.waitForSelector(
                    `#containerSecurityHeader_${newContainerSecurityName}`,
                    { hidden: true }
                );
                expect(containerSecurity).toBeNull();
            });
            done();
        },
        operationTimeOut
    );
});
