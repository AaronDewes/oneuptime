/**
 *
 * Copyright HackerBay, Inc.
 *
 */

const express = require('express');
const moment = require('moment');
const IncidentService = require('../services/incidentService');
const IncidentTimelineService = require('../services/incidentTimelineService');
const MonitorStatusService = require('../services/monitorStatusService');
const RealTimeService = require('../services/realTimeService');
const IncidentMessageService = require('../services/incidentMessageService');
const router = express.Router();

const { isAuthorized } = require('../middlewares/authorization');
const isUserAdmin = require('../middlewares/project').isUserAdmin;
const getUser = require('../middlewares/user').getUser;

const getSubProjects = require('../middlewares/subProject').getSubProjects;

const sendErrorResponse = require('../middlewares/response').sendErrorResponse;
const sendListResponse = require('../middlewares/response').sendListResponse;
const sendItemResponse = require('../middlewares/response').sendItemResponse;

// Route
// Description: Creating incident.
// Params:
// Param 1: req.headers-> {authorization}; req.user-> {id}; req.body-> {monitorId, projectId}
// Returns: 200: Incident, 400: Error; 500: Server Error.

router.post('/:projectId/:monitorId', getUser, isAuthorized, async function(
    req,
    res
) {
    try {
        const monitorId = req.params.monitorId;
        const projectId = req.params.projectId;
        const incidentType = req.body.incidentType;
        const incidentPriority = req.body.incidentPriority;
        const title = req.body.title;
        const description = req.body.description;
        const userId = req.user ? req.user.id : null;
        let oldIncidentsCount = null;

        if (!monitorId) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Monitor ID must be present.',
            });
        }

        if (typeof monitorId !== 'string') {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Monitor ID  is not in string type.',
            });
        }

        if (!projectId) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Project ID must be present.',
            });
        }

        if (typeof projectId !== 'string') {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Project ID  is not in string type.',
            });
        }

        if (!title) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Title must be present.',
            });
        }

        if (incidentType) {
            if (!['offline', 'online', 'degraded'].includes(incidentType)) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Invalid incident type.',
                });
            }
            oldIncidentsCount = await IncidentService.countBy({
                projectId,
                monitorId,
                incidentType,
                resolved: false,
                deleted: false,
            });
        } else {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'IncidentType must be present.',
            });
        }

        if (oldIncidentsCount && oldIncidentsCount > 0) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: `An unresolved incident of type ${incidentType} already exists.`,
            });
        }
        // Call the IncidentService
        const incident = await IncidentService.create({
            projectId,
            monitorId,
            createdById: userId,
            manuallyCreated: true,
            incidentType,
            title,
            description,
            incidentPriority,
        });
        await MonitorStatusService.create({
            monitorId,
            manuallyCreated: true,
            status: incidentType,
        });
        return sendItemResponse(req, res, incident);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route
