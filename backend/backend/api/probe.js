/**
 *
 * Copyright HackerBay, Inc.
 *
 */

const express = require('express');
const ProbeService = require('../services/probeService');
const MonitorService = require('../services/monitorService');
const ProjectService = require('../services/projectService');
const LighthouseLogService = require('../services/lighthouseLogService');
const ContainerSecurityService = require('../services/containerSecurityService');
const router = express.Router();
const isAuthorizedAdmin = require('../middlewares/clusterAuthorization')
    .isAuthorizedAdmin;
const isAuthorizedProbe = require('../middlewares/probeAuthorization')
    .isAuthorizedProbe;
const sendErrorResponse = require('../middlewares/response').sendErrorResponse;
const sendItemResponse = require('../middlewares/response').sendItemResponse;
const sendListResponse = require('../middlewares/response').sendListResponse;
const getUser = require('../middlewares/user').getUser;
const { isAuthorized } = require('../middlewares/authorization');

router.post('/', getUser, isAuthorizedAdmin, async function(req, res) {
    try {
        const data = req.body;
        const probe = await ProbeService.create(data);
        return sendItemResponse(req, res, probe);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get('/', getUser, isAuthorizedAdmin, async function(req, res) {
    try {
        const skip = req.query.skip || 0;
        const limit = req.query.limit || 0;
        const [probe, count] = await Promise.all([
            ProbeService.findBy({}, limit, skip),
            ProbeService.countBy({}),
        ]);
        return sendListResponse(req, res, probe, count);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.put('/:id', getUser, isAuthorizedAdmin, async function(req, res) {
    try {
        const data = req.body;
        const probe = await ProbeService.updateOneBy(
            { _id: req.params.id },
            data
        );
        return sendItemResponse(req, res, probe);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.delete('/:id', getUser, isAuthorizedAdmin, async function(req, res) {
    try {
        const probe = await ProbeService.deleteBy({ _id: req.params.id });
        return sendItemResponse(req, res, probe);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route
// Description: Updating profile setting.
// Params:
// Param 1: req.headers-> {authorization}; req.user-> {id}; req.files-> {profilePic};
// Returns: 200: Success, 400: Error; 500: Server Error.

router.get('/monitors', isAuthorizedProbe, async function(req, res) {
    try {
        const monitors = await MonitorService.getProbeMonitors(
            req.probe.id,
            new Date(new Date().getTime() - 60 * 1000)
        );
        //Update the lastAlive in the probe servers list located in the status pages.
        if (monitors.length > 0) {
            const projectIds = {};
            for (const monitor of monitors) {
                const project = await ProjectService.findOneBy({
                    _id: monitor.projectId,
                });
                const projectId = project
                    ? project.parentProjectId
                        ? project.parentProjectId._id
                        : project._id
                    : monitor.projectId;
                projectIds[projectId] = true;
            }
            for (const projectId of Object.keys(projectIds)) {
                const probe = await ProbeService.findOneBy({
                    _id: req.probe.id,
                });
                global.io.emit(`updateProbe-${projectId}`, probe);
            }
        }
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

router.post('/ping/:monitorId', isAuthorizedProbe, async function(
    req,
    response
) {
    try {
        const {
            monitor,
            res,
            resp,
            rawResp,
            serverData,
            type,
            retryCount,
            kubernetesData,
        } = req.body;

        let status,
            log,
            reason,
            data = {};
        let matchedCriterion;

        if (type === 'incomingHttpRequest') {
            const newMonitor = await MonitorService.findOneBy({
                query: { _id: monitor._id },
                select: 'lastPingTime _id criteria',
            });
            const probeId = req.probe && req.probe.id ? req.probe.id : null;
            log = await ProbeService.probeHttpRequest(newMonitor, probeId);
        } else {
            if (type === 'api' || type === 'url') {
                const {
                    stat: validUp,
                    successReasons: upSuccessReasons,
                    failedReasons: upFailedReasons,
                    matchedCriterion: matchedUpCriterion,
                } =
                    monitor && monitor.criteria && monitor.criteria.up
                        ? ProbeService.conditions(
                              monitor.type,
                              monitor.criteria.up,
                              res,
                              resp,
                              rawResp
                          )
                        : {
                              stat: false,
                              successReasons: [],
                              failedReasons: [],
                          };
                const {
                    stat: validDegraded,
                    successReasons: degradedSuccessReasons,
                    failedReasons: degradedFailedReasons,
                    matchedCriterion: matchedDegradedCriterion,
                } =
                    monitor && monitor.criteria && monitor.criteria.degraded
                        ? ProbeService.conditions(
                              monitor.type,
                              monitor.criteria.degraded,
                              res,
                              resp,
                              rawResp
                          )
                        : {
                              stat: false,
                              successReasons: [],
                              failedReasons: [],
                          };
                const {
                    stat: validDown,
                    successReasons: downSuccessReasons,
                    failedReasons: downFailedReasons,
                    matchedCriterion: matchedDownCriterion,
                } =
                    monitor && monitor.criteria && monitor.criteria.down
                        ? ProbeService.conditions(
                              monitor.type,
                              [
                                  ...monitor.criteria.down.filter(
                                      criterion => criterion.default !== true
                                  ),
                              ],
                              res,
                              resp,
                              rawResp
                          )
                        : {
                              stat: false,
                              successReasons: [],
                              failedReasons: [],
                          };

                if (validUp) {
                    status = 'online';
                    reason = upSuccessReasons;
                    matchedCriterion = matchedUpCriterion;
                } else if (validDegraded) {
                    status = 'degraded';
                    reason = [...degradedSuccessReasons, ...upFailedReasons];
                    matchedCriterion = matchedDegradedCriterion;
                } else if (validDown) {
                    matchedCriterion = matchedDownCriterion;
                    status = 'offline';
                    reason = [
                        ...downSuccessReasons,
                        ...degradedFailedReasons,
                        ...upFailedReasons,
                    ];
                } else {
                    status = 'offline';
                    reason = [
                        ...downFailedReasons,
                        ...degradedFailedReasons,
                        ...upFailedReasons,
                    ];
                    if (monitor.criteria.down) {
                        matchedCriterion = monitor.criteria.down.find(
                            criterion => criterion.default === true
                        );
                    }
                }
                data.status = status;
                data.reason = reason;
            }
            if (type === 'ip') {
                const {
                    stat: validUp,
                    successReasons: upSuccessReasons,
                    failedReasons: upFailedReasons,
                    matchedCriterion: matchedUpCriterion,
                } =
                    monitor && monitor.criteria && monitor.criteria.up
                        ? ProbeService.conditions(
                              monitor.type,
                              monitor.criteria.up,
                              res,
                              resp,
                              rawResp
                          )
                        : {
                              stat: false,
                              successReasons: [],
                              failedReasons: [],
                          };
                const {
                    stat: validDown,
                    successReasons: downSuccessReasons,
                    failedReasons: downFailedReasons,
                    matchedCriterion: matchedDownCriterion,
                } =
                    monitor && monitor.criteria && monitor.criteria.down
                        ? ProbeService.conditions(
                              monitor.type,
                              [
                                  ...monitor.criteria.down.filter(
                                      criterion => criterion.default !== true
                                  ),
                              ],
                              res,
                              resp,
                              rawResp
                          )
                        : {
                              stat: false,
                              successReasons: [],
                              failedReasons: [],
                          };
                if (validUp) {
                    status = 'online';
                    reason = upSuccessReasons;
                    matchedCriterion = matchedUpCriterion;
                } else if (validDown) {
                    matchedCriterion = matchedDownCriterion;
                    status = 'offline';
                    reason = [...downSuccessReasons, null, ...upFailedReasons];
                } else {
                    status = 'offline';
                    reason = [...downFailedReasons, null, ...upFailedReasons];
                    if (monitor.criteria.down) {
                        matchedCriterion = monitor.criteria.down.find(
                            criterion => criterion.default === true
                        );
                    }
                }
                data.status = status;
                data.reason = reason;
            }
            if (type === 'script') {
                const {
                    stat: validUp,
                    successReasons: upSuccessReasons,
                    failedReasons: upFailedReasons,
                    matchedCriterion: matchedUpCriterion,
                } = await (monitor && monitor.criteria && monitor.criteria.up
                    ? ProbeService.scriptConditions(resp, monitor.criteria.up)
                    : { stat: false, successReasons: [], failedReasons: [] });

                const {
                    stat: validDown,
                    successReasons: downSuccessReasons,
                    failedReasons: downFailedReasons,
                    matchedCriterion: matchedDownCriterion,
                } = await (monitor && monitor.criteria && monitor.criteria.down
                    ? ProbeService.scriptConditions(resp, [
                          ...monitor.criteria.down.filter(
                              criterion => criterion.default !== true
                          ),
                      ])
                    : { stat: false, successReasons: [], failedReasons: [] });

                const {
                    stat: validDegraded,
                    successReasons: degradedSuccessReasons,
                    failedReasons: degradedFailedReasons,
                    matchedCriterion: matchedDegradedCriterion,
                } = await (monitor &&
                monitor.criteria &&
                monitor.criteria.degraded
                    ? ProbeService.scriptConditions(
                          resp,
                          monitor.criteria.degraded
                      )
                    : { stat: false, successReasons: [], failedReasons: [] });

                if (validUp) {
                    status = 'online';
                    reason = upSuccessReasons;
                    matchedCriterion = matchedUpCriterion;
                } else if (validDown) {
                    status = 'offline';
                    reason = [...downSuccessReasons, ...upFailedReasons];
                    matchedCriterion = matchedDownCriterion;
                } else if (validDegraded) {
                    status = 'degraded';
                    reason = [
                        ...degradedSuccessReasons,
                        ...upFailedReasons,
                        ...downFailedReasons,
                    ];
                    matchedCriterion = matchedDegradedCriterion;
                } else {
                    status = 'offline';
                    reason = [
                        ...downFailedReasons,
                        ...upFailedReasons,
                        ...degradedFailedReasons,
                    ];
                    if (monitor.criteria.down) {
                        matchedCriterion = monitor.criteria.down.find(
                            criterion => criterion.default === true
                        );
                    }
                }

                data.status = status;
                data.reason = reason;
            }
            if (type === 'server-monitor') {
                data = serverData;
                const {
                    stat: validUp,
                    successReasons: upSuccessReasons,
                    failedReasons: upFailedReasons,
                    matchedCriterion: matchedUpCriterion,
                } =
                    monitor && monitor.criteria && monitor.criteria.up
                        ? ProbeService.conditions(
                              monitor.type,
                              monitor.criteria.up,
                              data
                          )
                        : {
                              stat: false,
                              successReasons: [],
                              failedReasons: [],
                          };
                const {
                    stat: validDegraded,
                    successReasons: degradedSuccessReasons,
                    failedReasons: degradedFailedReasons,
                    matchedCriterion: matchedDegradedCriterion,
                } =
                    monitor && monitor.criteria && monitor.criteria.degraded
                        ? ProbeService.conditions(
                              monitor.type,
                              monitor.criteria.degraded,
                              data
                          )
                        : {
                              stat: false,
                              successReasons: [],
                              failedReasons: [],
                          };
                const {
                    stat: validDown,
                    successReasons: downSuccessReasons,
                    failedReasons: downFailedReasons,
                    matchedCriterion: matchedDownCriterion,
                } =
                    monitor && monitor.criteria && monitor.criteria.down
                        ? ProbeService.conditions(
                              monitor.type,
                              [
                                  ...monitor.criteria.down.filter(
                                      criterion => criterion.default !== true
                                  ),
                              ],
                              data
                          )
                        : {
                              stat: false,
                              successReasons: [],
                              failedReasons: [],
                          };

                if (validUp) {
                    data.status = 'online';
                    data.reason = upSuccessReasons;
                    matchedCriterion = matchedUpCriterion;
                } else if (validDegraded) {
                    data.status = 'degraded';
                    data.reason = [
                        ...degradedSuccessReasons,
                        ...upFailedReasons,
                    ];
                    matchedCriterion = matchedDegradedCriterion;
                } else if (validDown) {
                    data.status = 'offline';
                    data.reason = [
                        ...downSuccessReasons,
                        ...degradedFailedReasons,
                        ...upFailedReasons,
                    ];
                    matchedCriterion = matchedDownCriterion;
                } else {
                    data.status = 'offline';
                    data.reason = [
                        ...downFailedReasons,
                        ...degradedFailedReasons,
                        ...upFailedReasons,
                    ];
                    if (monitor.criteria.down) {
                        matchedCriterion = monitor.criteria.down.find(
                            criterion => criterion.default === true
                        );
                    }
                }
            } else {
                data = req.body;
                data.responseTime = res || 0;
                data.responseStatus = resp && resp.status ? resp.status : null;
                data.status = status;
                data.sslCertificate =
                    resp && resp.sslCertificate ? resp.sslCertificate : null;
                data.lighthouseScanStatus =
                    resp && resp.lighthouseScanStatus
                        ? resp.lighthouseScanStatus
                        : null;
                data.performance =
                    resp && resp.performance ? resp.performance : null;
                data.accessibility =
                    resp && resp.accessibility ? resp.accessibility : null;
                data.bestPractices =
                    resp && resp.bestPractices ? resp.bestPractices : null;
                data.seo = resp && resp.seo ? resp.seo : null;
                data.pwa = resp && resp.pwa ? resp.pwa : null;
                data.lighthouseData =
                    resp && resp.lighthouseData ? resp.lighthouseData : null;
                data.retryCount = retryCount || 0;
                data.reason = reason;
                data.response = rawResp;
            }
            if (type === 'kubernetes') {
                data = { kubernetesData };

                const {
                    stat: validUp,
                    successReasons: upSuccessReasons,
                    failedReasons: upFailedReasons,
                    matchedCriterion: matchedUpCriterion,
                } =
                    monitor && monitor.criteria && monitor.criteria.up
                        ? ProbeService.conditions(
                              monitor.type,
                              monitor.criteria.up,
                              data.kubernetesData
                          )
                        : {
                              stat: false,
                              successReasons: [],
                              failedReasons: [],
                          };

                const {
                    stat: validDegraded,
                    successReasons: degradedSuccessReasons,
                    failedReasons: degradedFailedReasons,
                    matchedCriterion: matchedDegradedCriterion,
                } =
                    monitor && monitor.criteria && monitor.criteria.degraded
                        ? ProbeService.conditions(
                              monitor.type,
                              monitor.criteria.degraded,
                              data.kubernetesData
                          )
                        : {
                              stat: false,
                              successReasons: [],
                              failedReasons: [],
                          };

                const {
                    stat: validDown,
                    successReasons: downSuccessReasons,
                    failedReasons: downFailedReasons,
                    matchedCriterion: matchedDownCriterion,
                } =
                    monitor && monitor.criteria && monitor.criteria.down
                        ? ProbeService.conditions(
                              monitor.type,
                              [
                                  ...monitor.criteria.down.filter(
                                      criterion => criterion.default !== true
                                  ),
                              ],
                              data.kubernetesData
                          )
                        : {
                              stat: false,
                              successReasons: [],
                              failedReasons: [],
                          };

                if (validUp) {
                    data.status = 'online';
                    data.reason = upSuccessReasons;
                    matchedCriterion = matchedUpCriterion;
                } else if (validDegraded) {
                    data.status = 'degraded';
                    data.reason = [
                        ...degradedSuccessReasons,
                        ...upFailedReasons,
                    ];
                    matchedCriterion = matchedDegradedCriterion;
                } else if (validDown) {
                    data.status = 'offline';
                    data.reason = [
                        ...downSuccessReasons,
                        ...degradedFailedReasons,
                        ...upFailedReasons,
                    ];
                    matchedCriterion = matchedDownCriterion;
                } else {
                    data.status = 'offline';
                    data.reason = [
                        ...downFailedReasons,
                        ...degradedFailedReasons,
                        ...upFailedReasons,
                    ];
                    if (monitor.criteria.down) {
                        matchedCriterion = monitor.criteria.down.find(
                            criterion => criterion.default === true
                        );
                    }
                }
            }

            if (type === 'script') {
                data.scriptMetadata = {
                    executionTime: resp.executionTime,
                    consoleLogs: resp.consoleLogs,
                    error: resp.error,
                    statusText: resp.statusText,
                };
            }

            data.matchedCriterion = matchedCriterion;
            // update monitor to save the last matched criterion
            await MonitorService.updateOneBy(
                {
                    _id: monitor._id,
                },
                {
                    lastMatchedCriterion: matchedCriterion,
                }
            );
            data.monitorId = req.params.monitorId || monitor._id;
            data.probeId = req.probe && req.probe.id ? req.probe.id : null;
            data.reason =
                data && data.reason && data.reason.length
                    ? data.reason.filter(
                          (item, pos, self) => self.indexOf(item) === pos
                      )
                    : data.reason;
            const index =
                data.reason && data.reason.indexOf('Request Timed out');
            if (index > -1) {
                data.reason =
                    data && data.reason && data.reason.length
                        ? data.reason.filter(
                              item => !item.includes('Response Time is')
                          )
                        : data.reason;
            }

            if (data.lighthouseScanStatus) {
                if (data.lighthouseScanStatus === 'scanning') {
                    await Promise.all([
                        MonitorService.updateOneBy(
                            { _id: data.monitorId },
                            {
                                lighthouseScanStatus: data.lighthouseScanStatus,
                            },
                            { fetchLightHouse: true }
                        ),
                        LighthouseLogService.updateAllLighthouseLogs(
                            data.monitor.projectId,
                            data.monitorId,
                            { scanning: true }
                        ),
                    ]);
                } else {
                    await MonitorService.updateOneBy(
                        { _id: data.monitorId },
                        {
                            lighthouseScannedAt: Date.now(),
                            lighthouseScanStatus: data.lighthouseScanStatus, // scanned || failed
                            lighthouseScannedBy: data.probeId,
                        }
                    );
                }
            } else {
                if (data.lighthouseData) {
                    data.scanning = false;
                    log = await ProbeService.saveLighthouseLog(data);
                } else {
                    data.matchedUpCriterion =
                        monitor && monitor.criteria && monitor.criteria.up;
                    data.matchedDownCriterion =
                        monitor && monitor.criteria && monitor.criteria.down;
                    data.matchedDegradedCriterion =
                        monitor &&
                        monitor.criteria &&
                        monitor.criteria.degraded;

                    log = await ProbeService.saveMonitorLog(data);

                    if (type === 'script') {
                        await MonitorService.updateBy(
                            { _id: req.params.monitorId },
                            {
                                scriptRunStatus: 'completed',
                                scriptRunBy: req.probe.id,
                            }
                        );
                    }
                }
            }
        }
        return sendItemResponse(req, response, log);
    } catch (error) {
        return sendErrorResponse(req, response, error);
    } finally {
        // if (release) {
        //     release();
        // }
    }
});

router.post('/setTime/:monitorId', isAuthorizedProbe, async function(req, res) {
    try {
        const data = req.body;
        data.probeId = req.probe.id;
        data.monitorId = req.params.monitorId;
        const log = await ProbeService.saveMonitorLog(data);
        return sendItemResponse(req, res, log);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.post('/getTime/:monitorId', isAuthorizedProbe, async function(req, res) {
    try {
        const data = req.body;
        data.probeId = req.probe.id;
        data.monitorId = req.params.monitorId;
        const log = await ProbeService.getMonitorLog(data);
        return sendItemResponse(req, res, log);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get('/:projectId/probes', getUser, isAuthorized, async function(
    req,
    res
) {
    try {
        const limit = req.query.limit || null;
        const skip = req.query.skip || null;
        const [probe, count] = await Promise.all([
            ProbeService.findBy({}, limit, skip),
            ProbeService.countBy({}),
        ]);
        return sendListResponse(req, res, probe, count);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get('/containerSecurities', isAuthorizedProbe, async function(req, res) {
    try {
        const response = await ContainerSecurityService.getSecuritiesToScan();
        return sendItemResponse(req, res, response);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.post('/scan/docker', isAuthorizedProbe, async function(req, res) {
    try {
        let { security } = req.body;

        security = JSON.parse(security); // always parse the JSON
        security = await ContainerSecurityService.decryptPassword(security);

        const securityLog = await ProbeService.scanContainerSecurity(security);
        global.io.emit(`securityLog_${security._id}`, securityLog);
        return sendItemResponse(req, res, securityLog);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

module.exports = router;
