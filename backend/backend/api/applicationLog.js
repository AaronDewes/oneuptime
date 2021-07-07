/**
 *
 * Copyright HackerBay, Inc.
 *
 */

const express = require('express');
const ApplicationLogService = require('../services/applicationLogService');
const UserService = require('../services/userService');
const ComponentService = require('../services/componentService');
const RealTimeService = require('../services/realTimeService');
const LogService = require('../services/logService');

const router = express.Router();
const getUser = require('../middlewares/user').getUser;
const isApplicationLogValid = require('../middlewares/applicationLog')
    .isApplicationLogValid;

const { isAuthorized } = require('../middlewares/authorization');
const sendErrorResponse = require('../middlewares/response').sendErrorResponse;
const sendItemResponse = require('../middlewares/response').sendItemResponse;
const sendListResponse = require('../middlewares/response').sendListResponse;
const isUserAdmin = require('../middlewares/project').isUserAdmin;
const ResourceCategoryService = require('../services/resourceCategoryService');
const uuid = require('uuid');

// Route
// Description: Adding a new application log to a component.
// Params:
// Param 1: req.params-> {componentId}; req.body -> {[_id], name}
// Returns: response status, error message
router.post(
    '/:projectId/:componentId/create',
    getUser,
    isAuthorized,
    isUserAdmin,
    async function(req, res) {
        try {
            const data = req.body;
            const componentId = req.params.componentId;
            if (!data) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: "values can't be null",
                });
            }
            data.createdById = req.user ? req.user.id : null;
            if (!data.name) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Application Log Name is required.',
                });
            }
            if (
                data.resourceCategory &&
                typeof data.resourceCategory !== 'string'
            ) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Resource Category ID is not of string type.',
                });
            }

            data.componentId = componentId;

            const [applicationLog, component, user] = await Promise.all([
                ApplicationLogService.create(data),
                ComponentService.findOneBy({
                    _id: componentId,
                }),
                UserService.findOneBy({ _id: req.user.id }),
            ]);

            component.projectId._id,
                `A New Application Log was Created with name ${applicationLog.name} by ${user.name}`,
                user._id,
                'applicationlogaddremove';
            // run in the background
            RealTimeService.sendApplicationLogCreated(applicationLog);
            return sendItemResponse(req, res, applicationLog);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

// Description: Get all Application Logs by componentId.
router.get('/:projectId/:componentId', getUser, isAuthorized, async function(
    req,
    res
) {
    try {
        const componentId = req.params.componentId;
        if (!componentId) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: "Component ID can't be null",
            });
        }
        const applicationLogs = await ApplicationLogService.getApplicationLogsByComponentId(
            componentId,
            req.query.limit || 0,
            req.query.skip || 0
        );
        return sendItemResponse(req, res, applicationLogs);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Description: Delete an Application Log by applicationLogId and componentId.
