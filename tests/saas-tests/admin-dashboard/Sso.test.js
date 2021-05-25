const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');
let browser, page;

require('should');

// user credentials
const email = 'masteradmin@hackerbay.io';
const password = '1234567890';

const moveToSsoPage = async page => {
    await init.pageWaitForSelector(page, '#settings');
    await init.pageClick(page, '#settings');
    await init.pageWaitForSelector(page, '#sso');
    await init.pageClick(page, '#sso');
};

const createSso = async (page, data) => {
    await init.pageClick(page, '#add-sso');
    await init.pageWaitForSelector(page, '#save-button');

    await init.pageClick(page, '#domain');
    await init.pageType(page, '#domain', data.domain);

    await init.pageClick(page, '#entityId');
    await init.pageType(page, '#entityId', data.entityId);

    await init.pageClick(page, '#remoteLoginUrl');
    await init.pageType(page, '#remoteLoginUrl', data.remoteLoginUrl);

    await init.pageClick(page, '#certificateFingerprint');
    await init.pageType(
        page,
        '#certificateFingerprint',
        data.certificateFingerprint
    );

    await init.pageClick(page, '#remoteLogoutUrl');
    await init.pageType(page, '#remoteLogoutUrl', data.remoteLogoutUrl);

    await init.pageClick(page, '#ipRanges');
    await init.pageType(page, '#ipRanges', data.ipRanges);

    await init.pageClick(page, '#save-button');
};

