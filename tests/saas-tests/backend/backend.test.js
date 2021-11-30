const utils = require('../../test-utils');
const puppeteer = require('puppeteer');
const init = require('../../test-init');
let page, browser;

describe('Check Backend', () => {
    beforeAll(async done => {
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test('should get status ok from backend', async done => {
        await page.goto(utils.BACKEND_URL + '/api', {
            waitUntil: 'networkidle2',
        });
        const response = await init.page$Eval(page, 'body > pre', e => {
            return e.innerHTML;
        });
        expect(response).toBe(
            '{"backend":{"status":200,"message":"Service Status - OK","serviceType":"oneuptime-api"},"database":{"status":"Up","message":"Mongodb database connection is healthy"},"redis":{"status":"Up","message":"Redis connection is healthy"}}'
        );
        done();
    });
});
