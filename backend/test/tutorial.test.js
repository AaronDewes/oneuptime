/* eslint-disable linebreak-style, no-undef */

process.env.PORT = 3020;
const expect = require('chai').expect;
const userData = require('./data/user');
const chai = require('chai');
chai.use(require('chai-http'));
chai.use(require('chai-subset'));
const app = require('../server');
const GlobalConfig = require('./utils/globalConfig');
const request = chai.request.agent(app);
const { createUser } = require('./utils/userSignUp');
const UserService = require('../backend/services/userService');
const ProjectService = require('../backend/services/projectService');
const AirtableService = require('../backend/services/airtableService');

const VerificationTokenModel = require('../backend/models/verificationToken');

let projectId, userId, token;

describe('Tutorial API', function() {
    this.timeout(80000);

    before(async function() {
        this.timeout(120000);
        await GlobalConfig.initTestConfig();
        const res = await createUser(request, userData.user);
        const project = res.body.project;
        projectId = project._id;
        userId = res.body.id;

        const verificationToken = await VerificationTokenModel.findOne({
            userId,
        });
        await request
            .get(`/user/confirmation/${verificationToken.token}`)
            .redirects(0);

        const res1 = await request.post('/user/login').send({
            email: userData.user.email,
            password: userData.user.password,
        });
        token = res1.body.tokens.jwtAccessToken;
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
        await AirtableService.deleteAll({ tableName: 'User' });
    });

    it('should get the user tutorial status', async function() {
        const authorization = `Basic ${token}`;
        const res = await request
            .get('/tutorial')
            .set('Authorization', authorization);
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('data');
        expect(res.body._id).to.be.equal(userId);
    });

    it('should not update the user tutorial status if project id is not given', async function() {
        const authorization = `Basic ${token}`;
        const res = await request
            .put('/tutorial')
            .set('Authorization', authorization)
            .send({
                type: 'monitor',
            });
        expect(res).to.have.status(400);
        expect(res.body.message).to.be.equal(`Project ID can't be null`);
    });

    it('should update the user custom component tutorial status per project', async function() {
        const authorization = `Basic ${token}`;
        const type = 'component';
        const res = await request
            .put('/tutorial')
            .set('Authorization', authorization)
            .send({
                type,
                projectId,
            });
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('data');
        expect(res.body.data[projectId]).to.be.an('object');
        expect(res.body.data[projectId][type]).to.be.an('object');
        expect(res.body.data[projectId][type].show).to.be.equal(false);
    });

    it('should update the user custom team memb er tutorial status per project', async function() {
        const authorization = `Basic ${token}`;
        const type = 'teamMember';
        const res = await request
            .put('/tutorial')
            .set('Authorization', authorization)
            .send({
                type,
                projectId,
            });
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('data');
        expect(res.body.data[projectId]).to.be.an('object');
        expect(res.body.data[projectId][type]).to.be.an('object');
        expect(res.body.data[projectId][type].show).to.be.equal(false);
    });

    it('should get the user tutorial status for a project', async function() {
        const authorization = `Basic ${token}`;
        const res = await request
            .get('/tutorial')
            .set('Authorization', authorization);
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('data');
        expect(res.body._id).to.be.equal(userId);
        expect(res.body.data[projectId]).to.be.an('object');
        expect(res.body.data[projectId].component.show).to.be.equal(false);
        expect(res.body.data[projectId].teamMember.show).to.be.equal(false);
    });

    it('should update the user status page tutorial status per project', async function() {
        const authorization = `Basic ${token}`;
        const type = 'statusPage';
        const res = await request
            .put('/tutorial')
            .set('Authorization', authorization)
            .send({
                type,
                projectId,
            });
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('data');
        expect(res.body.data[projectId]).to.be.an('object');
        expect(res.body.data[projectId][type]).to.be.an('object');
        expect(res.body.data[projectId][type].show).to.be.equal(false);
    });
});
