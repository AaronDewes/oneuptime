process.env.PORT = 3020;
process.env.NODE_ENV = 'development';
const expect = require('chai').expect;
const userData = require('./data/user');
const incidentData = require('./data/incident');
const chai = require('chai');
chai.use(require('chai-http'));
const app = require('../server');

const request = chai.request.agent(app);
const { createUser } = require('./utils/userSignUp');
const UserService = require('../backend/services/userService');
const UserModel = require('../backend/models/user');
const IncidentService = require('../backend/services/incidentService');
const GlobalConfig = require('./utils/globalConfig');
const ProjectService = require('../backend/services/projectService');
const StatusPageService = require('../backend/services/statusPageService');
const MonitorService = require('../backend/services/monitorService');
const AlertService = require('../backend/services/alertService');
const AirtableService = require('../backend/services/airtableService');
const NotificationService = require('../backend/services/notificationService');
const ComponentModel = require('../backend/models/component');

let token, userId, projectId, subProjectId, incidentId, alertId, monitorId;

const monitor = {
    name: 'New Monitor',
    type: 'url',
    data: { url: 'http://www.tests.org' },
};

describe('Alert API', function() {
    describe('Alert API without subprojects', function() {
        this.timeout(30000);

        before(function(done) {
            this.timeout(30000);
            GlobalConfig.initTestConfig().then(function() {
                createUser(request, userData.user, function(err, res) {
                    const project = res.body.project;
                    projectId = project._id;
                    userId = res.body.id;

                    ComponentModel.create({ name: 'Test Component' }).then(
                        component => {
                            UserModel.findByIdAndUpdate(
                                userId,
                                { $set: { isVerified: true } },
                                function() {
                                    request
                                        .post('/user/login')
                                        .send({
                                            email: userData.user.email,
                                            password: userData.user.password,
                                        })
                                        .end(function(err, res) {
                                            token =
                                                res.body.tokens.jwtAccessToken;
                                            const authorization = `Basic ${token}`;
                                            request
                                                .post(`/monitor/${projectId}`)
                                                .set(
                                                    'Authorization',
                                                    authorization
                                                )
                                                .send({
                                                    ...monitor,
                                                    componentId: component._id,
                                                })
                                                .end(function(err, res) {
                                                    monitorId = res.body._id;
                                                    incidentData.monitors = [
                                                        monitorId,
                                                    ];
                                                    expect(res).to.have.status(
                                                        200
                                                    );
                                                    expect(
                                                        res.body.name
                                                    ).to.be.equal(monitor.name);

                                                    done();
                                                });
                                        });
                                }
                            );
                        }
                    );
                });
            });
        });

        after(async function() {
            await StatusPageService.hardDeleteBy({ projectId: projectId });
            await NotificationService.hardDeleteBy({ projectId: projectId });
            await AlertService.hardDeleteBy({ _id: alertId });
            await GlobalConfig.removeTestConfig();
            await AirtableService.deleteAll({ tableName: 'User' });
        });

        // 'post /:projectId'
        it('should register with valid projectId, monitorId, incidentId, alertVia', function(done) {
            const authorization = `Basic ${token}`;
            request
                .post(`/incident/${projectId}/create-incident`)
                .set('Authorization', authorization)
                .send(incidentData)
                .end(function(err, res) {
                    incidentId = res.body._id;
                    monitorId = res.body.monitorId._id;
                    request
                        .post(`/alert/${res.body.projectId}`)
                        .set('Authorization', authorization)
                        .send({
                            monitorId,
                            alertVia: 'email',
                            incidentId: incidentId,
                            eventType: 'identified',
                        })
                        .end(function(err, res) {
                            alertId = res.body._id;
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.an('object');
                            done();
                        });
                });
        });

        it('should get an array of alerts by valid projectId', function(done) {
            const authorization = `Basic ${token}`;
            request
                .get(`/alert/${projectId}/alert`)
                .set('Authorization', authorization)
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('data');
                    expect(res.body).to.have.property('count');
                    done();
                });
        });

        it('should get an array alerts of by valid incidentId', function(done) {
            const authorization = `Basic ${token}`;
            request
                .get(`/alert/${projectId}/incident/${incidentId}`)
                .set('Authorization', authorization)
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('data');
                    expect(res.body).to.have.property('count');
                    done();
                });
        });

        it('should deleted alert', function(done) {
            const authorization = `Basic ${token}`;
            request
                .delete(`/alert/${projectId}`)
                .set('Authorization', authorization)
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    done();
                });
        });

        it('should not delete alert with non-existing projectId', function(done) {
            const authorization = `Basic ${token}`;
            request
                .delete('/alert/5f71e52737c855f7c5b347d3')
                .set('Authorization', authorization)
                .end(function(err, res) {
                    expect(res).to.have.status(400);
                    done();
                });
        });
    });

    let newUserToken;

    describe('Alert API with Sub-Projects', function() {
        this.timeout(40000);
        before(function(done) {
            this.timeout(30000);
            const authorization = `Basic ${token}`;
            // create a subproject for parent project
            GlobalConfig.initTestConfig().then(function() {
                request
                    .post(`/project/${projectId}/subProject`)
                    .set('Authorization', authorization)
                    .send({ subProjectName: 'New SubProject' })
                    .end(function(err, res) {
                        subProjectId = res.body[0]._id;
                        // sign up second user (subproject user)
                        createUser(request, userData.newUser, function(
                            err,
                            res
                        ) {
                            userId = res.body.id;
                            UserModel.findByIdAndUpdate(
                                userId,
                                { $set: { isVerified: true } },
                                function() {
                                    request
                                        .post('/user/login')
                                        .send({
                                            email: userData.newUser.email,
                                            password: userData.newUser.password,
                                        })
                                        .end(function(err, res) {
                                            newUserToken =
                                                res.body.tokens.jwtAccessToken;
                                            const authorization = `Basic ${token}`;
                                            // add second user to subproject
                                            request
                                                .post(`/team/${subProjectId}`)
                                                .set(
                                                    'Authorization',
                                                    authorization
                                                )
                                                .send({
                                                    emails:
                                                        userData.newUser.email,
                                                    role: 'Member',
                                                })
                                                .end(function() {
                                                    done();
                                                });
                                        });
                                }
                            );
                        });
                    });
            });
        });

        after(async function() {
            await ProjectService.hardDeleteBy({
                _id: { $in: [projectId, subProjectId] },
            });
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
            await IncidentService.hardDeleteBy({ _id: incidentId });
            await AlertService.hardDeleteBy({ _id: alertId });
            await GlobalConfig.removeTestConfig();
        });

        it('should not create alert for user not in the project.', function(done) {
            createUser(request, userData.anotherUser, function(err, res) {
                userId = res.body.id;
                UserModel.findByIdAndUpdate(
                    userId,
                    { $set: { isVerified: true } },
                    function() {
                        request
                            .post('/user/login')
                            .send({
                                email: userData.anotherUser.email,
                                password: userData.anotherUser.password,
                            })
                            .end(function(err, res) {
                                const authorization = `Basic ${res.body.tokens.jwtAccessToken}`;
                                request
                                    .post(`/alert/${projectId}`)
                                    .set('Authorization', authorization)
                                    .send({
                                        monitorId: monitorId,
                                        alertVia: 'email',
                                        incidentId: incidentId,
                                    })
                                    .end(function(err, res) {
                                        alertId = res.body._id;
                                        expect(res).to.have.status(400);
                                        expect(res.body.message).to.be.equal(
                                            'You are not present in this project.'
                                        );
                                        done();
                                    });
                            });
                    }
                );
            });
        });

        it('should create alert in parent project', function(done) {
            const authorization = `Basic ${token}`;
            request
                .post(`/alert/${projectId}`)
                .set('Authorization', authorization)
                .send({
                    monitorId: monitorId,
                    alertVia: 'email',
                    incidentId: incidentId,
                    eventType: 'identified',
                })
                .end(function(err, res) {
                    alertId = res.body._id;
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    done();
                });
        });

        it('should create alert in sub-project', function(done) {
            const authorization = `Basic ${newUserToken}`;
            request
                .post(`/alert/${subProjectId}`)
                .set('Authorization', authorization)
                .send({
                    monitorId: monitorId,
                    alertVia: 'email',
                    incidentId: incidentId,
                    eventType: 'identified',
                })
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    done();
                });
        });

        it('should get only sub-project alerts for valid user.', function(done) {
            const authorization = `Basic ${newUserToken}`;
            request
                .get(`/alert/${subProjectId}/alert`)
                .set('Authorization', authorization)
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('data');
                    expect(res.body).to.have.property('count');
                    done();
                });
        });

        it('should get both project and sub-project alerts for valid user.', function(done) {
            const authorization = `Basic ${token}`;
            request
                .get(`/alert/${projectId}`)
                .set('Authorization', authorization)
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body[0]).to.have.property('alerts');
                    expect(res.body[0]).to.have.property('count');
                    expect(res.body[0]._id).to.be.equal(subProjectId);
                    expect(res.body[1]._id).to.be.equal(projectId);
                    done();
                });
        });

        it('should delete sub-project alert', function(done) {
            const authorization = `Basic ${token}`;
            request
                .delete(`/alert/${subProjectId}`)
                .set('Authorization', authorization)
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    done();
                });
        });

        it('should delete project alert', function(done) {
            const authorization = `Basic ${token}`;
            request
                .delete(`/alert/${projectId}`)
                .set('Authorization', authorization)
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });
});
