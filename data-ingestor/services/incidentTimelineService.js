const IncidentService = require('./incidentService');
const ErrorService = require('./errorService');
const incidentTimelineCollection = global.db.collection('incidenttimelines');
const { ObjectId } = require('mongodb');
const { postApi } = require('../utils/api');
const moment = require('moment');
const { realtimeUrl } = require('../utils/config');
const ProjectService = require('./projectService');

const realtimeBaseUrl = `${realtimeUrl}/realtime`;

module.exports = {
    create: async function(data) {
        try {
            let incidentTimeline = {};

            incidentTimeline.incidentId = data.incidentId;
            if (data.createdById) {
                incidentTimeline.createdById = data.createdById;
            }
            if (data.probeId) {
                incidentTimeline.probeId = data.probeId;
            }
            if (data.incident_state) {
                incidentTimeline.incident_state = data.incident_state;
            }
            incidentTimeline.createdByZapier = data.createdByZapier || false;
            incidentTimeline.status = data.status;
            incidentTimeline.createdAt = new Date(moment().format());
            incidentTimeline.deleted = false;

            const result = await incidentTimelineCollection.insertOne(
                incidentTimeline
            );

            const [timeline, incident] = await Promise.all([
                this.findOneBy({
                    _id: ObjectId(result.insertedId),
                }),
                IncidentService.findOneBy({
                    query: { _id: ObjectId(data.incidentId) },
                }),
            ]);
            incidentTimeline = timeline;

            if (incident) {
                const _incidentTimeline = Object.assign(
                    {},
                    incidentTimeline._doc || incidentTimeline,
                    {
                        projectId: incident.projectId._id || incident.projectId,
                    }
                );

                const project = ProjectService.findOneBy({
                    query: {
                        _id: ObjectId(
                            _incidentTimeline.projectId._id ||
                                _incidentTimeline.projectId
                        ),
                    },
                });
                const projectId = project
                    ? project.parentProjectId
                        ? project.parentProjectId._id || project.parentProjectId
                        : project._id
                    : incidentTimeline.projectId._id ||
                      incidentTimeline.projectId;

                // realtime update
                postApi(
                    `${realtimeBaseUrl}/update-incident-timeline`,
                    {
                        incidentTimeline: _incidentTimeline,
                        projectId,
                    },
                    true
                ).catch(error => {
                    ErrorService.log('incidentTimelineService.create', error);
                });
            }

            return incidentTimeline;
        } catch (error) {
            ErrorService.log('incidentTimelineService.create', error);
            throw error;
        }
    },

    findOneBy: async function(query) {
        try {
            if (!query) {
                query = {};
            }

            if (!query.deleted)
                query.$or = [
                    { deleted: false },
                    { deleted: { $exists: false } },
                ];

            const incidentTimeline = await incidentTimelineCollection.findOne(
                query
            );

            return incidentTimeline;
        } catch (error) {
            ErrorService.log('incidentTimelineService.findOneBy', error);
            throw error;
        }
    },
};
