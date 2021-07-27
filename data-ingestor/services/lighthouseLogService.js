const lighthouseLogCollection = global.db.collection('lighthouselogs');
const probeService = require('./probeService');
const ErrorService = require('./errorService');
const { ObjectId } = require('mongodb');
const MonitorService = require('./monitorService');
const { postApi } = require('../utils/api');
const moment = require('moment');
const { realtimeUrl } = require('../utils/config');
const ProjectService = require('./projectService');

const realtimeBaseUrl = `${realtimeUrl}/api/realtime`;

module.exports = {
    create: async function(data) {
        try {
            const result = await lighthouseLogCollection.insertOne({
                monitorId: data.monitorId,
                probeId: data.probeId,
                data: data.lighthouseData.issues,
                url: data.lighthouseData.url,
                performance: data.performance,
                accessibility: data.accessibility,
                bestPractices: data.bestPractices,
                seo: data.seo,
                pwa: data.pwa,
                scanning: data.scanning,
                createdAt: new Date(moment().format()),
            });
            const savedLog = await this.findOneBy({
                _id: ObjectId(result.insertedId),
            });

            await this.sendLighthouseLog(savedLog);

            if (data.probeId && data.monitorId) {
                await probeService.sendProbe(data.probeId, data.monitorId);
            }

            return savedLog;
        } catch (error) {
            ErrorService.log('lighthouseLogService.create', error);
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

            const log = await lighthouseLogCollection.findOne(query);

            return log;
        } catch (error) {
            ErrorService.log('lighthouseLogService.findOneBy', error);
            throw error;
        }
    },

    async sendLighthouseLog(data) {
        try {
            const monitor = await MonitorService.findOneBy({
                query: { _id: ObjectId(data.monitorId) },
            });

            if (monitor && monitor.projectId) {
                const project = await ProjectService.findOneBy({
                    query: {
                        _id: ObjectId(
                            monitor.projectId._id || monitor.projectId
                        ),
                    },
                });
                const parentProjectId = project
                    ? project.parentProjectId
                        ? project.parentProjectId._id || project.parentProjectId
                        : project._id
                    : monitor.projectId._id || monitor.projectId;

                // realtime update
                postApi(
                    `${realtimeBaseUrl}/update-lighthouse-log`,
                    {
                        data,
                        projectId: monitor.projectId._id || monitor.projectId,
                        monitorId: data.monitorId,
                        parentProjectId,
                    },
                    true
                );
            }
        } catch (error) {
            ErrorService.log('lighthouseLogService.sendLighthouseLog', error);
            throw error;
        }
    },

    updateManyBy: async function(query, data) {
        try {
            if (!query) {
                query = {};
            }

            await lighthouseLogCollection.updateMany(query, {
                $set: data,
            });
            // fetch updated items
            const lighthouseLog = await lighthouseLogCollection
                .find(query)
                .toArray();

            return lighthouseLog;
        } catch (error) {
            ErrorService.log('lighthouseLogService.updateManyBy', error);
            throw error;
        }
    },

    async updateAllLighthouseLogs(monitorId, query) {
        try {
            await this.updateManyBy({ monitorId: monitorId }, query);
        } catch (error) {
            ErrorService.log(
                'lighthouseLogService.updateAllLighthouseLog',
                error
            );
            throw error;
        }
    },
};
