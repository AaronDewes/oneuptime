module.exports = {
    findBy: async function({ query, limit, skip, populate, select }) {
        if (typeof limit === 'string') limit = parseInt(limit);
        if (typeof skip === 'string') skip = parseInt(skip);
        if (!query) query = {};
        if (!query.deleted) query.deleted = false;

        let incidentPrioritiesQuery = incidentPriorityModel
            .find(query)
            .lean()
            .limit(limit)
            .skip(skip);

        incidentPrioritiesQuery = handleSelect(select, incidentPrioritiesQuery);

        incidentPrioritiesQuery = handlePopulate(
            populate,
            incidentPrioritiesQuery
        );

        const incidentPriorities = await incidentPrioritiesQuery;

        return incidentPriorities;
    },
    findOne: async function({ query, select, populate }) {
        if (!query) {
            query = {};
        }
        query.deleted = false;
        let incidentPrioritiesQuery = incidentPriorityModel
            .findOne(query)
            .lean();

        incidentPrioritiesQuery = handleSelect(select, incidentPrioritiesQuery);

        incidentPrioritiesQuery = handlePopulate(
            populate,
            incidentPrioritiesQuery
        );

        const incidentPriorities = await incidentPrioritiesQuery;

        return incidentPriorities;
    },
    countBy: async function(query) {
        if (!query) {
            query = {};
        }
        if (!query.deleted) query.deleted = false;

        const count = await incidentPriorityModel.countDocuments(query);

        return count;
    },
    create: async function(data) {
        const incidentPriority = new incidentPriorityModel();
        const { projectId, name, color } = data;
        incidentPriority.projectId = projectId;
        incidentPriority.name = name;
        incidentPriority.color = color;
        await incidentPriority.save();
        return incidentPriority;
    },
    updateOne: async function(query, data) {
        if (!query) {
            query = {};
        }
        if (!query.deleted) query.deleted = false;
        const updatedIncidentPriority = await incidentPriorityModel.findOneAndUpdate(
            query,
            {
                $set: data,
            },
            { new: true }
        );
        return updatedIncidentPriority;
    },
    deleteBy: async function(query) {
        if (!query) {
            query = {};
        }
        query.deleted = false;
        const incidentPriority = await incidentPriorityModel.findOneAndUpdate(
            query,
            {
                $set: {
                    deleted: true,
                    deletedAt: Date.now(),
                },
            }
        );
        if (incidentPriority === null) return incidentPriority;
        //update existing incidents along with default incident settings
        await Promise.all([
            IncidentService.updateBy(
                {
                    incidentPriority: incidentPriority._id,
                },
                {
                    incidentPriority: null,
                }
            ),
            IncidentSettingsService.updateOne(
                {
                    incidentPriority: incidentPriority._id,
                },
                {
                    incidentPriority: null,
                }
            ),
        ]);
        return incidentPriority;
    },
    hardDeleteBy: async function(query) {
        await incidentPriorityModel.deleteMany(query);
        return 'Incident priorities removed successfully!';
    },
};

const IncidentSettingsService = require('./incidentSettingsService');
const IncidentService = require('./incidentService');
const incidentPriorityModel = require('../models/incidentPriority');
const handleSelect = require('../utils/select');
const handlePopulate = require('../utils/populate');
