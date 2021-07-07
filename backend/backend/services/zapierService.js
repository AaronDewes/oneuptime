/**
 *
 * Copyright HackerBay, Inc.
 *
 */

module.exports = {
    findBy: async function(query) {
        try {
            if (!query) {
                query = {};
            }
            query.deleted = false;
            const zap = await ZapierModel.find(query).lean();

            return zap;
        } catch (error) {
            ErrorService.log('ZapierService.findBy', error);
            throw error;
        }
    },

    test: async function(projectId, apiKey) {
        try {
            const project = await ProjectService.findOneBy({
                apiKey: apiKey,
                _id: projectId,
            });
            if (project)
                return await Object.assign({}, project, {
                    projectName: project.name,
                });
            else {
                const error = new Error(
                    'We are not able to authenticate you because your `API Key` or `Project ID` is not valid. Please go to your project settings and retrieve your API key and Project ID.'
                );
                error.code = 400;
                ErrorService.log('ZapierService.test', error);
                throw error;
            }
        } catch (error) {
            ErrorService.log('ZapierService.test', error);
            throw error;
        }
    },

    getIncidents: async function(projectId) {
        try {
            const zapierResponseArray = [];
            const zapierResponse = {};
            const _this = this;
            const project = await ProjectService.findOneBy({ _id: projectId });

            if (project) {
                zapierResponse.projectName = project.name;
                zapierResponse.projectId = project._id;
                const projects = await ProjectService.findBy({
                    $or: [{ _id: projectId }, { parentProjectId: projectId }],
                });
                const projectIds = projects.map(project => project._id);
                const findquery = {
                    projectId: { $in: projectIds },
                    acknowledged: false,
                    resolved: false,
                };
                const incidents = await IncidentService.findBy(findquery);
                for (const incident of incidents) {
                    const monitors = incident.monitors.map(
                        monitor => monitor.monitorId
                    );
                    for (const monitor of monitors) {
                        zapierResponseArray.push(
                            await _this.mapIncidentToResponse(
                                incident,
                                zapierResponse,
                                null,
                                monitor
                            )
                        );
                    }
                }

                return zapierResponseArray;
            } else {
                return [];
            }
        } catch (error) {
            ErrorService.log('ZapierService.getIncidents', error);
            throw error;
        }
    },
    getIncidentsNotes: async function(projectId) {
        try {
            const zapierResponseArray = [];
            const zapierResponse = {};
            const _this = this;
            const project = await ProjectService.findOneBy({ _id: projectId });

            if (project) {
                zapierResponse.projectName = project.name;
                zapierResponse.projectId = project._id;
                const projects = await ProjectService.findBy({
                    $or: [{ _id: projectId }, { parentProjectId: projectId }],
                });
                const projectIds = projects.map(project => project._id);
                const findquery = {
                    projectId: { $in: projectIds },
                };
                const incidents = await IncidentService.findBy(findquery);
                const incidentIds = incidents.map(incident => incident._id);
                const incidentMessages = await IncidentMessageService.findBy({
                    incidentId: { $in: incidentIds },
                });
                await Promise.all(
                    incidentMessages.map(async incidentNote => {
                        zapierResponseArray.push(
                            await _this.mapIncidentToResponse(
                                null,
                                zapierResponse,
                                incidentNote
                            )
                        );
                    })
                );

                return zapierResponseArray;
            } else {
                return [];
            }
        } catch (error) {
            ErrorService.log('ZapierService.getIncidentNote', error);
            throw error;
        }
    },
    createIncidentNote: async function(data) {
        try {
            const zapierResponse = {};
            const incidentNoteArr = [];
            await Promise.all(
                data.incidents.map(async incidentId => {
                    let incidentMessage = new IncidentMessageModel();
                    incidentMessage.incidentId = incidentId;
                    incidentMessage.createdByZapier = true;
                    incidentMessage.type = data.type;
                    incidentMessage.content = data.content;
                    incidentMessage = await incidentMessage.save();
                    IncidentService.refreshInterval(incidentId);

                    incidentMessage = await IncidentMessageService.findOneBy({
                        _id: incidentMessage._id,
                    });
                    // run in the background
                    RealTimeService.addIncidentNote(incidentMessage);

                    incidentNoteArr.push(incidentMessage);
                })
            );
            zapierResponse.incidentMessage = incidentNoteArr;
            return zapierResponse;
        } catch (error) {
            ErrorService.log('ZapierService.createIncidentNote', error);
            throw error;
        }
    },
    getAcknowledgedIncidents: async function(projectId) {
        try {
            const zapierResponseArray = [];
            const zapierResponse = {};
            const _this = this;
            const project = await ProjectService.findOneBy({ _id: projectId });
            if (project) {
                zapierResponse.projectName = project.name;
                zapierResponse.projectId = project._id;
                const projects = await ProjectService.findBy({
                    $or: [{ _id: projectId }, { parentProjectId: projectId }],
                });
                const projectIds = projects.map(project => project._id);
                const findquery = {
                    projectId: { $in: projectIds },
                    acknowledged: true,
                    resolved: false,
                };
                const incidents = await IncidentService.findBy(findquery);
                for (const incident of incidents) {
                    const monitors = incident.monitors.map(
                        monitor => monitor.monitorId
                    );
                    for (const monitor of monitors) {
                        zapierResponseArray.push(
                            await _this.mapIncidentToResponse(
                                incident,
                                zapierResponse,
                                null,
                                monitor
                            )
                        );
                    }
                }

                return zapierResponseArray;
            } else {
                return [];
            }
        } catch (error) {
            ErrorService.log('ZapierService.getAcknowledgedIncidents', error);
            throw error;
        }
    },

    getResolvedIncidents: async function(projectId) {
        try {
            const zapierResponseArray = [];
            const zapierResponse = {};
            const _this = this;
            const project = await ProjectService.findOneBy({ _id: projectId });
            if (project) {
                zapierResponse.projectName = project.name;
                zapierResponse.projectId = project._id;
                const projects = await ProjectService.findBy({
                    $or: [{ _id: projectId }, { parentProjectId: projectId }],
                });
                const projectIds = projects.map(project => project._id);
                const findquery = {
                    projectId: { $in: projectIds },
                    acknowledged: true,
                    resolved: true,
                };
                const incidents = await IncidentService.findBy(findquery);
                for (const incident of incidents) {
                    const monitors = incident.monitors.map(
                        monitor => monitor.monitorId
                    );
                    for (const monitor of monitors) {
                        zapierResponseArray.push(
                            await _this.mapIncidentToResponse(
                                incident,
                                zapierResponse,
                                null,
                                monitor
                            )
                        );
                    }
                }

                return zapierResponseArray;
            } else {
                return [];
            }
        } catch (error) {
            ErrorService.log('ZapierService.getResolvedIncidents', error);
            throw error;
        }
    },

    createIncident: async function(monitors) {
        const zapierResponse = {};
        const incidentArr = [];
        await Promise.all(
            monitors.map(async monitor => {
                const monitorObj = await MonitorService.findOneBy({
                    _id: monitor,
                });
                let incident = new IncidentModel();
                incident.projectId = monitorObj.projectId._id;
                incident.monitors = [{ monitorId: monitorObj._id }];
                incident.createdByZapier = true;
                incident = await incident.save();

                await IncidentTimelineService.create({
                    incidentId: incident._id,
                    createdByZapier: true,
                    status: 'created',
                });

                const msg = `A New Incident was created for ${monitorObj.name} by Zapier`;
                NotificationService.create(
                    incident.projectId,
                    msg,
                    null,
                    'warning'
                );
                // run in the background
                RealTimeService.sendCreatedIncident(incident);

                let project = await ProjectService.findOneBy({
                    _id: monitorObj.project._id,
                });
                if (project.parentProjectId) {
                    project = await ProjectService.findOneBy({
                        _id: project.parentProjectId._id,
                    });
                }
                zapierResponse.projectName = project.name;
                zapierResponse.projectId = project._id;
                incidentArr.push(incident);
            })
        );
        zapierResponse.incidents = incidentArr;
        return zapierResponse;
    },

    acknowledgeLastIncident: async function(monitors) {
        const zapierResponse = {};
        const incidentArr = [];
        await Promise.all(
            monitors.map(async monitor => {
                let lastIncident = await IncidentService.findOneBy({
                    'monitors.monitorId': monitor,
                    acknowledged: false,
                });
                lastIncident = await IncidentService.acknowledge(
                    lastIncident._id,
                    null,
                    'Zapier',
                    null,
                    true
                );
                const monitorObj = await MonitorService.findOneBy({
                    _id: monitor,
                });
                let project = await ProjectService.findOneBy({
                    _id: monitorObj.project._id,
                });
                if (project.parentProjectId) {
                    project = await ProjectService.findOneBy({
                        _id: project.parentProjectId._id,
                    });
                }
                zapierResponse.projectName = project.name;
                zapierResponse.projectId = project._id;
                incidentArr.push(lastIncident);
            })
        );
        zapierResponse.incidents = incidentArr;
        return zapierResponse;
    },

    acknowledgeAllIncidents: async function(monitors) {
        const zapierResponse = {};
        let incidentArr = [];
        await Promise.all(
            monitors.map(async monitor => {
                let incidents = await IncidentService.findBy({
                    'monitors.monitorId': monitor,
                    acknowledged: false,
                });
                incidents = await Promise.all(
                    incidents.map(async incident => {
                        return await IncidentService.acknowledge(
                            incident._id,
                            null,
                            'Zapier',
                            null,
                            true
                        );
                    })
                );
                const monitorObj = await MonitorService.findOneBy({
                    _id: monitor,
                });
                let project = await ProjectService.findOneBy({
                    _id: monitorObj.project._id,
                });
                if (project.parentProjectId) {
                    project = await ProjectService.findOneBy({
                        _id: project.parentProjectId._id,
                    });
                }
                zapierResponse.projectName = project.name;
                zapierResponse.projectId = project._id;
                incidentArr = incidents;
            })
        );
        zapierResponse.incidents = incidentArr;
        return zapierResponse;
    },

    acknowledgeIncident: async function(incidents) {
        const zapierResponse = {};
        const incidentArr = [];
        await Promise.all(
            incidents.map(async incident => {
                await IncidentService.acknowledge(
                    incident,
                    null,
                    'Zapier',
                    null,
                    true
                );
                const incidentObj = await IncidentService.findOneBy({
                    _id: incident,
                });
                let project = await ProjectService.findOneBy({
                    _id: incidentObj.projectId,
                });
                if (project.parentProjectId) {
                    project = await ProjectService.findOneBy({
                        _id: project.parentProjectId._id,
                    });
                }
                zapierResponse.projectName = project.name;
                zapierResponse.projectId = project._id;
                incidentArr.push(incidentObj);
            })
        );
        zapierResponse.incidents = incidentArr;
        return zapierResponse;
    },

    resolveLastIncident: async function(monitors) {
        const zapierResponse = {};
        const incidentArr = [];
        await Promise.all(
            monitors.map(async monitor => {
                let lastIncident = await IncidentService.findOneBy({
                    'monitors.monitorId': monitor,
                    resolved: false,
                });
                lastIncident = await IncidentService.resolve(
                    lastIncident._id,
                    null,
                    'Zapier',
                    null,
                    true
                );
                const monitorObj = await MonitorService.findOneBy({
                    _id: monitor,
                });
                let project = await ProjectService.findOneBy({
                    _id: monitorObj.project._id,
                });
                if (project.parentProjectId) {
                    project = await ProjectService.findOneBy({
                        _id: project.parentProjectId._id,
                    });
                }
                zapierResponse.projectName = project.name;
                zapierResponse.projectId = project._id;
                incidentArr.push(lastIncident);
            })
        );
        zapierResponse.incidents = incidentArr;
        return zapierResponse;
    },

    resolveAllIncidents: async function(monitors) {
        const zapierResponse = {};
        let incidentArr = [];
        await Promise.all(
            monitors.map(async monitor => {
                let incidents = await IncidentService.findBy({
                    'monitors.monitorId': monitor,
                    resolved: false,
                });
                incidents = await Promise.all(
                    incidents.map(async incident => {
                        return await IncidentService.resolve(
                            incident._id,
                            null,
                            'Zapier',
                            null,
                            true
                        );
                    })
                );
                const monitorObj = await MonitorService.findOneBy({
                    _id: monitor,
                });
                let project = await ProjectService.findOneBy({
                    _id: monitorObj.project._id,
                });
                if (project.parentProjectId) {
                    project = await ProjectService.findOneBy({
                        _id: project.parentProjectId._id,
                    });
                }
                zapierResponse.projectName = project.name;
                zapierResponse.projectId = project._id;
                incidentArr = incidents;
            })
        );
        zapierResponse.incidents = incidentArr;
        return zapierResponse;
    },

    resolveIncident: async function(incidents) {
        const zapierResponse = {};
        const incidentArr = [];
        await Promise.all(
            incidents.map(async incident => {
                await IncidentService.resolve(
                    incident,
                    null,
                    'Zapier',
                    null,
                    true
                );
                const incidentObj = await IncidentService.findOneBy({
                    _id: incident,
                });
                let project = await ProjectService.findOneBy({
                    _id: incidentObj.projectId,
                });
                if (project.parentProjectId) {
                    project = await ProjectService.findOneBy({
                        _id: project.parentProjectId._id,
                    });
                }
                zapierResponse.projectName = project.name;
                zapierResponse.projectId = project._id;
                incidentArr.push(incidentObj);
            })
        );
        zapierResponse.incidents = incidentArr;
        return zapierResponse;
    },

    mapIncidentToResponse: async function(
        incident,
        incidentObj,
        incidentNote,
        monitor
    ) {
        try {
            if (incidentNote) {
                incidentObj.content = incidentNote.content;
                incidentObj.incident_state = incidentNote.incident_state;
                incidentObj.type = incidentNote.type;
                incidentObj.createdBy =
                    incidentNote.createdById && incidentNote.createdById.name;
                incidentObj.createdAt = incidentNote.createdAt;
                incidentObj.incidentId =
                    incidentNote.incidentId && incidentNote.incidentId._id;
                incidentObj.id = incidentNote._id;
            } else {
                if (incident) {
                    if (incident.acknowledged) {
                        incidentObj.acknowledgedAt = incident.acknowledgedAt;
                        incidentObj.acknowledgedBy = incident.acknowledgedBy
                            ? incident.acknowledgedBy.name
                            : 'Fyipe';
                    }
                    if (incident.resolved) {
                        incidentObj.resolvedAt = incident.resolvedAt;
                        incidentObj.resolvedBy = incident.resolvedBy
                            ? incident.resolvedBy.name
                            : 'Fyipe';
                    }
                    incidentObj.id = incident._id;
                    incidentObj.incidentId = incident._id;
                    incidentObj.idNumber = incident.idNumber;
                    incidentObj.acknowledged = incident.acknowledged;
                    incidentObj.resolved = incident.resolved;
                    incidentObj.internalNote = incident.internalNote;
                    incidentObj.investigationNote = incident.investigationNote;
                    incidentObj.createdAt = incident.createdAt;
                    incidentObj.createdById = incident.createdById
                        ? incident.createdById.name
                        : 'Fyipe';
                    // const monitor = await MonitorService.findOneBy({
                    //     _id: incident.monitorId,
                    // });
                    incidentObj.monitorName = monitor.name;
                    incidentObj.monitorType = monitor.type;
                    incidentObj.monitorData = monitor.data[monitor.type];
                } else {
                    return;
                }
            }
            return incidentObj;
        } catch (error) {
            ErrorService.log('ZapierService.mapIncidentToResponse', error);
            throw error;
        }
    },

    subscribe: async function(projectId, url, type, monitors) {
        try {
            const zapier = new ZapierModel();
            zapier.projectId = projectId;
            zapier.url = url;
            zapier.type = type;
            zapier.monitors = monitors;
            const zap = await zapier.save();
            return { id: zap._id };
        } catch (error) {
            ErrorService.log('ZapierService.subscribe', error);
            throw error;
        }
    },

    unsubscribe: async function(id) {
        try {
            await ZapierModel.findOneAndUpdate(
                { _id: id },
                {
                    $set: { deleted: true },
                },
                {
                    new: true,
                }
            );
            return;
        } catch (error) {
            ErrorService.log('ZapierService.unsubscribe', error);
            throw error;
        }
    },

    pushToZapier: async function(type, incident, incidentNote) {
        try {
            const _this = this;
            const projectId = incident.projectId._id || incident.projectId;
            let project = await ProjectService.findOneBy({ _id: projectId });

            if (project.parentProjectId) {
                project = await ProjectService.findOneBy({
                    _id: project.parentProjectId._id,
                });
            }
            const monitorIds = incident.monitors.map(
                monitor => monitor.monitorId._id
            );
            const zap = await _this.findBy({
                projectId: project._id,
                type: type,
                // $or: [{ monitors: incident.monitorId._id }, { monitors: [] }],
                $or: [{ monitors: { $all: monitorIds } }, { monitors: [] }],
            });

            if (zap && zap.length) {
                for (const z of zap) {
                    let zapierResponse = {};
                    if (project) {
                        zapierResponse.projectName = project.name;
                        zapierResponse.projectId = project._id;
                        if (incident) {
                            const monitors = incident.monitors.map(
                                monitor => monitor.monitorId
                            );
                            for (const monitor of monitors) {
                                zapierResponse = await _this.mapIncidentToResponse(
                                    incident,
                                    zapierResponse,
                                    incidentNote,
                                    monitor
                                );
                                axios({
                                    method: 'POST',
                                    url: z.url,
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    data: JSON.stringify([zapierResponse]),
                                });
                            }
                        }
                    }
                }
            }
        } catch (error) {
            ErrorService.log('ZapierService.pushToZapier', error);
            throw error;
        }
    },

    hardDeleteBy: async function(query) {
        try {
            await ZapierModel.deleteMany(query);
            return 'Zapier(s) removed successfully';
        } catch (error) {
            ErrorService.log('ZapierService.hardDeleteBy', error);
            throw error;
        }
    },
};

const axios = require('axios');
const ProjectService = require('./projectService');
const ErrorService = require('./errorService');
const IncidentService = require('./incidentService');
const IncidentTimelineService = require('./incidentTimelineService');
const MonitorService = require('./monitorService');
const ZapierModel = require('../models/zapier');
const IncidentModel = require('../models/incident');
const NotificationService = require('./notificationService');
const RealTimeService = require('./realTimeService');
const IncidentMessageService = require('../services/incidentMessageService');
const IncidentMessageModel = require('../models/incidentMessage');
