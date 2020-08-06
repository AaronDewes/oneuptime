/* eslint-disable no-undef */

process.env.PORT = 3020;
const expect = require('chai').expect;
const userData = require('./data/user');
const chai = require('chai');
chai.use(require('chai-http'));
const app = require('../server');
const GlobalConfig = require('./utils/globalConfig');
const request = chai.request.agent(app);
const { createUser } = require('./utils/userSignUp');
const UserService = require('../backend/services/userService');
const ProjectService = require('../backend/services/projectService');
const ScheduledEventService = require('../backend/services/scheduledEventService');
const MonitorService = require('../backend/services/monitorService');
const AirtableService = require('../backend/services/airtableService');

const VerificationTokenModel = require('../backend/models/verificationToken');
const ComponentModel = require('../backend/models/component');

let token,
    userId,
    airtableId,
    projectId,
    scheduleEventId,
    monitorId,
    componentId;

const scheduledEvent = {
    name: 'New scheduled Event',
    startDate: '2019-06-11 11:01:52.178',
    endDate: '2019-06-26 11:31:53.302',
    description: 'New scheduled Event description ',
    showEventOnStatusPage: true,
    alertSubscriber: true,
    callScheduleOnEvent: true,
    monitorDuringEvent: false,
};

describe('Scheduled event API', function() {
    this.timeout(20000);

    before(function(done) {
        this.timeout(40000);
        GlobalConfig.initTestConfig().then(function() {
            createUser(request, userData.user, function(err, res) {
                const project = res.body.project;
                userId = res.body.id;
                projectId = project._id;
                airtableId = res.body.airtableId;

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
                                    ComponentModel.create({
                                        name: 'Test Component',
                                    }).then(component => {
                                        componentId = component._id;
                                        request
                                            .post(`/monitor/${projectId}`)
                                            .set('Authorization', authorization)
                                            .send({
                                                name: 'New Monitor 1',
                                                type: 'url',
                                                data: {
                                                    url: 'http://www.tests.org',
                                                },
                                                componentId,
                                            })
                                            .end(async function(err, res) {
                                                monitorId = res.body._id;

                                                const scheduledEvents = [];

                                                for (let i = 0; i < 12; i++) {
                                                    scheduledEvents.push({
                                                        name: `testPagination${i}`,
                                                        description:
                                                            'testPaginationDescription',
                                                        startDate:
                                                            '2019-06-11 11:01:52.178',
                                                        endDate:
                                                            '2019-06-26 11:31:53.302',
                                                    });
                                                }

                                                const createdScheduledEvents = scheduledEvents.map(
                                                    async scheduledEvent => {
                                                        const sentRequests = await request
                                                            .post(
                                                                `/scheduledEvent/${projectId}`
                                                            )
                                                            .set(
                                                                'Authorization',
                                                                authorization
                                                            )
                                                            .send(
                                                                scheduledEvent
                                                            );
                                                        return sentRequests;
                                                    }
                                                );

                                                await Promise.all(
                                                    createdScheduledEvents
                                                );
                                                done();
                                            });
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
        await ScheduledEventService.hardDeleteBy({ projectId });
        await MonitorService.hardDeleteBy({ _id: monitorId });
        await AirtableService.deleteUser(airtableId);
    });

    it('should not create a scheduled event when the fields are null', function(done) {
        const authorization = `Basic ${token}`;
        request
            .post(`/scheduledEvent/${projectId}`)
            .set('Authorization', authorization)
            .send({
                name: null,
                startDate: '',
                endDate: '',
                description: '',
            })
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('should not create a scheduled event when a monitor is selected multiple times', function(done) {
        const authorization = `Basic ${token}`;
        request
            .post(`/scheduledEvent/${projectId}`)
            .set('Authorization', authorization)
            .send({
                ...scheduledEvent,
                monitors: [monitorId, monitorId],
            })
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('should not create a scheduled event when the start date is greater than end date', function(done) {
        const authorization = `Basic ${token}`;
        request
            .post(`/scheduledEvent/${projectId}`)
            .set('Authorization', authorization)
            .send({
                ...scheduledEvent,
                startDate: '2019-09-11 11:01:52.178',
                endDate: '2019-06-26 11:31:53.302',
            })
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('should create a new scheduled event when proper fields are given by an authenticated user', function(done) {
        const authorization = `Basic ${token}`;
        request
            .post(`/scheduledEvent/${projectId}`)
            .set('Authorization', authorization)
            .send({ ...scheduledEvent, monitors: [monitorId] })
            .end(function(err, res) {
                scheduleEventId = res.body._id;
                expect(res).to.have.status(200);
                expect(res.body.name).to.be.equal(scheduledEvent.name);
                done();
            });
    });

    it('should get all scheduled events for a project', function(done) {
        const authorization = `Basic ${token}`;
        request
            .get(`/scheduledEvent/${projectId}`)
            .set('Authorization', authorization)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.be.an('array');
                expect(res.body.data).to.have.length.greaterThan(0);
                expect(res.body).to.have.property('count');
                expect(res.body.count).to.be.a('number');
                done();
            });
    });

    it('should update a scheduled event when scheduledEventId is valid', function(done) {
        const authorization = `Basic ${token}`;
        request
            .put(`/scheduledEvent/${projectId}/${scheduleEventId}`)
            .set('Authorization', authorization)
            .send({
                ...scheduledEvent,
                name: 'updated name',
            })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body.name).to.be.equal('updated name');
                done();
            });
    });

    it('should delete a scheduled event when scheduledEventId is valid', function(done) {
        const authorization = `Basic ${token}`;
        request
            .delete(`/scheduledEvent/${projectId}/${scheduleEventId}`)
            .set('Authorization', authorization)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('should get first 10 scheduled events with data length 10, skip 0, limit 10 and count 12', function(done) {
        const authorization = `Basic ${token}`;

        request
            .get(`/scheduledEvent/${projectId}?skip=0&limit=10`)
            .set('Authorization', authorization)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.be.an('array');
                expect(res.body.data).to.have.length(10);
                expect(res.body).to.have.property('count');
                expect(res.body.count)
                    .to.be.a('number')
                    .to.be.equal(12);
                expect(res.body).to.have.property('skip');
                expect(parseInt(res.body.skip))
                    .to.be.a('number')
                    .to.be.equal(0);
                expect(res.body).to.have.property('limit');
                expect(parseInt(res.body.limit))
                    .to.be.a('number')
                    .to.be.equal(10);
                done();
            });
    });

    it('should get 2 last scheduled events with data length 2, skip 10, limit 10 and count 12', function(done) {
        const authorization = `Basic ${token}`;
        request
            .get(`/scheduledEvent/${projectId}?skip=10&limit=10`)
            .set('Authorization', authorization)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.be.an('array');
                expect(res.body.data).to.have.length(2);
                expect(res.body).to.have.property('count');
                expect(res.body.count)
                    .to.be.a('number')
                    .to.be.equal(12);
                expect(res.body).to.have.property('skip');
                expect(parseInt(res.body.skip))
                    .to.be.a('number')
                    .to.be.equal(10);
                expect(res.body).to.have.property('limit');
                expect(parseInt(res.body.limit))
                    .to.be.a('number')
                    .to.be.equal(10);
                done();
            });
    });

    it('should get 0 scheduled events with data length 0, skip 20, limit 10 and count 12', function(done) {
        const authorization = `Basic ${token}`;
        request
            .get(`/scheduledEvent/${projectId}?skip=20&limit=10`)
            .set('Authorization', authorization)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.be.an('array');
                expect(res.body.data).to.have.length(0);
                expect(res.body).to.have.property('count');
                expect(res.body.count)
                    .to.be.an('number')
                    .to.be.equal(12);
                expect(res.body).to.have.property('skip');
                expect(parseInt(res.body.skip))
                    .to.be.an('number')
                    .to.be.equal(20);
                expect(res.body).to.have.property('limit');
                expect(parseInt(res.body.limit))
                    .to.be.an('number')
                    .to.be.equal(10);
                done();
            });
    });
});

describe('User from other project have access to read / write and delete API.', function() {
    this.timeout(20000);

    before(function(done) {
        this.timeout(40000);
        GlobalConfig.initTestConfig().then(function() {
            createUser(request, userData.user, function(err, res) {
                const project = res.body.project;
                projectId = project._id;
                createUser(request, userData.newUser, function(err, res) {
                    userId = res.body.id;
                    VerificationTokenModel.findOne({ userId }, function(
                        err,
                        verificationToken
                    ) {
                        request
                            .get(
                                `/user/confirmation/${verificationToken.token}`
                            )
                            .redirects(0)
                            .end(function() {
                                request
                                    .post('/user/login')
                                    .send({
                                        email: userData.newUser.email,
                                        password: userData.newUser.password,
                                    })
                                    .end(function(err, res) {
                                        token = res.body.tokens.jwtAccessToken;
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
    });

    it('should not be able to create new scheduled event', function(done) {
        const authorization = `Basic ${token}`;
        request
            .post(`/scheduledEvent/${projectId}`)
            .set('Authorization', authorization)
            .send(scheduledEvent)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });
    it('should not be able to delete a scheduled event', function(done) {
        const authorization = `Basic ${token}`;
        request
            .delete(`/scheduledEvent/${projectId}/${scheduleEventId}`)
            .set('Authorization', authorization)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });
    it('should not be able to get all scheduled events', function(done) {
        const authorization = `Basic ${token}`;
        request
            .get(`/scheduledEvent/${projectId}`)
            .set('Authorization', authorization)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });
    it('should not be able to update a scheduled event', function(done) {
        const authorization = `Basic ${token}`;
        request
            .put(`/scheduledEvent/${projectId}/${scheduleEventId}`)
            .set('Authorization', authorization)
            .send({
                ...scheduledEvent,
                name: 'Name update',
            })
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });
});
