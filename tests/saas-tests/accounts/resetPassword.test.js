/* eslint-disable quotes */

const puppeteer = require('puppeteer');
const should = require('should');
const utils = require('../../test-utils');
const init = require('../../test-init');

let browser;
let page;

const email = utils.generateRandomBusinessEmail();
const password = '1234567890';
const user = {
    email,
    password,
};

describe('Reset Password API', () => {
    beforeAll(async () => {
        jest.setTimeout(15000);
        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);
    });

    afterAll(async () => {
        await browser.close();
    });

    it('Should reset password successfully', async () => {
        await init.registerUser(user, page);
        await init.logoutUser(page);
        await page.goto(utils.ACCOUNTS_URL + '/forgot-password', {
            waitUntil: 'networkidle2',
        });
        await page.waitForSelector('#email');
        await init.pageClick(page, 'input[name=email]');
        await init.pageType(page, 'input[name=email]', email);
        await init.pageClick(page, 'button[type=submit]');
        await page.waitForSelector('#reset-password-success');
        const html = await page.$eval('#reset-password-success', e => {
            return e.innerHTML;
        });
        should.exist(html);
        html.should.containEql(
            " An email is on its way to you. Follow the instructions to reset your password. Please don't forget to check spam. "
        );
    }, 160000);

    it('User cannot reset password with non-existing email', async () => {
        await page.goto(utils.ACCOUNTS_URL + '/forgot-password', {
            waitUntil: 'networkidle2',
        });
        await page.waitForSelector('#email');
        await init.pageClick(page, 'input[name=email]');
        await init.pageType(
            page,
            'input[name=email]',
            utils.generateWrongEmail()
        );
        await init.pageClick(page, 'button[type=submit]');
        await page.waitForSelector('#error-msg');
        const html = await page.$eval('#error-msg', e => {
            return e.innerHTML;
        });
        should.exist(html);
        html.should.containEql('User does not exist.');
    }, 160000);
});
