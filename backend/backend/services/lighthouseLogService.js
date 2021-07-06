module.exports = {
    create: async function(data) {
        try {
            const Log = new LighthouseLogModel();

            Log.monitorId = data.monitorId;
            Log.probeId = data.probeId;
            Log.data = data.lighthouseData.issues;
            Log.url = data.lighthouseData.url;
            Log.performance = data.performance;
            Log.accessibility = data.accessibility;
            Log.bestPractices = data.bestPractices;
            Log.seo = data.seo;
            Log.pwa = data.pwa;
            Log.scanning = data.scanning;

            const savedLog = await Log.save();

            await this.sendLighthouseLog(savedLog);

            if (data.probeId && data.monitorId)
                await probeService.sendProbe(data.probeId, data.monitorId);

            return savedLog;
        } catch (error) {
            ErrorService.log('lighthouseLogService.create', error);
            throw error;
        }
    },

    updateOneBy: async function(query, data) {
        try {
            if (!query) {
                query = {};
            }

            const lighthouseLog = await LighthouseLogModel.findOneAndUpdate(
                query,
                { $set: data },
                {
                    new: true,
                }
            );

            return lighthouseLog;
        } catch (error) {
            ErrorService.log('lighthouseLogService.updateOneBy', error);
            throw error;
        }
    },
    updateManyBy: async function(query, data) {
        try {
            if (!query) {
                query = {};
            }

            const lighthouseLog = await LighthouseLogModel.updateMany(
                query,
                { $set: data },
                {
                    new: true,
                }
            );

            return lighthouseLog;
        } catch (error) {
            ErrorService.log('lighthouseLogService.updateManyBy', error);
            throw error;
        }
    },

    async findBy(query, limit, skip) {
        try {
            if (!skip) skip = 0;

            if (!limit) limit = 0;

            if (typeof skip === 'string') {
                skip = parseInt(skip);
            }

            if (typeof limit === 'string') {
                limit = parseInt(limit);
            }

            if (!query) {
                query = {};
            }

            const lighthouseLogs = await LighthouseLogModel.find(query)
                .lean()
                .sort([['createdAt', -1]])
                .limit(limit)
                .skip(skip)
                .populate('probeId');

            return lighthouseLogs;
        } catch (error) {
            ErrorService.log('lighthouseLogService.findBy', error);
            throw error;
        }
    },

    async findOneBy(query) {
        try {
            if (!query) {
                query = {};
            }

            const lighthouseLog = await LighthouseLogModel.findOne(query)
                .lean()
                .populate('probeId');

            return lighthouseLog;
        } catch (error) {
            ErrorService.log('lighthouseLogService.findOneBy', error);
            throw error;
        }
    },

    async findLastestScan({ monitorId, url, skip, limit }) {
        try {
            if (!skip) skip = 0;

            if (!limit) limit = 0;

            if (typeof skip === 'string') {
                skip = parseInt(skip);
            }

            if (typeof limit === 'string') {
                limit = parseInt(limit);
            }

            let lighthouseLogs = [];
            let siteUrls;

            const monitor = await MonitorService.findOneBy({
                _id: monitorId,
            });

            if (url) {
                if (monitor.siteUrls && monitor.siteUrls.includes(url)) {
                    siteUrls = [url];
                    let log = await this.findBy({ monitorId, url }, 1, 0);
                    if (!log || (log && log.length === 0)) {
                        log = [{ url }];
                    }
                    lighthouseLogs = log;
                }
            } else {
                siteUrls = monitor.siteUrls || [];
                if (siteUrls.length > 0) {
                    for (const url of siteUrls.slice(
                        skip,
                        limit < siteUrls.length - skip ? limit : siteUrls.length
                    )) {
                        let log = await this.findBy({ monitorId, url }, 1, 0);
                        if (!log || (log && log.length === 0)) {
                            log = [{ url }];
                        }
                        lighthouseLogs = [...lighthouseLogs, ...log];
                    }
                }
            }

            return {
                lighthouseLogs,
                count: siteUrls && siteUrls.length ? siteUrls.length : 0,
            };
        } catch (error) {
            ErrorService.log('lighthouseLogService.findLastestScan', error);
            throw error;
        }
    },

    async countBy(query) {
        try {
            if (!query) {
                query = {};
            }

            const count = await LighthouseLogModel.countDocuments(query);

            return count;
        } catch (error) {
            ErrorService.log('lighthouseLogService.countBy', error);
            throw error;
        }
    },

    async sendLighthouseLog(data) {
        try {
            const monitor = await MonitorService.findOneBy({
                _id: data.monitorId,
            });
            if (monitor && monitor.projectId && monitor.projectId._id) {
                // run in the background
                RealTimeService.updateLighthouseLog(
                    data,
                    monitor.projectId._id
                );
            }
        } catch (error) {
            ErrorService.log('lighthouseLogService.sendLighthouseLog', error);
            throw error;
        }
    },
    async updateAllLighthouseLogs(projectId, monitorId, query) {
        try {
            await this.updateManyBy({ monitorId: monitorId }, query);
            const logs = await this.findLastestScan({
                monitorId,
                url: null,
                limit: 5,
                skip: 0,
            });
            // run in the background
            RealTimeService.updateAllLighthouseLog(projectId, {
                monitorId,
                logs,
            });
        } catch (error) {
            ErrorService.log(
                'lighthouseLogService.updateAllLighthouseLog',
                error
            );
            throw error;
        }
    },
};

const LighthouseLogModel = require('../models/lighthouseLog');
const MonitorService = require('./monitorService');
const RealTimeService = require('./realTimeService');
const probeService = require('./probeService');
const ErrorService = require('./errorService');
