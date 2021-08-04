process.env.PORT = 3020;
process.env.IS_SAAS_SERVICE = true;
const chai = require('chai');
const expect = require('chai').expect;
const userData = require('./data/user');
const app = require('../server');
chai.use(require('chai-http'));
const request = chai.request.agent(app);
const GlobalConfig = require('./utils/globalConfig');
const { createUser } = require('./utils/userSignUp');
const VerificationTokenModel = require('../backend/models/verificationToken');
const UserService = require('../backend/services/userService');
const ProjectService = require('../backend/services/projectService');
const GitCredentialService = require('../backend/services/gitCredentialService');
const AirtableService = require('../backend/services/airtableService');

describe('Git Credential API', function() {
    const timeout = 30000;
    let projectId, userId, token, credentialId;

    this.timeout(timeout);
    before(function(done) {
        GlobalConfig.initTestConfig().then(function() {
            createUser(request, userData.user, function(err, res) {
                const project = res.body.project;
                projectId = project._id;
                userId = res.body.id;

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
                                    done();
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
            email: userData.user.email,
        });
        await GitCredentialService.hardDeleteBy({
            projectId,
        });
        await AirtableService.deleteAll({ tableName: 'User' });
    });

    it('should add git credential', function(done) {
        const authorization = `Basic ${token}`;
        const gitUsername = 'username';
        const gitPassword = 'password';

        request
            .post(`/credential/${projectId}/gitCredential`)
            .set('Authorization', authorization)
            .send({
                gitUsername,
                gitPassword,
            })
            .end(function(err, res) {
                credentialId = res.body._id;
                expect(res).to.have.status(200);
                expect(res.body.gitUsername).to.be.equal(gitUsername);
                done();
            });
    });

    it('should update a git credential', function(done) {
        const authorization = `Basic ${token}`;
        const newGitUsername = 'newusername';

        request
            .put(`/credential/${projectId}/gitCredential/${credentialId}`)
            .set('Authorization', authorization)
            .send({
                gitUsername: newGitUsername,
            })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body.gitUsername).to.be.equal(newGitUsername);
                done();
            });
    });

    it('should get all the git credentials in a project', function(done) {
        const authorization = `Basic ${token}`;
        const gitUsername = 'anotherUsername';
        const gitPassword = 'password';

        request
            .post(`/credential/${projectId}/gitCredential`)
            .set('Authorization', authorization)
            .send({
                gitUsername,
                gitPassword,
            })
            .end(function() {
                request
                    .get(`/credential/${projectId}/gitCredential`)
                    .set('Authorization', authorization)
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('array');
                        done();
                    });
            });
    });

    it('should remove a git credential', function(done) {
        const authorization = `Basic ${token}`;

        request
            .delete(`/credential/${projectId}/gitCredential/${credentialId}`)
            .set('Authorization', authorization)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body._id).to.be.equal(credentialId);
                expect(res.body.deleted).to.be.true;
                done();
            });
    });

    it('should not create git credential with an existing git user in a project', function(done) {
        const authorization = `Basic ${token}`;
        const gitUsername = 'anotherUsername'; // an existing username
        const gitPassword = 'password';

        request
            .post(`/credential/${projectId}/gitCredential`)
            .set('Authorization', authorization)
            .send({
                gitUsername,
                gitPassword,
            })
            .end(function(err, res) {
                expect(res).to.have.status(400);
                expect(res.body.message).to.be.equal(
                    'Git Credential already exist in this project'
                );
                done();
            });
    });

    it('should not create git credential if git username is missing', function(done) {
        const authorization = `Basic ${token}`;
        const gitUsername = '';
        const gitPassword = 'password';

        request
            .post(`/credential/${projectId}/gitCredential`)
            .set('Authorization', authorization)
            .send({
                gitUsername,
                gitPassword,
            })
            .end(function(err, res) {
                expect(res).to.have.status(400);
                expect(res.body.message).to.be.equal(
                    'Git Username is required'
                );
                done();
            });
    });

    it('should not create git credential if git password is missing', function(done) {
        const authorization = `Basic ${token}`;
        const gitUsername = 'username';

        request
            .post(`/credential/${projectId}/gitCredential`)
            .set('Authorization', authorization)
            .send({
                gitUsername,
            })
            .end(function(err, res) {
                expect(res).to.have.status(400);
                expect(res.body.message).to.be.equal(
                    'Please provide a password'
                );
                done();
            });
    });

    it('should not remove a non-existing git credential', function(done) {
        const authorization = `Basic ${token}`;
        const credentialId = '5e8db97b2cc46e3a229ebc62'; // non-existing credential id

        request
            .delete(`/credential/${projectId}/gitCredential/${credentialId}`)
            .set('Authorization', authorization)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                expect(res.body.message).to.be.equal(
                    'Git Credential not found or does not exist'
                );
                done();
            });
    });
});
