const puppeteer = require('puppeteer');
const utils = require('./test-utils');
const init = require('./test-init');
const { Cluster } = require('puppeteer-cluster');

// parent user credentials
const email = utils.generateRandomBusinessEmail();
const password = '1234567890';

const projectName = utils.generateRandomString();
const projectMonitorName = utils.generateRandomString();
const componentName = utils.generateRandomString();

const bodyText = utils.generateRandomString();

describe('Incident Timeline API', () => {
    const operationTimeOut = 500000;

    let cluster;

    beforeAll(async () => {
        jest.setTimeout(360000);

        cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_PAGE,
            puppeteerOptions: utils.puppeteerLaunchConfig,
            puppeteer,
            timeout: 500000,
        });

        cluster.on('taskerror', err => {
            throw err;
        });

        // Register user
        return await cluster.execute(null, async ({ page }) => {
            const user = {
                email,
                password,
            };
            // user
            await init.registerUser(user, page);
            await init.loginUser(user, page);

            // rename default project
            await init.renameProject(projectName, page);

            // Create component
            await init.addComponent(componentName, page);
            // await init.navigateToComponentDetails(componentName, page);

            // add new monitor to project
            await page.waitForSelector('#monitors');
            await page.$eval('#monitors', e => e.click());
            await page.waitForSelector('#form-new-monitor');
            await page.$eval('input[id=name]', e => e.click());
            await page.type('input[id=name]', projectMonitorName);
            await init.selectByText('#type', 'url', page);
            await page.waitForSelector('#url');
            await page.$eval('#url', e => e.click());
            await page.type('#url', utils.HTTP_TEST_SERVER_URL);
            await page.$eval('button[type=submit]', e => e.click());
            await page.waitFor(2000);
        });
    });

    afterAll(async () => {
        await cluster.idle();
        await cluster.close();
    });

    test(
        'should create incident in project with multi-probes and add to incident timeline',
        async () => {
            expect.assertions(2);
            const testServer = async ({ page }) => {
                await page.goto(utils.HTTP_TEST_SERVER_URL + '/settings');
                await page.evaluate(
                    () => (document.getElementById('responseTime').value = '')
                );
                await page.evaluate(
                    () => (document.getElementById('statusCode').value = '')
                );
                await page.evaluate(
                    () => (document.getElementById('body').value = '')
                );
                await page.waitForSelector('#responseTime');
                await page.$eval('input[name=responseTime]', e => e.click());
                await page.type('input[name=responseTime]', '0');
                await page.waitForSelector('#statusCode');
                await page.$eval('input[name=statusCode]', e => e.click());
                await page.type('input[name=statusCode]', '400');
                await page.select('#responseType', 'html');
                await page.waitForSelector('#body');
                await page.$eval('textarea[name=body]', e => e.click());
                await page.type(
                    'textarea[name=body]',
                    `<h1 id="html"><span>${bodyText}</span></h1>`
                );
                await page.$eval('button[type=submit]', e => e.click());
                await page.waitForSelector('#save-btn');
            };

            const dashboard = async ({ page }) => {
                await page.waitFor(350000);
                // Navigate to Component details
                await init.navigateToComponentDetails(componentName, page);

                await page.waitForSelector('#incident_span_0');

                const incidentTitleSelector = await page.$('#incident_span_0');

                let textContent = await incidentTitleSelector.getProperty(
                    'innerText'
                );
                textContent = await textContent.jsonValue();
                expect(textContent.toLowerCase()).toEqual(
                    `${projectMonitorName}'s Incident Status`.toLowerCase()
                );

                await page.waitForSelector(`#incident_${projectMonitorName}_0`);
                await page.$eval(`#incident_${projectMonitorName}_0`, e =>
                    e.click()
                );
                await page.waitFor(5000);

                const incidentTimelineRows = await page.$$(
                    'tr.incidentListItem'
                );
                const countIncidentTimelines = incidentTimelineRows.length;
                expect(countIncidentTimelines).toEqual(2);
            };

            await cluster.execute(null, testServer);
            await cluster.execute(null, dashboard);
        },
        operationTimeOut
    );

    test(
        'should auto-resolve incident in project with multi-probes and add to incident timeline',
        async () => {
            expect.assertions(2);
            const testServer = async ({ page }) => {
                await page.goto(utils.HTTP_TEST_SERVER_URL + '/settings', {
                    waitUntil: 'networkidle2',
                });
                await page.evaluate(
                    () => (document.getElementById('responseTime').value = '')
                );
                await page.evaluate(
                    () => (document.getElementById('statusCode').value = '')
                );
                await page.evaluate(
                    () => (document.getElementById('body').value = '')
                );
                await page.waitForSelector('#responseTime');
                await page.$eval('input[name=responseTime]', e => e.click());
                await page.type('input[name=responseTime]', '0');
                await page.waitForSelector('#statusCode');
                await page.$eval('input[name=statusCode]', e => e.click());
                await page.type('input[name=statusCode]', '200');
                await page.select('#responseType', 'html');
                await page.waitForSelector('#body');
                await page.$eval('textarea[name=body]', e => e.click());
                await page.type(
                    'textarea[name=body]',
                    `<h1 id="html"><span>${bodyText}</span></h1>`
                );
                await page.$eval('button[type=submit]', e => e.click());
                await page.waitForSelector('#save-btn');
            };

            const dashboard = async ({ page }) => {
                await page.waitFor(350000);
                // Navigate to Component details
                await init.navigateToComponentDetails(componentName, page);

                await page.waitForSelector('#ResolveText_0');

                const resolveTextSelector = await page.$('#ResolveText_0');
                expect(resolveTextSelector).not.toBeNull();

                await page.waitForSelector(`#incident_${projectMonitorName}_0`);
                await page.$eval(`#incident_${projectMonitorName}_0`, e =>
                    e.click()
                );
                await page.waitFor(5000);

                const incidentTimelineRows = await page.$$(
                    'tr.incidentListItem'
                );
                const countIncidentTimelines = incidentTimelineRows.length;
                expect(countIncidentTimelines).toEqual(6);
            };

            await cluster.execute(null, testServer);
            await cluster.execute(null, dashboard);
        },
        operationTimeOut
    );

    test('should get incident timeline and paginate for incident timeline in project', async () => {
        expect.assertions(3);
        const internalNote = utils.generateRandomString();
        return await cluster.execute(null, async ({ page }) => {
            // Navigate to Component details
            await init.navigateToComponentDetails(componentName, page);

            await page.waitForSelector(`#incident_${projectMonitorName}_0`);
            await page.$eval(`#incident_${projectMonitorName}_0`, e =>
                e.click()
            );

            for (let i = 0; i < 10; i++) {
                // update internal note
                await page.waitForSelector('#txtInternalNote');
                await page.type('#txtInternalNote', internalNote);
                await page.$eval('#btnUpdateInternalNote', e => e.click());
                await page.waitFor(1000);
            }

            await page.waitForSelector('tr.incidentListItem');
            let incidentTimelineRows = await page.$$('tr.incidentListItem');
            let countIncidentTimelines = incidentTimelineRows.length;

            expect(countIncidentTimelines).toEqual(10);

            const nextSelector = await page.$('#btnTimelineNext');

            await nextSelector.click();
            await page.waitFor(7000);
            incidentTimelineRows = await page.$$('tr.incidentListItem');
            countIncidentTimelines = incidentTimelineRows.length;
            expect(countIncidentTimelines).toEqual(6);

            const prevSelector = await page.$('#btnTimelinePrev');

            await prevSelector.click();
            await page.waitFor(7000);
            incidentTimelineRows = await page.$$('tr.incidentListItem');
            countIncidentTimelines = incidentTimelineRows.length;
            expect(countIncidentTimelines).toEqual(10);
        });
    }, 300000);
});
