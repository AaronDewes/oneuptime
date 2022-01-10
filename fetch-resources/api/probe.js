/**
 *
 * Copyright HackerBay, Inc.
 *
 */

const express = require('express');
const MonitorService = require('../services/monitorService');
const router = express.Router();
const isAuthorizedProbe = require('../middlewares/probeAuthorization')
    .isAuthorizedProbe;
const sendErrorResponse = require('../middlewares/response').sendErrorResponse;
const sendListResponse = require('../middlewares/response').sendListResponse;

router.get('/monitors', isAuthorizedProbe, async function(req, res) {
    try {
        const { limit = 10 } = req.query;
        const monitors = await MonitorService.getProbeMonitors(
            req.probe.id,
            limit,
            new Date(new Date().getTime() - 60 * 1000)
        );

        return sendListResponse(
            req,
            res,
            JSON.stringify(monitors),
            monitors.length
        );
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

module.exports = router;
