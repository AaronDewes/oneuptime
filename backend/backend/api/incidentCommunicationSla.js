const express = require('express');
const { debug } = require('winston');
const getUser = require('../middlewares/user').getUser;
const { isAuthorized } = require('../middlewares/authorization');
const sendErrorResponse = require('../middlewares/response').sendErrorResponse;
const sendItemResponse = require('../middlewares/response').sendItemResponse;
const sendListResponse = require('../middlewares/response').sendListResponse;
const IncidentCommunicationSlaService = require('../services/incidentCommunicationSlaService');

const router = express.Router();

router.get('/:projectId', getUser, isAuthorized, async function(req, res) {
    try {
        const { projectId } = req.params;
        const incidentSlas = await IncidentCommunicationSlaService.findBy({
            projectId,
        });
        const count = await IncidentCommunicationSlaService.countBy({
            projectId,
        });

        return sendListResponse(req, res, incidentSlas, count);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.post('/:projectId', getUser, isAuthorized, async function(req, res) {
    try {
        const { projectId } = req.params;
        const { name, monitors, alertTime, duration } = req.body;

        if (!name || !name.trim()) {
            const error = new Error('SLA name is required');
            error.code = 400;
            return sendErrorResponse(req, res, error);
        }

        if (!monitors || monitors.length === 0) {
            const error = new Error(
                'You need at least one monitor to create an incident SLA'
            );
            error.code = 400;
            return sendErrorResponse(req, res, error);
        }

        if (duration && isNaN(duration)) {
            const error = new Error('Please use numeric values for duration');
            error.code = 400;
            return sendErrorResponse(req, res, error);
        }

        if (!alertTime || !alertTime.trim()) {
            const error = new Error('Please set alert time for this SLA');
            error.code = 400;
            return sendErrorResponse(req, res, error);
        }

        if (isNaN(alertTime)) {
            const error = new Error('Please use numeric values for alert time');
            error.code = 400;
            return sendErrorResponse(req, res, error);
        }

        if (Number(alertTime) >= Number(duration)) {
            const error = new Error(
                'Alert time should be always less than duration'
            );
            error.code = 400;
            return sendErrorResponse(req, res, error);
        }

        const data = { ...req.body };
        data.projectId = projectId;
        const incidentSla = await IncidentCommunicationSlaService.create(data);
        return sendItemResponse(req, res, incidentSla);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.put('/:projectId/:incidentSlaId', getUser, isAuthorized, async function(
    req,
    res
) {
    try {
        const { projectId, incidentSlaId } = req.params;
        const { name, monitors, handleDefault, alertTime, duration } = req.body;

        if (!handleDefault && (!name || !name.trim())) {
            const error = new Error('SLA name is required');
            error.code = 400;
            return sendErrorResponse(req, res, error);
        }

        if (!handleDefault && (!monitors || monitors.length === 0)) {
            const error = new Error(
                'You need at least one monitor to update an incident SLA'
            );
            error.code = 400;
            return sendErrorResponse(req, res, error);
        }

        if (!handleDefault && duration && isNaN(duration)) {
            const error = new Error('Please use numeric values for duration');
            error.code = 400;
            return sendErrorResponse(req, res, error);
        }

        if (!handleDefault && (!alertTime || !alertTime.trim())) {
            const error = new Error('Please set alert time for this SLA');
            error.code = 400;
            return sendErrorResponse(req, res, error);
        }

        if (!handleDefault && isNaN(alertTime)) {
            const error = new Error('Please use numeric values for alert time');
            error.code = 400;
            return sendErrorResponse(req, res, error);
        }

        if (!handleDefault && Number(alertTime) >= Number(duration)) {
            const error = new Error(
                'Alert time should be always less than duration'
            );
            error.code = 400;
            return sendErrorResponse(req, res, error);
        }

        const data = { ...req.body };
        const incidentSla = await IncidentCommunicationSlaService.updateOneBy(
            { projectId, _id: incidentSlaId },
            data
        );
        return sendItemResponse(req, res, incidentSla);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.delete(
    '/:projectId/:incidentSlaId',
    getUser,
    isAuthorized,
    async function(req, res) {
        try {
            const { projectId, incidentSlaId } = req.params;

            const deletedIncidentSla = await IncidentCommunicationSlaService.deleteBy(
                {
                    _id: incidentSlaId,
                    projectId,
                }
            );
            return sendItemResponse(req, res, deletedIncidentSla);
        } catch (error) {
            return sendErrorResponse(error);
        }
    }
);

module.exports = router;
