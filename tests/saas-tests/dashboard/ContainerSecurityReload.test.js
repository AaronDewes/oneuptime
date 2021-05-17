const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');

let browser, page;
const user = {
    email: utils.generateRandomBusinessEmail(),
    password: '1234567890',
};
const componentName = utils.generateRandomString();
const containerSecurityName = utils.generateRandomString();

const dockerRegistryUrl = utils.dockerCredential.dockerRegistryUrl;
const dockerUsername = utils.dockerCredential.dockerUsername;
const dockerPassword = utils.dockerCredential.dockerPassword;
const dockerImagePath = utils.dockerCredential.imagePath;
const dockerImageTag = utils.dockerCredential.imageTags;

/** This is a test to check:
 * No errors on page reload
 * It stays on the same page on reload
 */

describe('Fyipe Page Reload', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async done => {
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);

        await init.registerUser(user, page); // This automatically routes to dashboard page
        await init.addComponent(componentName, page);
        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'Should reload the application security page and confirm there are no errors',
        async done => {
            const categoryName = 'Random-Category';
            // create a new resource category
            await init.addResourceCategory(categoryName, page);
            //navigate to component details
            await init.navigateToComponentDetails(componentName, page);

            await page.waitForSelector('#security', { visible: true });
            await init.pageClick(page, '#security');
            await init.pageClick(page, '#container');

            await page.waitForSelector('#containerSecurityForm', {
                visible: true,
            });
            await init.pageClick(page, '#addCredentialBtn');
            await page.waitForSelector('#dockerCredentialForm', {
                visible: true,
            });
            await init.pageType(page, '#dockerRegistryUrl', dockerRegistryUrl);
            await init.pageType(page, '#dockerUsername', dockerUsername);
            await init.pageType(page, '#dockerPassword', dockerPassword);
            await init.pageClick(page, '#addCredentialModalBtn');
            await page.waitForSelector('#dockerCredentialForm', {
                hidden: true,
            });

            await init.pageClick(page, '#name');
            await init.pageType(page, '#name', containerSecurityName);
            await init.selectByText('#resourceCategory', categoryName, page); // add category
            await init.selectByText('#dockerCredential', dockerUsername, page);
            await init.pageType(page, '#imagePath', dockerImagePath); // select the created credential
            await init.pageType(page, '#imageTags', dockerImageTag);
            await init.pageClick(page, '#addContainerBtn');

            const containerSecurity = await page.waitForSelector(
                `#containerSecurityTitle_${containerSecurityName}`,
                { visible: true }
            );
            expect(containerSecurity).toBeDefined();

            // To confirm no errors and stays on the same page on reload
            await page.reload({ waitUntil: 'networkidle2' });
            await page.waitForSelector(`#cb${componentName}`, {
                visible: true,
            });
            await page.waitForSelector('#cbcontainerSecurity', {
                visible: true,
            });
            await page.waitForSelector(`#cb${containerSecurityName}`, {
                visible: true,
            });

            const spanElement = await page.waitForSelector(
                `#containerSecurityTitle_${containerSecurityName}`
            );
            expect(spanElement).toBeDefined();

            done();
        },
        operationTimeOut
    );
});
