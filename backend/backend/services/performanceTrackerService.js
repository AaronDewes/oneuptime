const PerformanceTrackerModel = require('../models/performanceTracker');
const ErrorService = require('./errorService');
const ComponentService = require('./componentService');
const generate = require('nanoid/generate');
const slugify = require('slugify');
// const RealTimeService = require('./realTimeService');
const NotificationService = require('./notificationService');
const uuid = require('uuid');
const handleSelect = require('../utils/select');
const handlePopulate = require('../utils/populate');

module.exports = {
    create: async function(data) {
        try {
            const _this = this;
            // check if component exists
            const componentCount = await ComponentService.countBy({
                _id: data.componentId,
            });
            // send an error if the component doesnt exist
            if (!componentCount || componentCount === 0) {
                const error = new Error('Component does not exist.');
                error.code = 400;
                ErrorService.log('performanceTrackerService.create', error);
                throw error;
            }
            // check if a performance tracker already exist with the same name for a particular component
            const existingPerformanceTracker = await _this.findBy({
                query: { name: data.name, componentId: data.componentId },
                select: '_id',
            });
            if (
                existingPerformanceTracker &&
                existingPerformanceTracker.length > 0
            ) {
                const error = new Error(
                    'Performance tracker with that name already exists.'
                );
                error.code = 400;
                ErrorService.log('performanceTrackerService.create', error);
                throw error;
            }

            data.key = uuid.v4();
            // handle the slug
            let name = data.name;
            name = slugify(name);
            name = `${name}-${generate('1234567890', 8)}`;
            data.slug = name.toLowerCase();

            let performanceTracker = await PerformanceTrackerModel.create(data);

            const select =
                'componentId name slug key showQuickStart createdById';
            const populate = [
                { path: 'createdById', select: 'name email' },
                {
                    path: 'componentId',
                    select: 'name slug',
                    populate: { path: 'projectId', select: 'name slug' },
                },
            ];
            performanceTracker = await _this.findOneBy({
                query: { _id: performanceTracker._id },
                select,
                populate,
            });
            return performanceTracker;
        } catch (error) {
            ErrorService.log('performanceTrackerService.create', error);
            throw error;
        }
    },
    //Description: Gets all application logs by component.
    findBy: async function({ query, limit, skip, select, populate }) {
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

            let performanceTrackerQuery = PerformanceTrackerModel.find(query)
                .lean()
                .sort([['createdAt', -1]])
                .skip(skip)
                .limit(limit);
            performanceTrackerQuery = handleSelect(
                select,
                performanceTrackerQuery
            );
            performanceTrackerQuery = handlePopulate(
                populate,
                performanceTrackerQuery
            );

            const performanceTracker = await performanceTrackerQuery;
            return performanceTracker;
        } catch (error) {
            ErrorService.log('performanceTrackerService.findBy', error);
            throw error;
        }
    },

    findOneBy: async function({ query, select, populate }) {
        try {
            if (!query) {
                query = {};
            }
            if (!query.deleted) query.deleted = false;

            // .populate({
            //     path: 'componentId',
            //     select: 'name slug',
            //     populate: {
            //         path: 'projectId',
            //         select: 'name slug',
            //     },
            // })
            // .populate('createdById', 'name email');

            let performanceTrackerQuery = PerformanceTrackerModel.findOne(
                query
            ).lean();

            performanceTrackerQuery = handleSelect(
                select,
                performanceTrackerQuery
            );
            performanceTrackerQuery = handlePopulate(
                populate,
                performanceTrackerQuery
            );

            const performanceTracker = await performanceTrackerQuery;
            return performanceTracker;
        } catch (error) {
            ErrorService.log('performanceTrackerService.findOneBy', error);
            throw error;
        }
    },

    getPerformanceTrackerByComponentId: async function(
        componentId,
        limit,
        skip
    ) {
        const _this = this;

        try {
            // Check if component exists
            const componentCount = await ComponentService.countBy({
                _id: componentId,
            });
            // send an error if the component doesnt exist
            if (!componentCount || componentCount === 0) {
                const error = new Error('Component does not exist.');
                error.code = 400;
                ErrorService.log(
                    'performanceTrackerService.getPerformanceTrackerByComponentId',
                    error
                );
                throw error;
            }

            if (typeof limit === 'string') limit = parseInt(limit);
            if (typeof skip === 'string') skip = parseInt(skip);

            const select =
                'componentId name slug key showQuickStart createdById';
            const populate = [
                { path: 'createdById', select: 'name email' },
                {
                    path: 'componentId',
                    select: 'name slug',
                    populate: { path: 'projectId', select: 'name slug' },
                },
            ];
            const performanceTracker = await _this.findBy({
                query: { componentId },
                limit,
                skip,
                select,
                populate,
            });
            return performanceTracker;
        } catch (error) {
            ErrorService.log(
                'performanceTrackerService.getPerformanceTrackerByComponentId',
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

            const performanceTracker = await PerformanceTrackerModel.findOneAndUpdate(
                query,
                {
                    $set: {
                        deleted: true,
                        deletedAt: Date.now(),
                        deletedById: userId,
                    },
                },
                { new: true }
            )
                .populate('deletedById', 'name')
                .populate({
                    path: 'componentId',
                    select: 'name slug',
                    populate: {
                        path: 'projectId',
                        select: 'name slug',
                    },
                });
            if (performanceTracker) {
                NotificationService.create(
                    performanceTracker.componentId.projectId._id ||
                        performanceTracker.componentId.projectId,
                    `The performance tracker ${performanceTracker.name} was deleted from the component ${performanceTracker.componentId.name} by ${performanceTracker.deletedById.name}`,
                    performanceTracker.deletedById._id,
                    'performanceTrackeraddremove'
                );
                // await RealTimeService.sendPerformanceTrackerDelete(
                //     performanceTracker
                // );
                return performanceTracker;
            } else {
                return null;
            }
        } catch (error) {
            ErrorService.log('performanceTrackerService.deleteBy', error);
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
            let performanceTracker = await PerformanceTrackerModel.findOneAndUpdate(
                query,
                { $set: data },
                {
                    new: true,
                }
            );

            if (unsetData) {
                performanceTracker = await PerformanceTrackerModel.findOneAndUpdate(
                    query,
                    { $unset: unsetData },
                    {
                        new: true,
                    }
                );
            }

            const select =
                'componentId name slug key showQuickStart createdById';
            const populate = [
                { path: 'createdById', select: 'name email' },
                {
                    path: 'componentId',
                    select: 'name slug',
                    populate: { path: 'projectId', select: 'name slug' },
                },
            ];
            performanceTracker = await this.findOneBy({
                query,
                select,
                populate,
            });

            // await RealTimeService.performanceTrackerKeyReset(
            //     performanceTracker
            // );

            return performanceTracker;
        } catch (error) {
            ErrorService.log('performanceTrackerService.updateOneBy', error);
            throw error;
        }
    },
    hardDeleteBy: async function(query) {
        try {
            await PerformanceTrackerModel.deleteMany(query);
            return 'Performance Tracker removed successfully!';
        } catch (error) {
            ErrorService.log('performanceTrackerService.hardDeleteBy', error);
            throw error;
        }
    },
    countBy: async function(query) {
        try {
            if (!query) {
                query = {};
            }
            if (!query.deleted) query.deleted = false;

            const count = await PerformanceTrackerModel.countDocuments(query);
            return count;
        } catch (error) {
            ErrorService.log('performanceTrackerService.countBy', error);
            throw error;
        }
    },
};
