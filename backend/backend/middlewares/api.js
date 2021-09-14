/**
 *
 * Copyright HackerBay, Inc.
 *
 */
const mongoose = require('../config/db');
const ProjectService = require('../services/projectService');
const sendErrorResponse = require('../middlewares/response').sendErrorResponse;
const ObjectID = mongoose.Types.ObjectId;
const MonitorService = require('../services/monitorService');

module.exports = {
    // Description: Checking if user is authorized to access the page and decode jwt to get user data.
    // Params:
    // Param 1: req.headers-> {token}
    // Returns: 400: User is unauthorized since unauthorized token was present.
    isValidProjectIdAndApiKey: async function(req, res, next) {
        //get project id
        let projectId, apiKey;

        if (req.params.projectId) {
            projectId = req.params.projectId;
        } else if (req.query.projectId) {
            projectId = req.query.projectId;
        } else if (req.headers['projectId']) {
            projectId = req.headers['projectId'];
        } else if (req.body.projectId) {
            projectId = req.body.projectId;
        } else {
            if (res) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Project ID not found.',
                });
            } else {
                return false;
            }
        }

        if (req.query.apiKey) {
            apiKey = req.query.apiKey;
        } else if (req.headers.apikey) {
            apiKey = req.headers.apikey;
        } else if (req.body.apiKey) {
            apiKey = req.body.apiKey;
        } else {
            if (res) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'API Key not found.',
                });
            } else {
                return false;
            }
        }

        const projectCount = await ProjectService.countBy({
            _id: projectId,
            apiKey: apiKey,
        });

        if (projectCount > 0) {
            req.authorizationType = 'API';

            //set user Id to API.

            req.user = {};
            req.user.id = 'API';

            if (next) return next();
            else return true;
        } else {
            if (res) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message:
                        'No Project found with this API Key and Project ID.',
                });
            } else {
                return false;
            }
        }
    },

    isValidProjectId: function(projectId) {
        if (!ObjectID.isValid(projectId)) {
            return false;
        }
        return true;
    },
    hasAPIKey: function(req) {
        if (req.query.apiKey) {
            return true;
        } else if (req.headers.apikey || req.headers.apiKey) {
            return true;
        } else if (req.body.apiKey) {
            return true;
        }

        return false;
    },

    getProjectId: function(req) {
        // Get Project Id, If Available
        let projectId;

        if (req.params && req.params.projectId) {
            projectId = req.params.projectId;
        } else if (req.query && req.query.projectId) {
            projectId = req.query.projectId;
        } else if (req.headers && req.headers['projectId']) {
            projectId = req.headers['projectId'];
        } else if (req.body && req.body.projectId) {
            projectId = req.body.projectId;
        } else {
            return null;
        }

        return projectId;
    },

    getStatusPageId: function(req) {
        const statusPageId =
            req.params.statusPageId ||
            req.query.statusPageId ||
            req.headers['statusPageId'] ||
            req.body.statusPageId;

        return statusPageId;
    },

    getStatusPageSlug: function(req) {
        const statusPageSlug =
            req.params.statusPageSlug ||
            req.query.statusPageSlug ||
            req.headers['statusPageSlug'] ||
            req.body.statusPageSlug;

        return statusPageSlug;
    },

    getStatusPageUrl: function(req) {
        const statusPageUrl =
            req.params.url ||
            req.query.url ||
            req.headers['url'] ||
            req.body.url;

        return statusPageUrl;
    },

    isValidMonitor: async function(req, res, next) {
        const id = req.params.id;
        let monitor = await MonitorService.findBy({
            query: {
                type: 'incomingHttpRequest',
                'data.link': `${global.apiHost}/incomingHttpRequest/${id}`,
            },
            select: 'lastPingTime criteria type _id',
        });
        if (monitor && monitor.length) {
            monitor = monitor && monitor[0] ? monitor[0] : monitor;
            if (monitor && monitor.disabled) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message:
                        'Sorry this monitor is disabled. Please enable it to start monitoring again.',
                });
            } else {
                req.monitor = monitor;
                return next();
            }
        } else {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'No Monitor found with this ID.',
            });
        }
    },
};
