const utils = require('../../test-utils');
const init = require('../../test-init');
const puppeteer = require('puppeteer');

let page, browser;

describe('Check Server', () => {
    beforeAll(async done => {
        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test('should get hosts mapping from server', async done => {
        await page.goto(`${utils.BACKEND_URL}/server/hosts`, {
            waitUntil: 'networkidle2',
        });
        const response = await init.page$Eval(page, 'body > pre', e => {
            return e.innerHTML;
        });

        let expectedResponse;
        if (utils.BACKEND_URL.includes('localhost')) {
            if (utils.BACKEND_URL.includes('localhost:')) {
                expectedResponse =
                    '{"api":"http://localhost:3002/api","home":"http://localhost:1444","accounts":"http://localhost:3003/accounts","dashboard":"http://localhost:3000/dashboard"}';
            } else {
                expectedResponse =
                    '{"api":"http://localhost/api","home":"http://localhost","accounts":"http://localhost/accounts","dashboard":"http://localhost/dashboard"}';
            }
        } else {
            if (utils.BACKEND_URL.includes('staging.')) {
                expectedResponse =
                    '{"api":"https://staging.fyipe.com/api","home":"https://staging.fyipe.com","accounts":"https://staging.fyipe.com/accounts","dashboard":"https://staging.fyipe.com/dashboard"}';
            } else {
                expectedResponse =
                    '{"api":"https://fyipe.com/api","home":"https://fyipe.com","accounts":"https://fyipe.com/accounts","dashboard":"https://fyipe.com/dashboard"}';
            }
        }
        expect(response).toBe(expectedResponse);
        done();
    });

    test('should get saas status true from server', async done => {
        await page.goto(`${utils.BACKEND_URL}/server/is-saas-service`, {
            waitUntil: 'networkidle2',
        });
        const response = await init.page$Eval(page, 'body > pre', e => {
            return e.innerHTML;
        });
        expect(response).toBe('{"result":true}');
        done();
    });
});
