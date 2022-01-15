const ScriptModel = require('../models/automatedScripts');
const ScriptModelLog = require('../models/automationScriptsLog');
const { postApi } = require('../utils/api');
const getSlug = require('../utils/getSlug');
const scriptBaseUrl = process.env['SCRIPT_RUNNER_URL'];
const handleSelect = require('../utils/select');
const handlePopulate = require('../utils/populate');

module.exports = {
    findBy: async function({ query, skip, limit, select, populate }) {
        if (!skip) skip = 0;

        if (!limit) limit = 10;

        if (typeof skip === 'string') skip = parseInt(skip);

        if (typeof limit === 'string') limit = parseInt(limit);

        if (!query) query = {};

        query.deleted = false;

        let sortDataListQuery = ScriptModel.find(query)
            .sort([['createdAt', -1]])
            .limit(limit)
            .skip(skip);

        sortDataListQuery = handleSelect(select, sortDataListQuery);
        sortDataListQuery = handlePopulate(populate, sortDataListQuery);

        const sortDataList = await sortDataListQuery;
        return sortDataList;
    },

    countBy: async function(query) {
        if (!query) {
            query = {};
        }
        query.deleted = false;
        const count = await ScriptModel.countDocuments(query);
        return count;
    },

    countLogsBy: async function(query) {
        if (!query) {
            query = {};
        }
        query.deleted = false;
        const count = await ScriptModelLog.countDocuments(query);
        return count;
    },

    create: async function(data) {
        const script = new ScriptModel();
        script.name = data.name || null;
        script.slug = getSlug(data.name) || null;
        script.scriptType = data.scriptType || null;
        script.successEvent = data.successEvent || null;
        script.failureEvent = data.failureEvent || null;
        script.projectId = data.projectId || null;
        script.script = data.script || null;
        const newScript = await script.save();

        return newScript;
    },

    createLog: async function(id, data) {
        const scriptLog = new ScriptModelLog();
        scriptLog.automationScriptId = id || null;
        scriptLog.triggerByUser = data.triggerByUser || null;
        scriptLog.triggerByScript = data.triggerByScript || null;
        scriptLog.triggerByIncident = data.triggerByIncident || null;
        scriptLog.status = data.status || null;
        scriptLog.executionTime = data.executionTime || null;
        scriptLog.consoleLogs = data.consoleLogs || null;
        scriptLog.error = data.error || null;
        const newScriptLog = await scriptLog.save();

        return newScriptLog;
    },

    updateOne: async function(query, data) {
        if (!query) {
            query = {};
        }
        query.deleted = false;
        const response = ScriptModel.findOneAndUpdate(
            query,
            {
                $set: data,
            },
            {
                new: true,
            }
        );
        return response;
    },

    findAllLogs: async function(query, skip, limit) {
        if (!skip) skip = 0;

        if (!limit) limit = 10;

        if (typeof skip === 'string') skip = parseInt(skip);

        if (typeof limit === 'string') limit = parseInt(limit);
        if (!query) {
            query = {};
        }
        query.deleted = false;
        const response = await ScriptModelLog.find(query)
            .sort([['createdAt', -1]])
            .limit(limit)
            .skip(skip)
            .populate('automationScriptId', 'name')
            .populate('triggerByUser', 'name')
            .populate('triggerByIncident', 'idNumber slug')
            .populate('triggerByScript', 'name');
        return response;
    },

    findOneBy: async function({ query, select, populate }) {
        if (!query) {
            query = {};
        }

        query.deleted = false;
        let responseQuery = ScriptModel.findOne(query).lean();

        responseQuery = handleSelect(select, responseQuery);
        responseQuery = handlePopulate(populate, responseQuery);

        const response = await responseQuery;
        return response;
    },

    getAutomatedLogs: async function(query, skip, limit) {
        const _this = this;
        const response = await _this.findAllLogs(query, skip, limit);
        return response;
    },

    createScript: async function(data) {
        const _this = this;
        const response = await _this.create(data);
        return response;
    },

    runResource: async function({
        triggeredId,
        triggeredBy,
        resources,
        stackSize = 0,
    }) {
        const _this = this;
        if (stackSize === 3) {
            const resource = resources[0];
            if (resource) {
                let type;
                if (resource.automatedScript) {
                    type = 'automatedScript';
                } else if (resource.callSchedule) {
                    type = 'callSchedule';
                }
                const data = {
                    status: 'failed',
                    success: false,
                    executionTime: 1,
                    error: 'stackoverflow',
                    consoleLogs: ['Out of stack'],
                };
                switch (type) {
                    case 'automatedScript':
                        data.triggerByScript = triggeredId;
                        break;
                    default:
                        return null;
                }

                await _this.createLog(resource.automatedScript, data);
            }
        }

        if (stackSize > 2) {
            return;
        }
        const events = Array.isArray(resources) ? resources : [resources]; // object property => {callSchedule?, automatedScript?}
        const eventPromises = events.map(event => {
            let resourceType;
            if (event.automatedScript) {
                resourceType = 'automatedScript';
            } else if (event.callSchedule) {
                resourceType = 'callSchedule';
            }
            const automatedScriptId = event.automatedScript;
            switch (resourceType) {
                case 'automatedScript':
                    return _this.runAutomatedScript({
                        automatedScriptId,
                        triggeredId,
                        triggeredBy,
                        stackSize: stackSize + 1,
                    });
                default:
                    return null;
            }
        });

        return Promise.all(eventPromises);
    },

    runAutomatedScript: async function({
        automatedScriptId,
        triggeredId,
        triggeredBy = 'script',
        stackSize,
    }) {
        const _this = this;
        const selectScript =
            'name script scriptType slug projectId successEvent failureEvent';
        const populateScript = [{ path: 'createdById', select: 'name' }];

        const {
            script,
            scriptType,
            successEvent,
            failureEvent,
        } = await _this.findOneBy({
            query: { _id: automatedScriptId },
            select: selectScript,
            populate: populateScript,
        });
        let data = null;
        if (scriptType === 'JavaScript') {
            const result = await postApi(`${scriptBaseUrl}/script/js`, {
                script,
            });
            data = {
                success: result.success,
                message: result.message,
                errors: result.success
                    ? undefined
                    : result.message + ': ' + result.errors,
                status: result.status,
                executionTime: result.executionTime,
                consoleLogs: result.consoleLogs,
            };
        } else if (scriptType === 'Bash') {
            const result = await postApi(`${scriptBaseUrl}/script/bash`, {
                script,
            });
            data = {
                success: result.success,
                errors: result.errors,
                status: result.status,
                executionTime: result.executionTime,
                consoleLogs: result.consoleLogs,
            };
        }
        triggeredBy === 'user'
            ? (data.triggerByUser = triggeredId)
            : triggeredBy === 'script'
            ? (data.triggerByScript = triggeredId)
            : triggeredBy === 'incident'
            ? (data.triggerByIncident = triggeredId)
            : null;
        if (data.success && successEvent.length > 0) {
            await _this.runResource({
                triggeredId: automatedScriptId,
                resources: successEvent,
                stackSize,
            });
        }
        if (!data.success && failureEvent.length > 0) {
            await _this.runResource({
                triggeredId: automatedScriptId,
                resources: failureEvent,
                stackSize,
            });
        }
        const automatedScriptLog = await _this.createLog(
            automatedScriptId,
            data
        );
        await _this.updateOne(
            { _id: automatedScriptId },
            { updatedAt: new Date() }
        );
        return automatedScriptLog;
    },

    removeScriptFromEvent: async function({ projectId, id }) {
        const _this = this;
        const scripts = await ScriptModel.find({ projectId }).lean();
        await Promise.all(
            scripts.map(async script => {
                const successEvent = script.successEvent.filter(
                    script => String(script.automatedScript) !== String(id)
                );
                const failureEvent = script.failureEvent.filter(
                    script => String(script.automatedScript) !== String(id)
                );
                return await _this.updateOne(
                    { _id: script._id },
                    { successEvent, failureEvent }
                );
            })
        );
    },

    deleteBy: async function(query, userId) {
        if (!query) {
            query = {};
        }

        query.deleted = false;
        const response = await ScriptModel.findOneAndUpdate(
            query,
            {
                $set: {
                    deleted: true,
                    deletedById: userId,
                    deletedAt: Date.now(),
                },
            },
            {
                new: true,
            }
        );
        return response;
    },

    hardDeleteBy: async function({ query }) {
        await ScriptModel.deleteMany(query);
    },
};