// Description: Getting all the incidents by monitor Id.
// Params:
// Param 1: req.headers-> {authorization}; req.user-> {id}; req.params-> {monitorId}
// Returns: 200: incidents, 400: Error; 500: Server Error.
router.post(
    '/:projectId/monitor/:monitorId',
    getUser,
    isAuthorized,
    async function(req, res) {
        // include date range
        try {
            const { startDate, endDate } = req.body;
            let query = {
                monitorId: req.params.monitorId,
                projectId: req.params.projectId,
            };

            if (startDate && endDate) {
                const start = moment(startDate).toDate();
                const end = moment(endDate).toDate();
                query = {
                    monitorId: req.params.monitorId,
                    projectId: req.params.projectId,
                    createdAt: { $gte: start, $lte: end },
                };
            }

            const incidents = await IncidentService.findBy(
                query,
                req.body.limit || 3,
                req.body.skip || 0
            );
            const count = await IncidentService.countBy(query);
            return sendListResponse(req, res, incidents, count);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

// Fetch incidents by projectId
router.get('/:projectId', getUser, isAuthorized, getSubProjects, async function(
    req,
    res
) {
    try {
        const subProjectIds = req.user.subProjects
            ? req.user.subProjects.map(project => project._id)
            : null;
        const incidents = await IncidentService.getSubProjectIncidents(
            subProjectIds
        );
        return sendItemResponse(req, res, incidents); // frontend expects sendItemResponse
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get('/:projectId/incident', getUser, isAuthorized, async function(
    req,
    res
) {
    try {
        const projectId = req.params.projectId;
        const incident = await IncidentService.findBy(
            { projectId },
            req.query.limit || 10,
            req.query.skip || 0
        );
        const count = await IncidentService.countBy({ projectId });
        return sendListResponse(req, res, incident, count); // frontend expects sendListResponse
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route
// Description: Getting incident.
// Params:
// Param 1: req.headers-> {authorization}; req.user-> {id}; req.params-> {incidentId}
// Returns: 200: incidents, 400: Error; 500: Server Error.
router.get(
    '/:projectId/incident/:incidentId',
    getUser,
    isAuthorized,
    async function(req, res) {
        // Call the IncidentService.

        try {
            const incident = await IncidentService.findOneBy({
                _id: req.params.incidentId,
            });
            return sendItemResponse(req, res, incident);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

router.get(
    '/:projectId/timeline/:incidentId',
    getUser,
    isAuthorized,
    async function(req, res) {
        try {
            const incidentId = req.params.incidentId;
            const timeline = await IncidentTimelineService.findBy(
                { incidentId },
                req.query.skip || 0,
                req.query.limit || 10
            );
            const count = await IncidentTimelineService.countBy({ incidentId });
            return sendListResponse(req, res, timeline, count); // frontend expects sendListResponse
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

router.get(
    '/:projectId/unresolvedincidents',
    getUser,
    isAuthorized,
    getSubProjects,
    async function(req, res) {
        try {
            const subProjectIds = req.user.subProjects
                ? req.user.subProjects.map(project => project._id)
                : null;
            // Call the IncidentService.
            const userId = req.user ? req.user.id : null;
            const incident = await IncidentService.getUnresolvedIncidents(
                subProjectIds,
                userId
            );
            return sendItemResponse(req, res, incident);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

router.post(
    '/:projectId/acknowledge/:incidentId',
    getUser,
    isAuthorized,
    async function(req, res) {
        try {
            const userId = req.user ? req.user.id : null;
            // Call the IncidentService
            const incident = await IncidentService.acknowledge(
                req.params.incidentId,
                userId,
                req.user.name
            );
            return sendItemResponse(req, res, incident);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

// Route
// Description: Updating user who resolved incident.
// Params:
// Param 1: req.headers-> {authorization}; req.user-> {id}; req.body-> {incidentId, projectId}
// Returns: 200: incident, 400: Error; 500: Server Error.
router.post(
    '/:projectId/resolve/:incidentId',
    getUser,
    isAuthorized,
    async function(req, res) {
        try {
            const userId = req.user ? req.user.id : null;
            // Call the IncidentService
            const incident = await IncidentService.resolve(
                req.params.incidentId,
                userId
            );

            return sendItemResponse(req, res, incident);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

router.post(
    '/:projectId/close/:incidentId',
    getUser,
    isAuthorized,
    async function(req, res) {
        try {
            const userId = req.user ? req.user.id : null;
            // Call the IncidentService
            const incident = await IncidentService.close(
                req.params.incidentId,
                userId
            );
            return sendItemResponse(req, res, incident);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

// Routes
// Description: Updating internal and investigation notes.
// Params:
// Param 1: req.headers-> {authorization}; req.user-> {id}; req.body-> {incidentId, projectId, internalNote, investigationNote}
// Returns: 200: incident, 400: Error; 500: Server Error.
router.put(
    '/:projectId/incident/:incidentId',
    getUser,
    isAuthorized,
    async function(req, res) {
        try {
            const data = req.body;
            const incidentId = req.params.incidentId;

            if (data.internalNote && typeof data.internalNote !== 'string') {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Internal Note is not in string type.',
                });
            }

            if (
                data.investigationNote &&
                typeof data.investigationNote !== 'string'
            ) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Investigation note is not in string type.',
                });
            }
            // Call the IncidentService
            let incident = await IncidentService.findOneBy({ _id: incidentId });

            if (incident && incident._id) {
                const status =
                    (data.internalNote &&
                        (!incident.internalNote ||
                            (incident.internalNote &&
                                incident.internalNote === ''))) ||
                    (data.investigationNote &&
                        (!incident.investigationNote ||
                            (incident.investigationNote &&
                                incident.investigationNote === '')))
                        ? `${
                              data.internalNote ? 'internal' : 'investigation'
                          } notes added`
                        : `${
                              data.internalNote ? 'internal' : 'investigation'
                          } notes updated`;

                incident = await IncidentService.updateOneBy(
                    { _id: incident._id },
                    data
                );
                await IncidentTimelineService.create({
                    incidentId: incident._id,
                    createdById: req.user.id,
                    status,
                });

                incident = await IncidentService.findOneBy({
                    _id: incident._id,
                    projectId: incident.projectId,
                });
                await RealTimeService.updateIncidentNote(incident);
            }
            return sendItemResponse(req, res, incident);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

// update incident details
// title, description, priority and type
router.put(
    '/:projectId/incident/:incidentId/details',
    getUser,
    isAuthorized,
    async function(req, res) {
        const projectId = req.params.projectId;
        const incidentId = req.params.incidentId;
        const { title, description, incidentPriority } = req.body;

        const query = {
            title,
            description,
            incidentPriority,
        };

        if (!incidentId) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'incidentId must be set.',
            });
        }
        try {
            await IncidentService.updateOneBy(
                {
                    projectId,
                    _id: incidentId,
                },
                query
            );
            const incident = await IncidentService.findOneBy({
                projectId,
                _id: incidentId,
            });
            return sendItemResponse(req, res, incident);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);
router.post(
    '/:projectId/incident/:incidentId/message',
    getUser,
    isAuthorized,
    async function(req, res) {
        try {
            const data = req.body;
            const incidentId = req.params.incidentId;

            if (!data.content) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Incident Message is required.',
                });
            }
            if (typeof data.content !== 'string') {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Incident Message is not in string type.',
                });
            }

            if (!data.incident_state) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Incident State is required.',
                });
            }
            if (typeof data.incident_state !== 'string') {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Incident State is not in string type.',
                });
            }

            if (!data.id) {
                // this is a message creation Rquest
                if (!data.type) {
                    return sendErrorResponse(req, res, {
                        code: 400,
                        message: 'Incident Message type is required.',
                    });
                }
                if (typeof data.type !== 'string') {
                    return sendErrorResponse(req, res, {
                        code: 400,
                        message: 'Incident Message type is not in string type.',
                    });
                }

                if (!['investigation', 'internal'].includes(data.type)) {
                    return sendErrorResponse(req, res, {
                        code: 400,
                        message:
                            'Incident Message type is not of required types.',
                    });
                }
            }

            // Call the IncidentService
            const incident = await IncidentService.findOneBy({
                _id: incidentId,
            });

            if (!incident) {
                return sendErrorResponse(req, res, {
                    code: 404,
                    message: 'Incident not found.',
                });
            }

            // If the message ID is available, treat this as an update
            if (data.id) {
                // validate if Message ID exist or not
                const incidentMsg = await IncidentMessageService.findOneBy({
                    _id: data.id,
                });

                if (!incidentMsg) {
                    return sendErrorResponse(req, res, {
                        code: 404,
                        message: 'Incident Message not found.',
                    });
                }
            }
            let incidentMessage = null;
            if (incident && incident._id) {
                data.incidentId = incidentId;

                // handle creation or updating
                if (!data.id) {
                    data.createdById = req.user.id;
                    incidentMessage = await IncidentMessageService.create(data);
                } else {
                    const updatedMessage = {
                        content: data.content,
                        incident_state: data.incident_state,
                    };
                    incidentMessage = await IncidentMessageService.updateOneBy(
                        { _id: data.id },
                        updatedMessage
                    );
                }
                const status = `${incidentMessage.type} notes ${
                    data.id ? 'updated' : 'added'
                }`;

                // update timeline
                await IncidentTimelineService.create({
                    incidentId: incident._id,
                    createdById: req.user.id,
                    incident_state: data.incident_state,
                    status,
                });

                incidentMessage = await IncidentMessageService.findOneBy({
                    _id: incidentMessage._id,
                    incidentId: incidentMessage.incidentId,
                });
                await RealTimeService.updateIncidentNote(incident);
            }
            return sendItemResponse(req, res, incidentMessage);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);
router.delete(
    '/:projectId/incident/:incidentId/message/:incidentMessageId',
    getUser,
    isAuthorized,
    async function(req, res) {
        try {
            const { incidentId, incidentMessageId } = req.params;
            const incidentMessage = await IncidentMessageService.deleteBy(
                {
                    _id: incidentMessageId,
                    incidentId,
                },
                req.user.id
            );
            if (incidentMessage) {
                const status = `${incidentMessage.type} notes deleted`;
                // update timeline
                await IncidentTimelineService.create({
                    incidentId,
                    createdById: req.user.id,
                    status,
                });

                await RealTimeService.deleteIncidentNote(incidentMessage);
                return sendItemResponse(req, res, incidentMessage);
            } else {
                return sendErrorResponse(req, res, {
                    code: 404,
                    message: 'Incident Message not found',
                });
            }
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);
router.get(
    '/:projectId/incident/:incidentId/message',
    getUser,
    isAuthorized,
    async function(req, res) {
        let type = 'investigation';
        if (req.query.type && req.query.type === 'internal') {
            type = 'internal';
        }
        try {
            const incidentId = req.params.incidentId;
            const incidentMessages = await IncidentMessageService.findBy(
                { incidentId, type },
                req.query.skip || 0,
                req.query.limit || 10
            );
            const count = await IncidentMessageService.countBy({
                incidentId,
                type,
            });
            return sendListResponse(req, res, incidentMessages, count);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

router.delete('/:projectId/:incidentId', getUser, isUserAdmin, async function(
    req,
    res
) {
    try {
        const { projectId, incidentId } = req.params;
        const incident = await IncidentService.deleteBy(
            { _id: incidentId, projectId },
            req.user.id
        );
        if (incident) {
            return sendItemResponse(req, res, incident);
        } else {
            return sendErrorResponse(req, res, {
                message: 'Incident not found',
            });
        }
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route
// IMPORTANT: THIS API IS USED IN AN EMAIL.
// Description: Updating user who resolved incident.
// Params:
// Param 1: req.headers-> {authorization}; req.user-> {id}; req.body-> {incidentId, projectId}
// Returns: 200: incident, 400: Error; 500: Server Error.
router.get(
    '/:projectId/resolve/:incidentId',
    getUser,
    isAuthorized,
    async function(req, res) {
        try {
            const userId = req.user ? req.user.id : null;
            await IncidentService.resolve(req.params.incidentId, userId);
            return res.status(200).render('incidentAction.ejs', {
                title: 'Incident Resolved',
                title_message: 'Incident Resolved',
                body_message: 'Your incident is now resolved.',
                action: 'resolve',
                dashboard_url: global.dashboardHost + '/dashboard',
            });
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

// Route
// IMPORTANT: THIS API IS USED IN AN ALERT EMAIL.
// Description: Updating user who resolved incident.
// Params:
// Param 1: req.headers-> {authorization}; req.user-> {id}; req.body-> {incidentId, projectId}
// Returns: 200: incident, 400: Error; 500: Server Error.
router.get(
    '/:projectId/acknowledge/:incidentId',
    getUser,
    isAuthorized,
    async function(req, res) {
        try {
            const userId = req.user ? req.user.id : null;
            await IncidentService.acknowledge(
                req.params.incidentId,
                userId,
                req.user.name
            );
            return res.status(200).render('incidentAction.ejs', {
                title: 'Incident Acknowledged',
                title_message: 'Incident Acknowledged',
                body_message: 'Your incident is now acknowledged',
                action: 'acknowledge',
                dashboard_url: global.dashboardHost + '/dashboard',
            });
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

module.exports = router;
