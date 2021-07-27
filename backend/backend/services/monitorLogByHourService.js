module.exports = {
    create: async function(data) {
        try {
            const LogHour = new MonitorLogByHourModel();

            LogHour.monitorId = data.monitorId;
            LogHour.probeId = data.probeId;
            LogHour.status = data.status;
            LogHour.responseTime = data.responseTime;
            LogHour.responseStatus = data.responseStatus;
            LogHour.cpuLoad = data.cpuLoad;
            LogHour.avgCpuLoad = data.avgCpuLoad;
            LogHour.cpuCores = data.cpuCores;
            LogHour.memoryUsed = data.memoryUsed;
            LogHour.totalMemory = data.totalMemory;
            LogHour.swapUsed = data.swapUsed;
            LogHour.storageUsed = data.storageUsed;
            LogHour.totalStorage = data.totalStorage;
            LogHour.storageUsage = data.storageUsage;
            LogHour.mainTemp = data.mainTemp;
            LogHour.maxTemp = data.maxTemp;
            LogHour.maxResponseTime = data.responseTime;
            LogHour.maxCpuLoad = data.cpuLoad;
            LogHour.maxMemoryUsed = data.memoryUsed;
            LogHour.maxStorageUsed = data.storageUsed;
            LogHour.maxMainTemp = data.mainTemp;
            LogHour.intervalDate = data.intervalDate;
            LogHour.sslCertificate = data.sslCertificate;
            LogHour.kubernetesLog = data.kubernetesData || {};

            const savedLogHour = await LogHour.save();

            return savedLogHour;
        } catch (error) {
            ErrorService.log('monitorLogByHourService.create', error);
            throw error;
        }
    },

    updateOneBy: async function(query, data) {
        try {
            if (!query) {
                query = {};
            }

            const monitorLogByHour = await MonitorLogByHourModel.findOneAndUpdate(
                query,
                { $set: data },
                {
                    new: true,
                }
            );

            return monitorLogByHour;
        } catch (error) {
            ErrorService.log('monitorLogByHourService.updateOneBy', error);
            throw error;
        }
    },

    async findBy({ query, limit, skip, select, populate }) {
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

            let monitorLogsByHourQuery = MonitorLogByHourModel.find(query)
                .lean()
                .sort([['createdAt', -1]])
                .limit(limit)
                .skip(skip);

            monitorLogsByHourQuery = handleSelect(
                select,
                monitorLogsByHourQuery
            );
            monitorLogsByHourQuery = handlePopulate(
                populate,
                monitorLogsByHourQuery
            );

            const monitorLogsByHour = await monitorLogsByHourQuery;

            return monitorLogsByHour;
        } catch (error) {
            ErrorService.log('monitorLogByHourService.findBy', error);
            throw error;
        }
    },

    async findOneBy({ query, select, populate }) {
        try {
            if (!query) {
                query = {};
            }

            let monitorLogQuery = MonitorLogByHourModel.findOne(query).lean();

            monitorLogQuery = handleSelect(select, monitorLogQuery);
            monitorLogQuery = handlePopulate(populate, monitorLogQuery);

            const monitorLog = await monitorLogQuery;
            return monitorLog;
        } catch (error) {
            ErrorService.log('monitorLogByHourService.findOneBy', error);
            throw error;
        }
    },

    async countBy(query) {
        try {
            if (!query) {
                query = {};
            }

            const count = await MonitorLogByHourModel.countDocuments(query);

            return count;
        } catch (error) {
            ErrorService.log('monitorLogByHourService.countBy', error);
            throw error;
        }
    },
};

const MonitorLogByHourModel = require('../models/monitorLogByHour');
const ErrorService = require('../services/errorService');
const handleSelect = require('../utils/select');
const handlePopulate = require('../utils/populate');
