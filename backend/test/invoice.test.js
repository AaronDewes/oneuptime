/* eslint-disable no-undef */

process.env.PORT = 3020;
process.env.IS_SAAS_SERVICE = true;
const expect = require('chai').expect;
const userData = require('./data/user');
const chai = require('chai');
chai.use(require('chai-http'));
const app = require('../server');

const request = chai.request.agent(app);
const UserService = require('../backend/services/userService');
const VerificationTokenModel = require('../backend/models/verificationToken');
const ProjectService = require('../backend/services/projectService');
const AirtableService = require('../backend/services/airtableService');
const GlobalConfig = require('./utils/globalConfig');
const payment = require('../backend/config/payment');
const stripe = require('stripe')(payment.paymentPrivateKey);

let token, userId, projectId, stripeCustomerId, testPlan;

describe('Invoice API', function() {
    this.timeout(200000);

    before(async function() {
        this.timeout(30000);
        await GlobalConfig.initTestConfig();
        const checkCardData = await request.post('/stripe/checkCard').send({
            tokenId: 'tok_visa',
            email: userData.email,
            companyName: userData.companyName,
        });
        const confirmedPaymentIntent = await stripe.paymentIntents.confirm(
            checkCardData.body.id
        );

        const signUp = await request.post('/user/signup').send({
            paymentIntent: {
                id: confirmedPaymentIntent.id,
            },
            ...userData.user,
        });

        const project = signUp.body.project;
        projectId = project._id;
        userId = signUp.body.id;

        const verificationToken = await VerificationTokenModel.findOne({
            userId,
        });
        try {
            await request
                .get(`/user/confirmation/${verificationToken.token}`)
                .redirects(0);
        } catch (error) {
            //catch
        }

        const login = await request.post('/user/login').send({
            email: userData.user.email,
            password: userData.user.password,
        });
        token = login.body.tokens.jwtAccessToken;

        const user = await UserService.findOneBy({ _id: userId });
        stripeCustomerId = user.stripeCustomerId;

        testPlan = await stripe.plans.create({
            amount: 5000,
            interval: 'month',
            product: {
                name: 'Test plan',
                type: 'service',
            },
            currency: 'usd',
        });

        await stripe.subscriptions.create({
            customer: stripeCustomerId,
            items: [
                {
                    quantity: 1,
                    plan: testPlan.id,
                },
            ],
        });
    });

    after(async function() {
        await GlobalConfig.removeTestConfig();
        await UserService.hardDeleteBy({
            email: {
                $in: [
                    userData.user.email,
                    userData.newUser.email,
                    userData.anotherUser.email,
                ],
            },
        });
        await ProjectService.hardDeleteBy({ _id: projectId });
        await stripe.plans.del(testPlan.id);
        await stripe.products.del(testPlan.product);
        await AirtableService.deleteAll({ tableName: 'User' });
    });

    it('should return invoices', async function() {
        const authorization = `Basic ${token}`;
        const invoices = await request
            .post(`/invoice/${userId}`)
            .set('Authorization', authorization);
        expect(invoices.status).to.be.equal(200);
        expect(invoices.body).to.be.an('object');
        expect(invoices.body).to.have.property('data');
        expect(invoices.body.data).to.be.an('object');
        expect(invoices.body.data).to.have.property('data');
        expect(invoices.body.data.data).to.be.an('array');
        expect(invoices.body.data.data).to.have.length(3);
        expect(invoices.body).to.have.property('count');
        expect(invoices.body.count)
            .to.be.an('number')
            .to.be.equal(3);
        expect(invoices.body).not.to.have.property('total_count');
        expect(invoices.body.data.data[0].total).to.be.equal(5000);
    });

    it('should paginate invoices', async function() {
        for (let i = 0; i < 10; i++) {
            await stripe.subscriptions.create({
                customer: stripeCustomerId,
                items: [
                    {
                        quantity: 1,
                        plan: testPlan.id,
                    },
                ],
            });
        }

        const authorization = `Basic ${token}`;
        let invoices = await request
            .post(`/invoice/${userId}`)
            .set('Authorization', authorization);
        expect(invoices.status).to.be.equal(200);
        expect(invoices.body).to.be.an('object');
        expect(invoices.body).to.have.property('data');
        expect(invoices.body.data).to.be.an('object');
        expect(invoices.body.data).to.have.property('data');
        expect(invoices.body.data.data).to.be.an('array');
        expect(invoices.body.data.data).to.have.length(10);
        expect(invoices.body).to.have.property('count');
        expect(invoices.body.count)
            .to.be.an('number')
            .to.be.equal(10);
        expect(invoices.body.data).to.have.property('has_more');
        expect(invoices.body.data.has_more).to.be.equal(true);
        invoices = await request
            .post(
                `/invoice/${userId}?startingAfter=${invoices.body.data.data[9].id}`
            )
            .set('Authorization', authorization);
        expect(invoices.status).to.be.equal(200);
        expect(invoices.body).to.be.an('object');
        expect(invoices.body).to.have.property('data');
        expect(invoices.body.data).to.be.an('object');
        expect(invoices.body.data).to.have.property('data');
        expect(invoices.body.data.data).to.be.an('array');
        expect(invoices.body.data.data).to.have.length(3);
        expect(invoices.body).to.have.property('count');
        expect(invoices.body.count)
            .to.be.an('number')
            .to.be.equal(3);
        expect(invoices.body.data).to.have.property('has_more');
        expect(invoices.body.data.has_more).to.be.equal(false);
    });
});
