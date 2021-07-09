process.env.PORT = 3020;
const expect = require('chai').expect;
const userData = require('./data/user');
const chai = require('chai');
chai.use(require('chai-http'));
const app = require('../server');

const request = chai.request.agent(app);
const { createUser } = require('./utils/userSignUp');
const UserService = require('../backend/services/userService');
const ProjectService = require('../backend/services/projectService');
const MonitorService = require('../backend/services/monitorService');
const AirtableService = require('../backend/services/airtableService');
const IntegrationService = require('../backend/services/integrationService');
const VerificationTokenModel = require('../backend/models/verificationToken');
const GlobalConfig = require('./utils/globalConfig');

// eslint-disable-next-line
let token, userId, projectId, monitorId, msTeamsId,msTeamsId1,slackId,slackId1;
const monitor = {
    name: 'New Monitor',
    type: 'url',
    data: { url: 'http://www.tests.org' },
};

const msTeamsPayload = {
    monitorId: null,
    endpoint: 'http://hackerbay.io',
    incidentCreated: true,
    incidentResolved: true,
    incidentAcknowledged: true,
    type: 'msteams',
};

const slackPayload = {
    monitorId: null,
    endpoint: 'http://hackerbay.io',
    incidentCreated: true,
    incidentResolved: true,
    incidentAcknowledged: true,
    type: 'slack',
};

