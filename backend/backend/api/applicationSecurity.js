const express = require('express');
const getUser = require('../middlewares/user').getUser;
const { isAuthorized } = require('../middlewares/authorization');
const sendErrorResponse = require('../middlewares/response').sendErrorResponse;
const sendItemResponse = require('../middlewares/response').sendItemResponse;
const ApplicationSecurityService = require('../services/applicationSecurityService');
const ProbeService = require('../services/probeService');
const RealTimeService = require('../services/realTimeService');

const router = express.Router();

//Route: POST
//Description: creates a new application security
//Param: req.params -> {projectId, componentId}
//Param: req.body -> {name, gitRepositoryUrl, gitCredential}
//returns: response -> {applicationSecurity, error}
router.post(
    '/:projectId/:componentId/application',
    getUser,
    isAuthorized,
    async (req, res) => {
        try {
            const data = req.body;
            data.componentId = req.params.componentId;

            if (!data) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Values should not be null',
                });
            }

            if (!data.name || !data.name.trim()) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Application Security Name is required',
                });
            }

            if (!data.gitRepositoryUrl || !data.gitRepositoryUrl.trim()) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Git Repository URL is required',
                });
            }

            if (!data.gitCredential || !data.gitCredential.trim()) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Git Credential is required',
                });
            }
            if (
                data.resourceCategoryId &&
                typeof data.resourceCategoryId !== 'string'
            ) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Resource Category ID is not of string type.',
                });
            }

            const applicationSecurity = await ApplicationSecurityService.create(
                data
            );
            RealTimeService.sendApplicationSecurityCreated(applicationSecurity);
            return sendItemResponse(req, res, applicationSecurity);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

//Route: PUT
//Description: updates a particular application security
//Param: req.params -> {projectId, componentId, applicationSecurityId}
//Param: req.body -> {name?, gitRepositoryUrl?, gitCredential?}
//returns: response -> {applicationSecurity, error}
router.put(
    '/:projectId/:componentId/application/:applicationSecurityId',
    getUser,
    isAuthorized,
    async (req, res) => {
        try {
            const { componentId, applicationSecurityId } = req.params;
            const { name, gitRepositoryUrl, gitCredential } = req.body;
            const data = {};

            if (name) {
                data.name = name;
            }

            if (gitRepositoryUrl) {
                data.gitRepositoryUrl = gitRepositoryUrl;
            }

            if (gitCredential) {
                data.gitCredential = gitCredential;
            }

            const applicationSecurity = await ApplicationSecurityService.updateOneBy(
                { _id: applicationSecurityId, componentId },
                data
            );
            return sendItemResponse(req, res, applicationSecurity);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

//Route: GET
//Description: get a particular application security in a component
//Param: req.params -> {projectId, componentId, applicationSecurityId}
//returns: response -> {applicationSecurity, error}
router.get(
    '/:projectId/:componentId/application/:applicationSecurityId',
    getUser,
    isAuthorized,
    async (req, res) => {
        try {
            const { applicationSecurityId } = req.params;
            const applicationSecurity = await ApplicationSecurityService.findOneBy(
                {
                    _id: applicationSecurityId,
                }
            );

            if (!applicationSecurity) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Application security not found or does not exist',
                });
            }

            return sendItemResponse(req, res, applicationSecurity);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

//Route: GET
//Description: get all application security in a component
//Param: req.params -> {projectId, componentId}
//returns: response -> {applicationSecurities, error}
router.get(
    '/:projectId/:componentId/application',
    getUser,
    isAuthorized,
    async (req, res) => {
        try {
            const { componentId } = req.params;
            const applicationSecurities = await ApplicationSecurityService.findBy(
                {
                    componentId,
                }
            );

            return sendItemResponse(req, res, applicationSecurities);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

//Route: DELETE
//Description: delete a particular application security in a component
//Param: req.params -> {projectId, componentId, applicationSecurityId}
//returns: response -> {deletedApplicationSecurity, error}
router.delete(
    '/:projectId/:componentId/application/:applicationSecurityId',
    getUser,
    isAuthorized,
    async (req, res) => {
        try {
            const { applicationSecurityId } = req.params;

            const deletedApplicationSecurity = await ApplicationSecurityService.deleteBy(
                { _id: applicationSecurityId }
            );
            return sendItemResponse(req, res, deletedApplicationSecurity);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

//Route: DELETE
//Description: delete all application security in a component
//Param: req.params -> {projectId, componentId}
//returns: response -> {response, error}
router.delete(
    '/:projectId/:componentId/application',
    getUser,
    isAuthorized,
    async (req, res) => {
        try {
            const { componentId } = req.params;

            const response = await ApplicationSecurityService.hardDelete({
                componentId,
            });
            return sendItemResponse(req, res, response);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

//Route: GET
//Description: get a particular security with a particular credential
//Param: req.params -> {projectId, credentialId} credentialId -> git credential Id
//returns: response -> {sendItemResponse, sendErrorResponse}
router.get(
    '/:projectId/application/:credentialId',
    getUser,
    isAuthorized,
    async (req, res) => {
        try {
            const { credentialId } = req.params;
            const response = await ApplicationSecurityService.findBy({
                gitCredential: credentialId,
            });

            return sendItemResponse(req, res, response);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

//Route: POST
//Description: scan a particular application
//Params: req.params -> {projectId, applicationSecurityId}
//returns: response -> {sendItemResponse, sendErrorResponse}
router.post(
    '/:projectId/application/scan/:applicationSecurityId',
    getUser,
    isAuthorized,
    async (req, res) => {
        try {
            const { applicationSecurityId } = req.params;
            let applicationSecurity = await ApplicationSecurityService.findOneBy(
                { _id: applicationSecurityId }
            );

            if (!applicationSecurity) {
                const error = new Error(
                    'Application Security not found or does not exist'
                );
                error.code = 400;
                return sendErrorResponse(req, res, error);
            }

            // decrypt password
            applicationSecurity = await ApplicationSecurityService.decryptPassword(
                applicationSecurity
            );

            const securityLog = await ProbeService.scanApplicationSecurity(
                applicationSecurity
            );

            global.io.emit(
                `securityLog_${applicationSecurity._id}`,
                securityLog
            );
            return sendItemResponse(req, res, securityLog);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

module.exports = router;