router.delete(
    '/:projectId/:componentId/:applicationLogId',
    getUser,
    isAuthorized,
    isUserAdmin,
    async function(req, res) {
        try {
            const applicationLog = await ApplicationLogService.deleteBy(
                {
                    _id: req.params.applicationLogId,
                    componentId: req.params.componentId,
                },
                req.user.id
            );
            if (applicationLog) {
                return sendItemResponse(req, res, applicationLog);
            } else {
                return sendErrorResponse(req, res, {
                    code: 404,
                    message: 'Application Log not found',
                });
            }
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

router.post('/:applicationLogId/log', isApplicationLogValid, async function(
    req,
    res
) {
    try {
        const data = req.body;
        const applicationLogId = req.params.applicationLogId;

        if (data.tags) {
            if (!(typeof data.tags === 'string' || Array.isArray(data.tags))) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message:
                        'Application Log Tags must be of type String or Array of Strings',
                });
            }
        }
        data.applicationLogId = applicationLogId;

        const log = await LogService.create(data);

        RealTimeService.sendLogCreated(log);
        return sendItemResponse(req, res, log);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});
// Description: Get all Logs by applicationLogId.
router.post(
    '/:projectId/:componentId/:applicationLogId/logs',
    getUser,
    isAuthorized,
    async function(req, res) {
        try {
            const { skip, limit, startDate, endDate, type, filter } = req.body;
            const applicationLogId = req.params.applicationLogId;

            const populate = [
                { path: 'componentId', select: 'name' },
                { path: 'resourceCategory', select: 'name' },
            ];
            const currentApplicationLog = await ApplicationLogService.findOneBy(
                {
                    query: {
                        _id: applicationLogId,
                    },
                    populate,
                }
            );
            if (!currentApplicationLog) {
                return sendErrorResponse(req, res, {
                    code: 404,
                    message: 'Application Log not found',
                });
            }

            const query = {};

            if (applicationLogId) query.applicationLogId = applicationLogId;

            if (type) query.type = type;

            if (startDate && endDate)
                query.createdAt = { $gte: startDate, $lte: endDate };

            if (filter) {
                query.stringifiedContent = {
                    $regex: new RegExp(filter),
                    $options: 'i',
                };
            }

            const [logs, count, dateRange] = await Promise.all([
                LogService.findBy(query, limit || 10, skip || 0),
                LogService.countBy(query),
                LogService.getDateRange(query),
            ]);
            return sendListResponse(req, res, { logs, dateRange }, count);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);
// Description: Get all Logs stat by applicationLogId.
router.post(
    '/:projectId/:componentId/:applicationLogId/stats',
    getUser,
    isAuthorized,
    async function(req, res) {
        try {
            const applicationLogId = req.params.applicationLogId;

            const currentApplicationLog = await ApplicationLogService.findOneBy(
                {
                    _id: applicationLogId,
                }
            );
            if (!currentApplicationLog) {
                return sendErrorResponse(req, res, {
                    code: 404,
                    message: 'Application Log not found',
                });
            }

            const query = {};

            if (applicationLogId) query.applicationLogId = applicationLogId;

            const stat = {};

            const [
                allCount,
                errorCount,
                infoCount,
                warningCount,
            ] = await Promise.all([
                LogService.countBy({ ...query, type: '' }),
                LogService.countBy({ ...query, type: 'error' }),
                LogService.countBy({ ...query, type: 'info' }),
                LogService.countBy({ ...query, type: 'warning' }),
            ]);
            stat.all = allCount;
            stat.error = errorCount;
            stat.info = infoCount;
            stat.warning = warningCount;

            return sendListResponse(req, res, stat);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

// Description: Reset Application Log Key by applicationLogId.
router.post(
    '/:projectId/:componentId/:applicationLogId/reset-key',
    getUser,
    isAuthorized,
    isUserAdmin,
    async function(req, res) {
        const applicationLogId = req.params.applicationLogId;

        const currentApplicationLog = await ApplicationLogService.findOneBy({
            _id: applicationLogId,
        });
        if (!currentApplicationLog) {
            return sendErrorResponse(req, res, {
                code: 404,
                message: 'Application Log not found',
            });
        }

        // application Log is valid
        const data = {
            key: uuid.v4(), // set new app log key
        };

        try {
            const applicationLog = await ApplicationLogService.updateOneBy(
                { _id: currentApplicationLog._id },
                data
            );
            return sendItemResponse(req, res, applicationLog);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

// Description: Update Application Log by applicationLogId.
router.put(
    '/:projectId/:componentId/:applicationLogId',
    getUser,
    isAuthorized,
    isUserAdmin,
    async function(req, res) {
        const applicationLogId = req.params.applicationLogId;

        const data = req.body;
        if (!data) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: "values can't be null",
            });
        }
        data.createdById = req.user ? req.user.id : null;

        if (!data.name && data.showQuickStart === undefined) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'New Application Log Name is required.',
            });
        }

        const currentApplicationLog = await ApplicationLogService.findOneBy({
            _id: applicationLogId,
        });
        if (!currentApplicationLog) {
            return sendErrorResponse(req, res, {
                code: 404,
                message: 'Application Log not found',
            });
        }

        // try to find in the application log if the name already exist for that component
        const existingQuery = {
            name: data.name,
            componentId: req.params.componentId,
        };

        const populate = [
            [
                {
                    path: 'componentId',
                    select: 'name slug projectId',
                    populate: {
                        path: 'projectId',
                        select: 'name slug',
                    },
                },
            ],
        ];

        if (data.resourceCategory != '') {
            existingQuery.resourceCategory = data.resourceCategory;
        }
        const existingApplicationLog = await ApplicationLogService.findBy({
            query: existingQuery,
            populate,
        });

        if (
            existingApplicationLog &&
            existingApplicationLog.length > 0 &&
            data.resourceCategory != '' &&
            data.showQuickStart === undefined
        ) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Application Log with that name already exists.',
            });
        }

        // application Log is valid
        const applicationLogUpdate = {};
        if (data.name) {
            applicationLogUpdate.name = data.name;
        }
        if (data.showQuickStart !== undefined) {
            applicationLogUpdate.showQuickStart = data.showQuickStart;
        }

        let unsetData;
        if (!data.resourceCategory || data.resourceCategory === '') {
            unsetData = { resourceCategory: '' };
        } else {
            const resourceCategoryModel = await ResourceCategoryService.findBy({
                _id: data.resourceCategory,
            });
            if (resourceCategoryModel) {
                applicationLogUpdate.resourceCategory = data.resourceCategory;
            } else {
                unsetData = { resourceCategory: '' };
            }
        }

        try {
            const applicationLog = await ApplicationLogService.updateOneBy(
                { _id: currentApplicationLog._id },
                applicationLogUpdate,
                unsetData
            );
            return sendItemResponse(req, res, applicationLog);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

module.exports = router;
