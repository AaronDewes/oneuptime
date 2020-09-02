/* eslint-disable no-undef */

process.env.PORT = 3020;
const expect = require('chai').expect;
const userData = require('./data/user');
const chai = require('chai');
chai.use(require('chai-http'));
const app = require('../server');
const request = chai.request.agent(app);
const { createUser } = require('./utils/userSignUp');
const UserService = require('../backend/services/userService');
const IncidentSettings = require('../backend/services/incidentSettingsService');
const ProjectService = require('../backend/services/projectService');
const {
    incidentDefaultSettings,
} = require('../backend/config/incidentDefaultSettings');
const VerificationTokenModel = require('../backend/models/verificationToken');
const GlobalConfig = require('./utils/globalConfig');

let token, userId, projectId, defaultIncidentPriorityId;

describe('Incident Priority API', function() {
    this.timeout(500000);
    before(function(done) {
        this.timeout(90000);
        GlobalConfig.initTestConfig().then(function() {
            createUser(request, userData.user, function(err, res) {
                projectId = res.body.project._id;
                userId = res.body.id;
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
                                    done();
                                });
                        });
                });
            });
        });
    });

    after(async function() {
        await GlobalConfig.removeTestConfig();
        await IncidentSettings.hardDeleteBy({ projectId: projectId });
        await UserService.hardDeleteBy({ _id: userId });
        await ProjectService.hardDeleteBy({ _id: projectId });
    });

    it('Should return the list of the available variables.', async () => {
        const authorization = `Basic ${token}`;
        const res = await request
            .get(`/incidentPriorities/${projectId}`)
            .set('Authorization', authorization);
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.count).to.eql(2);
        expect(res.body.data).to.be.an('array');
        expect(res.body.data.length).to.eql(2);
        expect(res.body.data[0]).to.have.property('_id');
        defaultIncidentPriorityId = res.body.data[0]._id;
        expect(res.body.data[0]).to.have.property('name');
        expect(res.body.data[0].name).to.eql('High');
        expect(res.body.data[1]).to.have.property('name');
        expect(res.body.data[1].name).to.eql('Low');
    });

    it('Should not remove the default incident priority.', (done) => {
        const authorization = `Basic ${token}`;
        request
            .delete(`/incidentPriorities/${projectId}`)
            .set('Authorization', authorization)
            .send({_id: defaultIncidentPriorityId})
            .end((error,res) => {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('Should create a new incident priority.', async () => {
        const authorization = `Basic ${token}`;
        let res = await request
            .post(`/incidentPriorities/${projectId}`)
            .set('Authorization', authorization)
            .send({
              name:'Intermediate',
              color:{
                r: 255,
                g: 255,
                b: 0,
                a:1,
              }
            });
        expect(res).to.have.status(200);
        res = await request
            .get(`/incidentPriorities/${projectId}`)
            .set('Authorization', authorization);
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.count).to.eql(3);
        expect(res.body.data).to.be.an('array');
        expect(res.body.data.length).to.eql(3);
        expect(res.body.data[2]).to.have.property('_id');
        newIncidentPriorityId= res.body.data[2]._id;
        expect(res.body.data[2]).to.have.property('name');
        expect(res.body.data[2].name).to.eql('Intermediate');
    });

    it('Should update priority.', async () => {
      const newIncidentPriorityName = 'Intermediate Updated';
      const authorization = `Basic ${token}`;
      let res = await request
          .put(`/incidentPriorities/${projectId}`)
          .set('Authorization', authorization)
          .send({
            _id: newIncidentPriorityId,
            name: newIncidentPriorityName,
            color:{
              r: 255,
              g: 255,
              b: 0,
              a:1,
            }
          });

      expect(res).to.have.status(200);
      res = await request
          .get(`/incidentPriorities/${projectId}`)
          .set('Authorization', authorization);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body.count).to.eql(3);
      expect(res.body.data[2].name).to.eql(newIncidentPriorityName);

    });
});
