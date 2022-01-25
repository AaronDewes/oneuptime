process.env.PORT = 3002;
const expect = require('chai').expect;
const userData = require('./data/user');
const chai = require('chai');
chai.use(require('chai-http'));
const app = require('../server');
const GlobalConfig = require('./utils/globalConfig');
const request = chai.request.agent(app);
const { createEnterpriseUser } = require('./utils/userSignUp');
const UserService = require('../backend/services/userService');
const ProjectService = require('../backend/services/projectService');
const MonitorService = require('../backend/services/monitorService');

const ComponentModel = require('../backend/models/component');

let token, projectId, newProjectId, monitorId;

describe('Enterprise Monitor API', function() {
    this.timeout(30000);

    before(function(done) {
        this.timeout(40000);
        GlobalConfig.initTestConfig().then(function() {
            createEnterpriseUser(request, userData.user, function(err, res) {
                const project = res.body.project;
                projectId = project._id;

                request
                    .post('/user/login')
                    .send({
                        email: userData.user.email,
                        password: userData.user.password,
                    })
                    .end(function(err, res) {
                        token = res.body.tokens.jwtAccessToken;
                        done();
                    });
            });
        });
    });

    after(async function() {
        await GlobalConfig.removeTestConfig();
        await ProjectService.hardDeleteBy({
            _id: { $in: [projectId, newProjectId] },
        });
        await MonitorService.hardDeleteBy({ _id: monitorId });
        await UserService.hardDeleteBy({
            email: userData.user.email.toLowerCase(),
        });
    });

    it('should create a new monitor for project with no billing plan', function(done) {
        const authorization = `Basic ${token}`;

        ComponentModel.create({ name: 'Test Component' }).then(component => {
            request
                .post('/project/create')
                .set('Authorization', authorization)
                .send({
                    projectName: 'Test Project',
                })
                .end(function(err, res) {
                    newProjectId = res.body._id;
                    request
                        .post(`/monitor/${newProjectId}`)
                        .set('Authorization', authorization)
                        .send({
                            name: 'New Monitor',
                            type: 'url',
                            data: { url: 'http://www.tests.org' },
                            componentId: component._id,
                        })
                        .end(function(err, res) {
                            monitorId = res.body._id;
                            expect(res).to.have.status(200);
                            expect(res.body.name).to.be.equal('New Monitor');
                            done();
                        });
                });
        });
    });
});
