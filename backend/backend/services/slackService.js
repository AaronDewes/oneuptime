module.exports = {
    // process messages to be sent to slack workspace channels
    sendNotification: async function(
        projectId,
        incident,
        monitor,
        incidentStatus,
        component,
        duration
    ) {
        try {
            const self = this;
            let response;
            const project = await ProjectService.findOneBy({ _id: projectId });
            if (project && project.parentProjectId) {
                projectId = project.parentProjectId._id;
            }
            let query = {
                projectId: projectId,
                integrationType: 'slack',
                monitorId: monitor._id,
            };
            if (incidentStatus === 'resolved') {
                query = {
                    ...query,
                    'notificationOptions.incidentResolved': true,
                };
            } else if (incidentStatus === 'created') {
                query = {
                    ...query,
                    'notificationOptions.incidentCreated': true,
                };
            } else if (incidentStatus === 'acknowledged') {
                query = {
                    ...query,
                    'notificationOptions.incidentAcknowledged': true,
                };
            } else {
                return;
            }
            const integrations = await IntegrationService.findBy(query);
            const monitorStatus = await MonitorStatusService.findOneBy({
                monitorId: monitor._id,
            });

            for (const integration of integrations) {
                response = await self.notify(
                    project,
                    monitor,
                    incident,
                    integration,
                    monitorStatus ? monitorStatus.status : null,
                    component,
                    duration
                );
            }
            return response;
        } catch (error) {
            ErrorService.log('msTeamsService.sendNotification', error);
            throw error;
        }
    },

    // send notification to slack workspace channels
    async notify(
        project,
        monitor,
        incident,
        integration,
        monitorStatus,
        component,
        duration
    ) {
        try {
            const uri = `${global.dashboardHost}/project/${component.projectId._id}/${component._id}/incidents/${incident._id}`;

            const payloadText = incident.resolved
                ? `Incident on *${component.name} / ${
                      monitor.name
                  }* is resolved by ${
                      incident.resolvedBy ? incident.resolvedBy.name : 'Fyipe'
                  } at ${
                      incident.resolvedAt
                  } after being down for ${duration}\n <${uri}|More details>`
                : incident.acknowledged
                ? `Incident on *${component.name} / ${
                      monitor.name
                  }* is acknowledge by ${
                      incident.acknowledgedBy
                          ? incident.acknowledgedBy.name
                          : 'Fyipe'
                  } at ${
                      incident.acknowledgedAt
                  } after being down for ${duration}\n <${uri}|More details>`
                : `
*New incident:*

*Project name:* ${project.name}

*Monitor name:* ${component.name} / ${monitor.name}

*Created at:* ${incident.createdAt}

*Created by:* ${incident.createdById ? incident.createdById.name : 'Fyipe'}

*Incident status:* ${incident.incidentType}

*Monitor status:* ${monitorStatus}

<${uri}|Acknowledge>
`;
            const payload = {
                text: payloadText,
            };
            await axios.post(
                integration.data.endpoint,
                {
                    ...payload,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            return 'Webhook successfully pinged';
        } catch (error) {
            ErrorService.log('WebHookService.notify', error);
            throw error;
        }
    },
};

const IntegrationService = require('./integrationService');
const axios = require('axios');
const ProjectService = require('./projectService');
const MonitorStatusService = require('./monitorStatusService');
const ErrorService = require('./errorService');