describe('SSO API', () => {
    const operationTimeOut = init.timeout;

    afterAll(async done => {
        /**This takes care of the closing the browser when the test is complete */
        await browser.close();
        done();
    });

    beforeAll(async done => {
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);

        const user = {
            email: email,
            password: password,
        };

        await init.loginAdminUser(user, page);

        done();
    });

    test(
        'should add new SSO',
        async done => {
            /** Upon login, admin-dashboard is loaded */
            await moveToSsoPage(page);

            /**  With respect to admin-dashboard code refactoring,
             *  removal of UNDEFINED
             *  sso-count is only visible after an sso has been created*/

            // delete all previous SSO
            while (await init.isElementOnPage(page, '#delete-button')) {
                await init.pageWaitForSelector(page, '#delete-button');
                await init.pageClick(page, '#delete-button');
                await init.pageWaitForSelector(page, '#confirmDelete');
                await init.pageClick(page, '#confirmDelete');
                await page.reload({ waitUntil: 'networkidle2' });
            }

            await init.pageWaitForSelector(page, '#no-sso-message');

            await createSso(page, {
                domain: 'test.hackerbay.io',
                entityId: 'hackerbay.io', //Updated UI
                remoteLoginUrl: 'test.hackerbay.io/login',
                certificateFingerprint: 'AZERTYUIOP',
                remoteLogoutUrl: 'test.hackerbay.io/logout',
                ipRanges: '127.0.0.1',
            });

            await init.pageWaitForSelector(page, '#sso-domain');

            const ssoCountAfterCreation = await init.page$Eval(
                page,
                '#sso-count',
                e => {
                    return e.innerHTML;
                }
            );

            expect(ssoCountAfterCreation).toContain('1');

            const tbody = await init.page$Eval(page, 'tbody', e => {
                return e.innerHTML;
            });

            expect(tbody).toContain('test.hackerbay.io');

            done();
        },
        operationTimeOut
    );

    test(
        'should update existing SSO',
        async done => {
            /** No need for additional logout and login as it slows down testing
             * Testing is done in the same admin UI */

            await page.goto(utils.ADMIN_DASHBOARD_URL);
            await moveToSsoPage(page);

            await init.pageWaitForSelector(page, '#sso-count');

            const ssoCountAfterCreation = await init.page$Eval(
                page,
                '#sso-count',
                e => {
                    return e.innerHTML;
                }
            );

            expect(ssoCountAfterCreation).toContain('1');

            await init.pageWaitForSelector(page, '#edit-button');
            await init.pageClick(page, '#edit-button');

            await init.pageWaitForSelector(page, '#save-button');
            await init.pageClick(page, '#domain');
            await page.keyboard.down('Control');
            await page.keyboard.press('A');
            await page.keyboard.up('Control');
            await page.keyboard.press('Backspace');
            await init.pageType(page, '#domain', 'updated.test.hackerbay.io');
            await init.pageClick(page, '#save-button');

            await init.pageWaitForSelector(page, '#sso-domain');

            const tbody = await init.page$Eval(page, 'tbody', e => {
                return e.innerHTML;
            });
            expect(tbody).toContain('updated.test.hackerbay.io');

            done();
        },
        operationTimeOut
    );

    test(
        'should delete existing SSO',
        async done => {
            await page.goto(utils.ADMIN_DASHBOARD_URL);
            await moveToSsoPage(page);

            await init.pageWaitForSelector(page, '#sso-count');

            const count = await init.page$Eval(page, '#sso-count', e => {
                return e.innerHTML;
            });

            expect(count).toContain('1');

            while (await init.isElementOnPage(page, '#delete-button')) {
                await init.pageWaitForSelector(page, '#delete-button');
                await init.pageClick(page, '#delete-button');
                await init.pageWaitForSelector(page, '#confirmDelete');
                await init.pageClick(page, '#confirmDelete');
                await page.reload({ waitUntil: 'networkidle2' });
            }

            const ssoMessage = await init.pageWaitForSelector(
                page,
                '#no-sso-message'
            ); // 'No SSO created yet' is rendered when none is available
            expect(ssoMessage).toBeDefined();

            const ssoCountAfterDeletion = await init.pageWaitForSelector(
                page,
                '#sso-count',
                { hidden: true }
            );
            expect(ssoCountAfterDeletion).toBeNull();

            done();
        },
        operationTimeOut
    );

    it(
        'should enable Next/Previous buttons when there are more than 10 SSOs',
        async done => {
            await page.goto(utils.ADMIN_DASHBOARD_URL);
            await moveToSsoPage(page);
            await init.pageWaitForSelector(page, '#no-sso-message');

            for (let i = 0; i <= 11; i++) {
                await createSso(page, {
                    domain: `subdomain.${i}.test.hackerbay.io`,
                    entityId: 'hackerbay.io', //Updated UI
                    remoteLoginUrl: 'test.hackerbay.io/login',
                    certificateFingerprint: 'AZERTYUIOP',
                    remoteLogoutUrl: 'test.hackerbay.io/logout',
                    ipRanges: '127.0.0.1',
                });
            }

            await init.pageWaitForSelector(page, '#sso-domain');

            const ssoCount = await init.page$Eval(page, '#sso-count', e => {
                return e.innerHTML;
            });

            expect(ssoCount).toContain('12');

            const firstPageTbody = await init.page$Eval(page, 'tbody', e => {
                return e.innerHTML;
            });
            expect(firstPageTbody).toContain('subdomain.11.test.hackerbay.io');
            expect(firstPageTbody).toContain('subdomain.2.test.hackerbay.io');

            await init.pageClick(page, '#next-button');

            const secondPageTbody = await init.page$Eval(page, 'tbody', e => {
                return e.innerHTML;
            });
            expect(secondPageTbody).toContain('subdomain.1.test.hackerbay.io');
            expect(secondPageTbody).toContain('subdomain.0.test.hackerbay.io');

            await init.pageClick(page, '#previous-button');

            const initalPageTbody = await init.page$Eval(page, 'tbody', e => {
                return e.innerHTML;
            });

            expect(initalPageTbody).toContain('subdomain.11.test.hackerbay.io');
            expect(initalPageTbody).toContain('subdomain.2.test.hackerbay.io');

            done();
        },
        operationTimeOut
    );
});
