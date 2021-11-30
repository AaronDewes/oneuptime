process.env.PORT = 3020;
const expect = require('chai').expect;
const chai = require('chai');
chai.use(require('chai-http'));
const app = require('../server');
const request = chai.request.agent(app);
const GlobalConfig = require('./utils/globalConfig');
const leadService = require('../backend/services/leadService');
const EmailStatusService = require('../backend/services/emailStatusService');

const leadData = {
    'csrf-token': '1',
    analytics_event_id: '',
    fullname: 'John Smith',
    email: 'testmail@oneuptime.com',
    website: 'oneuptime.com',
    country: 'IN',
    volume: '{"index":0,"total":6,"text":"$75,000 or less","lower_bound":0}',
    message: 'Testing',
    type: 'demo',
};
const selectEmailStatus =
    'from to subject body createdAt template status content error deleted deletedAt deletedById replyTo smtpServer';

describe('Lead API', function() {
    this.timeout(20000);

    before(async function() {
        this.timeout(30000);
        await GlobalConfig.initTestConfig();
    });

    after(async function() {
        await GlobalConfig.removeTestConfig();
    });

    it('should add lead when requested for type demo or whitepaper', function(done) {
        request
            .post('/lead')
            .send(leadData)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                leadService.hardDeleteBy({ _id: res.body._id });
                done();
            });
    });

    it('should add lead when requested for type demo and check the sent message', function(done) {
        this.timeout(60000);
        request
            .post('/lead')
            .send(leadData)
            .end(async function(err, res) {
                expect(res).to.have.status(200);
                leadService.hardDeleteBy({ _id: res.body._id });
                const emailStatuses = await EmailStatusService.findBy({
                    query: {},
                    select: selectEmailStatus,
                });
                if (emailStatuses[0].subject.includes('New Lead')) {
                    expect(emailStatuses[0].subject).to.equal('New Lead Added');
                    expect(emailStatuses[0].status).to.equal(
                        'Email not enabled.'
                    );
                    expect(emailStatuses[1].subject).to.equal(
                        'Thank you for your demo request.'
                    );
                    expect(emailStatuses[1].status).to.equal(
                        'Email not enabled.'
                    );
                } else {
                    expect(emailStatuses[0].subject).to.equal(
                        'Thank you for your demo request.'
                    );
                    expect(emailStatuses[0].status).to.equal(
                        'Email not enabled.'
                    );
                    expect(emailStatuses[1].subject).to.equal('New Lead Added');
                    expect(emailStatuses[1].status).to.equal(
                        'Email not enabled.'
                    );
                }

                done();
            });
    });
});
