module.exports = {
    create: async function(data) {
        try {
            const _this = this;
            // try to get the component by the ID
            const component = await ComponentService.findOneBy({
                _id: data.componentId,
            });
            // send an error if the component doesnt exist
            if (!component) {
                const error = new Error('Component does not exist.');
                error.code = 400;
                ErrorService.log('applicationLogService.create', error);
                throw error;
            }
            // try to find in the application log if the name already exist for that component
            const existingApplicationLog = await _this.findBy({
                name: data.name,
                componentId: data.componentId,
            });
            if (existingApplicationLog && existingApplicationLog.length > 0) {
                const error = new Error(
                    'Application Log with that name already exists.'
                );
                error.code = 400;
                ErrorService.log('applicationLogService.create', error);
                throw error;
            }
            const resourceCategory = await ResourceCategoryService.findBy({
                _id: data.resourceCategory,
            });
            // prepare application log model
            let applicationLog = new ApplicationLogModel();
            applicationLog.name = data.name;
            applicationLog.key = uuid.v4(); // generate random string here
            applicationLog.componentId = data.componentId;
            applicationLog.createdById = data.createdById;
            if (resourceCategory) {
                applicationLog.resourceCategory = data.resourceCategory;
            }
            let name = data.name;
            name = slugify(name);
            name = `${name}-${generate('1234567890', 8)}`;
            applicationLog.slug = name.toLowerCase();
            const savedApplicationLog = await applicationLog.save();
            applicationLog = await _this.findOneBy({
                _id: savedApplicationLog._id,
            });
            return applicationLog;
        } catch (error) {
            ErrorService.log('applicationLogService.create', error);
            throw error;
        }
    },
    //Description: Gets all application logs by component.
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

            if (!query.deleted) query.deleted = false;
            const applicationLogs = await ApplicationLogModel.find(query)
                .sort([['createdAt', -1]])
                .limit(limit)
                .skip(skip)
                .populate({
                    path: 'componentId',
                    select: 'name slug projectId',
                    populate: {
                        path: 'projectId',
                        select: 'name',
                    },
                })
                .populate('resourceCategory', 'name');
            return applicationLogs;
        } catch (error) {
            ErrorService.log('applicationLogService.findBy', error);
            throw error;
        }
    },

    async findOneBy(query) {
        try {
            if (!query) {
                query = {};
            }

            if (!query.deleted) query.deleted = false;
            const applicationLog = await ApplicationLogModel.findOne(query)
                .populate('componentId', 'name')
                .populate('resourceCategory', 'name');
            return applicationLog;
        } catch (error) {
            ErrorService.log('applicationLogService.findOneBy', error);
            throw error;
        }
    },

    async getApplicationLogsByComponentId(componentId, limit, skip) {
        // try to get the component by the ID
        const component = await ComponentService.findOneBy({
            _id: componentId,
        });
        // send an error if the component doesnt exist
        if (!component) {
            const error = new Error('Component does not exist.');
            error.code = 400;
            ErrorService.log(
                'applicationLogService.getApplicationLogsByComponentId',
                error
            );
            throw error;
        }

        try {
            if (typeof limit === 'string') limit = parseInt(limit);
            if (typeof skip === 'string') skip = parseInt(skip);
            const _this = this;

            const applicationLogs = await _this.findBy(
                { componentId: componentId },
                limit,
                skip
            );
            return applicationLogs;
        } catch (error) {
            ErrorService.log(
                'applicationLogService.getApplicationLogsByComponentId',
                error
            );
            throw error;
        }
    },
    deleteBy: async function(query, userId) {
        try {
            if (!query) {
                query = {};
            }

            query.deleted = false;
            const applicationLog = await ApplicationLogModel.findOneAndUpdate(
                query,
                {
                    $set: {
                        deleted: true,
                        deletedAt: Date.now(),
                        deletedById: userId,
                    },
                },
                { new: true }
            ).populate('deletedById', 'name');
            if (applicationLog) {
                const component = ComponentService.findOneBy({
                    _id: applicationLog.componentId._id,
                });
                await NotificationService.create(
                    component.projectId,
                    `An Application Log ${applicationLog.name} was deleted from the component ${applicationLog.componentId.name} by ${applicationLog.deletedById.name}`,
                    applicationLog.deletedById._id,
                    'applicationLogaddremove'
                );
                await RealTimeService.sendApplicationLogDelete(applicationLog);
                return applicationLog;
            } else {
                return null;
            }
        } catch (error) {
            ErrorService.log('applicationLogService.deleteBy', error);
            throw error;
        }
    },
    updateOneBy: async function(query, data, unsetData = null) {
        try {
            if (!query) {
                query = {};
            }

            if (!query.deleted) query.deleted = false;
            if (data && data.name) {
                let name = data.name;
                name = slugify(name);
                name = `${name}-${generate('1234567890', 8)}`;
                data.slug = name.toLowerCase();
            }
            let applicationLog = await ApplicationLogModel.findOneAndUpdate(
                query,
                { $set: data },
                {
                    new: true,
                }
            );

            if (unsetData) {
                applicationLog = await ApplicationLogModel.findOneAndUpdate(
                    query,
                    { $unset: unsetData },
                    {
                        new: true,
                    }
                );
            }

            applicationLog = await this.findOneBy(query);

            await RealTimeService.applicationLogKeyReset(applicationLog);

            return applicationLog;
        } catch (error) {
            ErrorService.log('applicationLogService.updateOneBy', error);
            throw error;
        }
    },
    hardDeleteBy: async function(query) {
        try {
            await ApplicationLogModel.deleteMany(query);
            return 'Application Log(s) removed successfully!';
        } catch (error) {
            ErrorService.log('applicationLogService.hardDeleteBy', error);
            throw error;
        }
    },
    async countBy(query) {
        try {
            if (!query) {
                query = {};
            }

            if (!query.deleted) query.deleted = false;
            const count = await ApplicationLogModel.countDocuments(query);
            return count;
        } catch (error) {
            ErrorService.log('applicationLogService.countBy', error);
            throw error;
        }
    },
};

const ApplicationLogModel = require('../models/applicationLog');
const ErrorService = require('./errorService');
const ComponentService = require('./componentService');
const generate = require('nanoid/generate');
const slugify = require('slugify');
const RealTimeService = require('./realTimeService');
const NotificationService = require('./notificationService');
const ResourceCategoryService = require('./resourceCategoryService');
const uuid = require('uuid');
