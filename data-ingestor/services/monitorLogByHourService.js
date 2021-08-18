module.exports = {
    create: async function(data) {
        try {
            const LogHour = {};
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
            LogHour.createdAt = new Date(moment().format());

            const result = await monitorLogByHourCollection.insertOne(LogHour);
            const savedLogHour = await this.findOneBy({
                _id: ObjectId(result.insertedId),
            });

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

            if (!query.deleted)
                query.$or = [
                    { deleted: false },
                    { deleted: { $exists: false } },
                ];

            await monitorLogByHourCollection.updateOne(query, { $set: data });
            const monitorLogByHour = await monitorLogByHourCollection.findOne(
                query
            );

            return monitorLogByHour;
        } catch (error) {
            ErrorService.log('monitorLogByHourService.updateOneBy', error);
            throw error;
        }
    },

    async findOneBy(query) {
        try {
            if (!query) {
                query = {};
            }

            if (!query.deleted)
                query.$or = [
                    { deleted: false },
                    { deleted: { $exists: false } },
                ];

            const monitorLog = await monitorLogByHourCollection.findOne(query);

            return monitorLog;
        } catch (error) {
            ErrorService.log('monitorLogByHourService.findOneBy', error);
            throw error;
        }
    },
};

const { ObjectId } = require('mongodb');
const ErrorService = require('../services/errorService');
const monitorLogByHourCollection = global.db.collection('monitorlogbyhours');
const moment = require('moment');
