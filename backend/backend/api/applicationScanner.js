/**
 *
 * Copyright HackerBay, Inc.
 *
 */

const express = require('express');
const ApplicationSecurityService = require('../services/applicationSecurityService');
const ApplicationSecurityLogService = require('../services//applicationSecurityLogService');
const router = express.Router();
const isAuthorizedApplicationScanner = require('../middlewares/applicationScannerAuthorization')
    .isAuthorizedApplicationScanner;
const sendErrorResponse = require('../middlewares/response').sendErrorResponse;
const sendItemResponse = require('../middlewares/response').sendItemResponse;
const RealtimeService = require('../services/realTimeService');
const MailService = require('../services/mailService');
const UserService = require('../services/userService');
const ProjectService = require('../services/projectService');

// Route
// Description: Updating profile setting.
// Params:
// Param 1: req.headers-> {authorization}; req.user-> {id}; req.files-> {profilePic};
// Returns: 200: Success, 400: Error; 500: Server Error.

router.get(
    '/applicationSecurities',
    isAuthorizedApplicationScanner,
    async function(req, res) {
        try {
            const response = await ApplicationSecurityService.getSecuritiesToScan();
            return sendItemResponse(req, res, response);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

router.post('/scanning', isAuthorizedApplicationScanner, async function(
    req,
    res
) {
    try {
        const security = req.body.security;
        const applicationSecurity = await ApplicationSecurityService.updateOneBy(
            {
                _id: security._id,
            },
            { scanning: true }
        );

        RealtimeService.handleScanning({ security: applicationSecurity });
        return sendItemResponse(req, res, applicationSecurity);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});
router.post('/failed', isAuthorizedApplicationScanner, async function(
    req,
    res
) {
    try {
        const security = req.body;
        const applicationSecurity = await ApplicationSecurityService.updateOneBy(
            {
                _id: security._id,
            },
            { scanning: false }
        );
        return sendItemResponse(req, res, applicationSecurity);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});
router.post('/log', isAuthorizedApplicationScanner, async function(req, res) {
    try {
        const security = req.body;
        const securityLog = await ApplicationSecurityLogService.create({
            securityId: security.securityId,
            componentId: security.componentId,
            data: security.data,
        });

        const populateApplicationSecurityLog = [
            { path: 'componentId', select: '_id slug name slug projectId' },
            {
                path: 'securityId',
                select:
                    '_id slug name slug gitRepositoryUrl gitCredential componentId resourceCategory deleted deletedAt lastScan scanned scanning',
            },
        ];

        const selectApplicationSecurityLog = '_id securityId componentId data';

        const findLog = await ApplicationSecurityLogService.findOneBy({
            query: { _id: securityLog._id },
            populate: populateApplicationSecurityLog,
            select: selectApplicationSecurityLog,
        });

        const project = await ProjectService.findOneBy({
            query: { _id: findLog.componentId.projectId },
            select: '_id name users',
        });

        const userIds = project.users.map(e => ({ id: e.userId })); // This cater for projects with multiple registered members
        project.critical = findLog.data.vulnerabilities.critical;
        project.high = findLog.data.vulnerabilities.high;
        project.moderate = findLog.data.vulnerabilities.moderate;
        project.low = findLog.data.vulnerabilities.low;

        const critical = findLog.data.advisories
            .filter(e => e.severity === 'critical')
            .slice(0, 10);
        const high = findLog.data.advisories
            .filter(e => e.severity === 'high')
            .slice(0, 10);
        const moderate = findLog.data.advisories
            .filter(e => e.severity === 'moderate')
            .slice(0, 10);
        const low = findLog.data.advisories
            .filter(e => e.severity === 'low')
            .slice(0, 10);
        const criticalWithTitle = critical.map(advisories => {
            const filter = advisories.via.filter(
                e => e.severity === advisories.severity
            );
            let filterBySeverity;
            let filterByTitle;
            if (filter.length > 0) {
                filterBySeverity = advisories.via.find(
                    e => e.severity === advisories.severity
                ).severity;
                filterByTitle = advisories.via.find(
                    e => e.severity === advisories.severity
                ).title;
            } else {
                filterBySeverity = 'Nil';
                filterByTitle = 'Nil';
            }
            advisories.severity === filterBySeverity
                ? (advisories.title = filterByTitle)
                : (advisories.title = 'Nil');
            return advisories;
        });
        const highWithTitle = high.map(advisories => {
            const filter = advisories.via.filter(
                e => e.severity === advisories.severity
            );
            let filterBySeverity;
            let filterByTitle;
            if (filter.length > 0) {
                filterBySeverity = advisories.via.find(
                    e => e.severity === advisories.severity
                ).severity;
                filterByTitle = advisories.via.find(
                    e => e.severity === advisories.severity
                ).title;
            } else {
                filterBySeverity = 'Nil';
                filterByTitle = 'Nil';
            }

            advisories.severity === filterBySeverity
                ? (advisories.title = filterByTitle)
                : (advisories.title = 'Nil');
            return advisories;
        });
        const moderateWithTitle = moderate.map(advisories => {
            const filter = advisories.via.filter(
                e => e.severity === advisories.severity
            );
            let filterBySeverity;
            let filterByTitle;
            if (filter.length > 0) {
                filterBySeverity = advisories.via.find(
                    e => e.severity === advisories.severity
                ).severity;
                filterByTitle = advisories.via.find(
                    e => e.severity === advisories.severity
                ).title;
            } else {
                filterBySeverity = 'Nil';
                filterByTitle = 'Nil';
            }

            advisories.severity === filterBySeverity
                ? (advisories.title = filterByTitle)
                : (advisories.title = 'Nil');
            return advisories;
        });
        const lowWithTitle = low.map(advisories => {
            const filter = advisories.via.filter(
                e => e.severity === advisories.severity
            );
            let filterBySeverity;
            let filterByTitle;
            if (filter.length > 0) {
                filterBySeverity = advisories.via.find(
                    e => e.severity === advisories.severity
                ).severity;
                filterByTitle = advisories.via.find(
                    e => e.severity === advisories.severity
                ).title;
            } else {
                filterBySeverity = 'Nil';
                filterByTitle = 'Nil';
            }

            advisories.severity === filterBySeverity
                ? (advisories.title = filterByTitle)
                : (advisories.title = 'Nil');
            return advisories;
        });

        project.criticalIssues = criticalWithTitle;
        project.highIssues = highWithTitle;
        project.moderateIssues = moderateWithTitle;
        project.lowIssues = lowWithTitle;

        for (let i = 0; i < userIds.length; i++) {
            const userId = userIds[i].id;
            const user = await UserService.findOneBy({
                query: { _id: userId },
                select: '_id email name',
            });
            await MailService.sendApplicationEmail(project, user);
        }

        RealtimeService.handleLog({
            securityId: securityLog.securityId,
            securityLog: findLog,
        });
        return sendItemResponse(req, res, securityLog);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.post('/time', isAuthorizedApplicationScanner, async function(req, res) {
    try {
        const security = req.body;
        const updatedTime = await ApplicationSecurityService.updateScanTime({
            _id: security._id,
        });
        return sendItemResponse(req, res, updatedTime);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

module.exports = router;
