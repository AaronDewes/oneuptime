module.exports = {
    sendCreatedIncident: ({ projectId, incident }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`incidentCreated-${projectId}`, incident);
        } catch (error) {
            ErrorService.log('realtimeService.sendCreatedIncident', error);
            throw error;
        }
    },

    sendIncidentTimeline: ({ projectId, data }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`incidentTimeline-${projectId}`, data);
        } catch (error) {
            ErrorService.log('realtimeService.sendIncidentTimeline', error);
            throw error;
        }
    },

    sendSlaCountDown: ({ projectId, incident, countDown }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`slaCountDown-${projectId}`, {
                incident,
                countDown,
            });
        } catch (error) {
            ErrorService.log('realtimeService.sendSlaCountDown', error);
            throw error;
        }
    },

    deleteIncident: ({ projectId, incident }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`deleteIncident-${projectId}`, incident);
        } catch (error) {
            ErrorService.log('realtimeService.deleteIncident', error);
            throw error;
        }
    },

    addIncidentNote: ({ projectId, incidentNote }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`addIncidentNote-${projectId}`, incidentNote);
        } catch (error) {
            ErrorService.log('realtimeService.addIncidentNote', error);
            throw error;
        }
    },

    updateIncidentNote: ({ projectId, incidentNote }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`updateIncidentNote-${projectId}`, incidentNote);
        } catch (error) {
            ErrorService.log('realtimeService.updateIncidentNote', error);
            throw error;
        }
    },

    updateIncidentTimeline: ({ incidentTimeline, projectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(
                `updateIncidentTimeline-${projectId}`,
                incidentTimeline
            );
        } catch (error) {
            ErrorService.log('realtimeService.updateIncidentTimeline', error);
            throw error;
        }
    },

    updateIncident: ({ incident, projectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`updateIncident-${projectId}`, incident);
        } catch (error) {
            ErrorService.log('realtimeService.updateIncident', error);
            throw error;
        }
    },

    deleteIncidentNote: ({ incidentNote, projectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`deleteIncidentNote-${projectId}`, incidentNote);
        } catch (error) {
            ErrorService.log('realtimeService.deleteIncidentNote', error);
            throw error;
        }
    },

    addScheduledEvent: ({ event, projectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`addScheduledEvent-${projectId}`, event);
        } catch (error) {
            ErrorService.log('realtimeService.addScheduledEvent', error);
            throw error;
        }
    },

    deleteScheduledEvent: ({ event, projectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`deleteScheduledEvent-${projectId}`, event);
        } catch (error) {
            ErrorService.log('realtimeService.deleteScheduledEvent', error);
            throw error;
        }
    },

    updateScheduledEvent: ({ event, projectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`updateScheduledEvent-${projectId}`, event);
        } catch (error) {
            ErrorService.log('realtimeService.updateScheduledEvent', error);
            throw error;
        }
    },

    resolveScheduledEvent: ({ event, projectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`resolveScheduledEvent-${projectId}`, event);
        } catch (error) {
            ErrorService.log('realtimeService.resolveScheduledEvent', error);
            throw error;
        }
    },

    addScheduledEventInternalNote: ({ note, scheduledEventId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(
                `addScheduledEventInternalNote-${scheduledEventId}`,
                note
            );
        } catch (error) {
            ErrorService.log(
                'realtimeService.addScheduledEventInternalNote',
                error
            );
            throw error;
        }
    },

    addScheduledEventInvestigationNote: ({
        note,
        projectId,
        scheduledEventId,
    }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(
                `addScheduledEventInvestigationNote-${scheduledEventId}`,
                note
            );
            global.io.emit(`addEventNote-${projectId}`, note); // realtime update on status page
        } catch (error) {
            ErrorService.log(
                'realtimeService.addScheduledEventInvestigationNote',
                error
            );
            throw error;
        }
    },

    deleteScheduledEventInternalNote: ({ note, scheduledEventId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(
                `deleteScheduledEventInternalNote-${scheduledEventId}`,
                note
            );
        } catch (error) {
            ErrorService.log(
                'realtimeService.deleteScheduledEventInternalNote',
                error
            );
            throw error;
        }
    },

    deleteScheduledEventInvestigationNote: ({
        note,
        projectId,
        scheduledEventId,
    }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(
                `deleteScheduledEventInvestigationNote-${scheduledEventId}`,
                note
            );
            global.io.emit(`deleteEventNote-${projectId}`, note); // realtime update on status page
        } catch (error) {
            ErrorService.log(
                'realtimeService.deleteScheduledEventInvestigationNote',
                error
            );
            throw error;
        }
    },

    updateScheduledEventInternalNote: ({ note, scheduledEventId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(
                `updateScheduledEventInternalNote-${scheduledEventId}`,
                note
            );
        } catch (error) {
            ErrorService.log(
                'realtimeService.updateScheduledEventInternalNote',
                error
            );
            throw error;
        }
    },

    updateScheduledEventInvestigationNote: ({
        note,
        projectId,
        scheduledEventId,
    }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(
                `updateScheduledEventInvestigationNote-${scheduledEventId}`,
                note
            );
            global.io.emit(`updateEventNote-${projectId}`, note);
        } catch (error) {
            ErrorService.log(
                'realtimeService.updateScheduledEventInvestigationNote',
                error
            );
            throw error;
        }
    },

    sendComponentCreated: ({ component, projectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`createComponent-${projectId}`, component);
        } catch (error) {
            ErrorService.log('realtimeService.sendComponentCreated', error);
            throw error;
        }
    },

    sendMonitorCreated: ({ monitor, projectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`createMonitor-${projectId}`, monitor);
        } catch (error) {
            ErrorService.log('realtimeService.sendMonitorCreated', error);
            throw error;
        }
    },

    sendComponentDelete: ({ component, projectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`deleteComponent-${projectId}`, component);
        } catch (error) {
            ErrorService.log('realtimeService.sendComponentDelete', error);
            throw error;
        }
    },

    sendMonitorDelete: ({ monitor, projectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`deleteMonitor-${projectId}`, monitor);
        } catch (error) {
            ErrorService.log('realtimeService.sendMonitorDelete', error);
            throw error;
        }
    },

    incidentResolved: ({ incident, projectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`incidentResolved-${projectId}`, incident);
        } catch (error) {
            ErrorService.log('realtimeService.incidentResolved', error);
            throw error;
        }
    },

    incidentAcknowledged: ({ incident, projectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`incidentAcknowledged-${projectId}`, incident);
        } catch (error) {
            ErrorService.log('realtimeService.incidentAcknowledged', error);
            throw error;
        }
    },

    statusPageEdit: ({ statusPage, projectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`updateStatusPage-${projectId}`, statusPage);
        } catch (error) {
            ErrorService.log('realtimeService.statusPageEdit', error);
            throw error;
        }
    },

    componentEdit: ({ component, projectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`updateComponent-${projectId}`, component);
        } catch (error) {
            ErrorService.log('realtimeService.componentEdit', error);
            throw error;
        }
    },

    monitorEdit: ({ monitor, projectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`updateMonitor-${projectId}`, monitor);
        } catch (error) {
            ErrorService.log('realtimeService.monitorEdit', error);
            throw error;
        }
    },

    updateMonitorLog: ({
        data,
        logData,
        projectId,
        parentProjectId,
        monitorId,
    }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`updateMonitorLog-${parentProjectId}`, {
                projectId,
                monitorId,
                data,
                logData,
            });
        } catch (error) {
            ErrorService.log('realtimeService.updateMonitorLog', error);
            throw error;
        }
    },

    updateLighthouseLog: ({ data, projectId, monitorId, parentProjectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`updateLighthouseLog-${parentProjectId}`, {
                projectId,
                monitorId,
                data,
            });
        } catch (error) {
            ErrorService.log('realtimeService.updateLighthouseLog', error);
            throw error;
        }
    },

    updateAllLighthouseLog: ({
        projectId,
        data,
        parentProjectId,
        monitorId,
    }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`updateAllLighthouseLog-${parentProjectId}`, {
                projectId,
                monitorId,
                data,
            });
        } catch (error) {
            ErrorService.log('realtimeService.updateAllLighthouseLog', error);
            throw error;
        }
    },

    updateMonitorStatus: ({ data, projectId, monitorId, parentProjectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`updateMonitorStatus-${parentProjectId}`, {
                projectId,
                monitorId,
                data,
            });
        } catch (error) {
            ErrorService.log('realtimeService.updateMonitorStatus', error);
            throw error;
        }
    },

    updateTweets: ({ tweets, statusPageId, _projectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`updateTweets-${_projectId}`, {
                tweets,
                statusPageId,
            });
        } catch (error) {
            ErrorService.log('realtimeService.updateTweets', error);
            throw error;
        }
    },

    updateProbe: ({ data }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`updateProbe`, data);
        } catch (error) {
            ErrorService.log('realtimeService.updateProbe', error);
            throw error;
        }
    },

    sendNotification: ({ data, projectId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`NewNotification-${projectId}`, data);
        } catch (error) {
            ErrorService.log('realtimeService.sendNotification', error);
            throw error;
        }
    },

    updateTeamMemberRole: ({ projectId, data }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`TeamMemberRoleUpdate-${projectId}`, data);
        } catch (error) {
            ErrorService.log('realtimeService.updateTeamMemberRole', error);
            throw error;
        }
    },

    createTeamMember: ({ projectId, data }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`TeamMemberCreate-${projectId}`, data);
        } catch (error) {
            ErrorService.log('realtimeService.createTeamMember', error);
            throw error;
        }
    },

    deleteTeamMember: ({ projectId, data }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`TeamMemberDelete-${projectId}`, data);
        } catch (error) {
            ErrorService.log('realtimeService.deleteTeamMember', error);
            throw error;
        }
    },

    sendApplicationLogCreated: ({ applicationLog, componentId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(
                `createApplicationLog-${componentId}`,
                applicationLog
            );
        } catch (error) {
            ErrorService.log(
                'realtimeService.sendApplicationLogCreated',
                error
            );
            throw error;
        }
    },
    sendApplicationLogDelete: ({ applicationLog, componentId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(
                `deleteApplicationLog-${componentId}`,
                applicationLog
            );
        } catch (error) {
            ErrorService.log('realtimeService.sendApplicationLogDelete', error);
            throw error;
        }
    },
    sendLogCreated: ({ contentLog, applicationLogId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`createLog-${applicationLogId}`, contentLog);
        } catch (error) {
            ErrorService.log('realtimeService.sendLogCreated', error);
            throw error;
        }
    },
    applicationLogKeyReset: ({ applicationLog, componentId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(
                `applicationLogKeyReset-${componentId}`,
                applicationLog
            );
        } catch (error) {
            ErrorService.log('realtimeService.applicationLogKeyReset', error);
            throw error;
        }
    },
    sendContainerSecurityCreated: ({ containerSecurity, componentId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(
                `createContainerSecurity-${componentId}`,
                containerSecurity
            );
        } catch (error) {
            ErrorService.log(
                'realtimeService.sendContainerSecurityCreated',
                error
            );
            throw error;
        }
    },
    sendApplicationSecurityCreated: ({ applicationSecurity, componentId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(
                `createApplicationSecurity-${componentId}`,
                applicationSecurity
            );
        } catch (error) {
            ErrorService.log(
                'realtimeService.sendApplicationSecurityCreated',
                error
            );
            throw error;
        }
    },
    sendErrorTrackerCreated: ({ errorTracker, componentId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`createErrorTracker-${componentId}`, errorTracker);
        } catch (error) {
            ErrorService.log('realtimeService.sendErrorTrackerCreated', error);
            throw error;
        }
    },
    sendErrorTrackerDelete: ({ errorTracker, componentId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`deleteErrorTracker-${componentId}`, errorTracker);
        } catch (error) {
            ErrorService.log('realtimeService.sendErrorTrackerDelete', error);
            throw error;
        }
    },
    errorTrackerKeyReset: ({ errorTracker, componentId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`errorTrackerKeyReset-${componentId}`, errorTracker);
        } catch (error) {
            ErrorService.log('realtimeService.errorTrackerKeyReset', error);
            throw error;
        }
    },
    sendErrorEventCreated: ({ data, errorTrackerId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`createErrorEvent-${errorTrackerId}`, data);
        } catch (error) {
            ErrorService.log('realtimeService.sendErrorEventCreated', error);
            throw error;
        }
    },
    sendIssueStatusChange: ({ issue, type, errorTrackerId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`${type}Issue-${errorTrackerId}`, issue);
        } catch (error) {
            ErrorService.log('realtimeService.sendIssueStatusChange', error);
            throw error;
        }
    },
    sendErrorTrackerIssueDelete: ({ issue, errorTrackerId }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`deleteErrorTrackerIssue-${errorTrackerId}`, issue);
        } catch (error) {
            ErrorService.log(
                'realtimeService.sendErrorTrackerIssueDelete',
                error
            );
            throw error;
        }
    },
    sendTimeMetrics: ({ appId, data }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`timeMetrics-${appId}`, data);
        } catch (error) {
            ErrorService.log('realtimeService.sendTimeMetrics', error);
            throw error;
        }
    },
    sendThroughputMetrics: ({ appId, data }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`throughputMetrics-${appId}`, data);
        } catch (error) {
            ErrorService.log('realtimeService.sendThroughputMetrics', error);
            throw error;
        }
    },
    sendErrorMetrics: ({ appId, data }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`errorMetrics-${appId}`, data);
        } catch (error) {
            ErrorService.log('realtimeService.sendErrorMetrics', error);
            throw error;
        }
    },
    handleScanning: ({ security }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`security_${security._id}`, security);
        } catch (error) {
            ErrorService.log('realtimeService.handleScanning', error);
            throw error;
        }
    },
    handleLog: ({ securityId, securityLog }) => {
        try {
            if (!global || !global.io) {
                return;
            }

            global.io.emit(`securityLog_${securityId}`, securityLog);
        } catch (error) {
            ErrorService.log('realtimeService.handleLog', error);
            throw error;
        }
    },
};

const ErrorService = require('./errorService');