describe('Webhook API', function() {
    this.timeout(20000);

    before(function(done) {
        this.timeout(40000);
        GlobalConfig.initTestConfig().then(function() {
            createUser(request, userData.user, async function(err, res) {
                projectId = res.body.project._id;
                userId = res.body.id;

                // make created user master admin
                await UserService.updateBy(
                    { email: userData.user.email },
                    { role: 'master-admin' }
                );

                VerificationTokenModel.findOne({ userId }, function(
                    err,
                    verificationToken
                ) {
                    request
                        .get(`/user/confirmation/${verificationToken.token}`)
                        .redirects(0)
                        .end(function() {
                            request
                                .post('/user/login')
                                .send({
                                    email: userData.user.email,
                                    password: userData.user.password,
                                })
                                .end(function(err, res) {
                                    token = res.body.tokens.jwtAccessToken;
                                    const authorization = `Basic ${token}`;
                                    request
                                        .post(`/monitor/${projectId}`)
                                        .set('Authorization', authorization)
                                        .send(monitor)
                                        .end(function(err, res) {
                                            monitorId = res.body._id;
                                            msTeamsPayload.monitorId = monitorId;
                                            slackPayload.monitorId = monitorId;
                                            expect(res).to.have.status(200);
                                            expect(res.body).to.be.an('object');
                                            done();
                                        });
                                });
                        });
                });
            });
        });
    });

    after(async function() {
        await GlobalConfig.removeTestConfig();
        await ProjectService.hardDeleteBy({ _id: projectId });
        await UserService.hardDeleteBy({
            email: {
                $in: [
                    userData.user.email,
                    userData.newUser.email,
                    userData.anotherUser.email,
                ],
            },
        });
        await MonitorService.hardDeleteBy({ _id: monitorId });
        await AirtableService.deleteAll({ tableName: 'User' });
        await IntegrationService.hardDeleteBy({
            _id: { $in: [msTeamsId, msTeamsId1, slackId, slackId1] },
        });
    });

    //MS Teams
    it('should prevent unauthenticated users from creating webhooks.', function(done) {
        request.post(`/webhook/${projectId}/create`).end(function(err, res) {
            expect(res).to.have.status(401);
            done();
        });
    });

    it('should reject requests missing the endpoint.', function(done) {
        const authorization = `Basic ${token}`;
        const payload = { ...msTeamsPayload };
        delete payload.endpoint;
        request
            .post(`/webhook/${projectId}/create`)
            .set('Authorization', authorization)
            .send(payload)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('should reject requests missing the monitorId.', function(done) {
        const authorization = `Basic ${token}`;
        const payload = { ...msTeamsPayload };
        delete payload.monitorId;
        request
            .post(`/webhook/${projectId}/create`)
            .set('Authorization', authorization)
            .send(payload)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('should reject requests missing the integration type.', function(done) {
        const authorization = `Basic ${token}`;
        const payload = { ...msTeamsPayload };
        delete payload.type;
        request
            .post(`/webhook/${projectId}/create`)
            .set('Authorization', authorization)
            .send(payload)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('should create msteams webhook.', function(done) {
        const authorization = `Basic ${token}`;
        request
            .post(`/webhook/${projectId}/create`)
            .set('Authorization', authorization)
            .send(msTeamsPayload)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('projectId');
                expect(res.body).to.have.property('monitorId');
                expect(res.body).to.have.property('notificationOptions');
                msTeamsId = res.body._id;
                done();
            });
    });

    it('should not create msteams webhook, with the same integration type and endpoint, for the same monitorId.', function(done) {
        const authorization = `Basic ${token}`;
        request
            .post(`/webhook/${projectId}/create`)
            .set('Authorization', authorization)
            .send(msTeamsPayload)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('should create msteams webhook with a different endpoint.', function(done) {
        const authorization = `Basic ${token}`;
        const payload = { ...msTeamsPayload };
        payload.endpoint = 'http://test1.hackerbay.io';
        request
            .post(`/webhook/${projectId}/create`)
            .set('Authorization', authorization)
            .send(payload)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('projectId');
                expect(res.body).to.have.property('monitorId');
                expect(res.body).to.have.property('notificationOptions');
                msTeamsId1 = res.body._id;
                done();
            });
    });

    it('should update the msteams webhook.', function(done) {
        const authorization = `Basic ${token}`;
        const payload = { ...msTeamsPayload };
        payload.endpoint = 'http://newlink.hackerbay.io';
        request
            .put(`/webhook/${projectId}/${msTeamsId}`)
            .set('Authorization', authorization)
            .send(payload)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('projectId');
                expect(res.body).to.have.property('monitorId');
                expect(res.body).to.have.property('notificationOptions');
                done();
            });
    });

    it('should return the list of msteams webhook.', function(done) {
        const authorization = `Basic ${token}`;
        request
            .get(`/webhook/${projectId}/hooks?type=msteams`)
            .set('Authorization', authorization)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('count');
                expect(res.body.count).to.eql(2);
                done();
            });
    });

    it('should delete msteams webhooks.', function(done) {
        const authorization = `Basic ${token}`;
        request
            .delete(`/webhook/${projectId}/delete/${msTeamsId}`)
            .set('Authorization', authorization)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('monitorId');
                expect(res.body).to.have.property('projectId');
                expect(res.body).to.have.property('integrationType');
                expect(res.body).to.have.property('notificationOptions');
                done();
            });
    });
    //Slack
    it('should create slack webhook.', function(done) {
        const authorization = `Basic ${token}`;
        request
            .post(`/webhook/${projectId}/create`)
            .set('Authorization', authorization)
            .send(slackPayload)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('projectId');
                expect(res.body).to.have.property('monitorId');
                expect(res.body).to.have.property('notificationOptions');
                slackId = res.body._id;
                done();
            });
    });

    it('should not create slack webhook, with the same integration type and endpoint, for the same monitorId.', function(done) {
        const authorization = `Basic ${token}`;
        request
            .post(`/webhook/${projectId}/create`)
            .set('Authorization', authorization)
            .send(slackPayload)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('should create slack webhook with a different endpoint.', function(done) {
        const authorization = `Basic ${token}`;
        const payload = { ...slackPayload };
        payload.endpoint = 'http://test1.slack.hackerbay.io';
        request
            .post(`/webhook/${projectId}/create`)
            .set('Authorization', authorization)
            .send(payload)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('projectId');
                expect(res.body).to.have.property('monitorId');
                expect(res.body).to.have.property('notificationOptions');
                slackId1 = res.body._id;
                done();
            });
    });

    it('should update the slack webhook.', function(done) {
        const authorization = `Basic ${token}`;
        const payload = { ...slackPayload };
        payload.endpoint = 'http://newlink.hackerbay.io';
        request
            .put(`/webhook/${projectId}/${slackId}`)
            .set('Authorization', authorization)
            .send(payload)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('projectId');
                expect(res.body).to.have.property('monitorId');
                expect(res.body).to.have.property('notificationOptions');
                done();
            });
    });

    it('should return the list of slack webhook.', function(done) {
        const authorization = `Basic ${token}`;
        request
            .get(`/webhook/${projectId}/hooks?type=slack`)
            .set('Authorization', authorization)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('count');
                expect(res.body.count).to.eql(2);
                done();
            });
    });

    it('should delete slack webhooks.', function(done) {
        const authorization = `Basic ${token}`;
        request
            .delete(`/webhook/${projectId}/delete/${slackId}`)
            .set('Authorization', authorization)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('monitorId');
                expect(res.body).to.have.property('projectId');
                expect(res.body).to.have.property('integrationType');
                expect(res.body).to.have.property('notificationOptions');
                done();
            });
    });
});
