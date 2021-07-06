const GroupModel = require('../models/groups');
const ErrorService = require('./errorService');

module.exports = {
    findBy: async function(query, limit, skip) {
        try {
            if (!skip) skip = 0;

            if (!limit) limit = 10;

            if (typeof skip === 'string') skip = parseInt(skip);

            if (typeof limit === 'string') limit = parseInt(limit);

            if (!query) query = {};

            if (!query.deleted) query.deleted = false;
            const response = {};
            const [groups, count] = await Promise.all([
                GroupModel.find(query)
                    .lean()
                    .sort([['createdAt', -1]])
                    .limit(limit)
                    .skip(skip)
                    .populate('projectId', 'name')
                    .populate({
                        path: 'teams',
                        select: 'name email',
                    }),
                GroupModel.countDocuments(query),
            ]);
            response.groups = groups;
            response.count = count;
            response.skip = skip;
            response.limit = limit;
            return response;
        } catch (error) {
            ErrorService.log('groupService.findBy', error);
            throw error;
        }
    },

    findOneBy: async function(query) {
        try {
            if (!query) {
                query = {};
            }

            if (!query.deleted) query.deleted = false;
            const group = await GroupModel.findOne(query)
                .populate('projectId', 'name')
                .populate({
                    path: 'teams',
                    select: 'name',
                })
                .lean();

            return group;
        } catch (error) {
            ErrorService.log('groupService.findOneBy', error);
            throw error;
        }
    },

    create: async function(data) {
        try {
            const groupExist = await this.findOneBy({
                name: data.name,
                projectId: data.projectId,
            });

            if (groupExist) {
                const error = new Error('Group already exist in this project');
                error.code = 400;
                ErrorService.log('groupService.create', error);
                throw error;
            }
            const createGroup = new GroupModel({
                name: data.name,
                projectId: data.projectId,
                createdById: data.createdById,
                teams: data.teams,
            });

            const group = await createGroup.save();
            return group;
        } catch (error) {
            ErrorService.log('groupService.create', error);
            throw error;
        }
    },

    countBy: async function(query) {
        try {
            if (!query) {
                query = {};
            }

            query.deleted = false;
            const count = await GroupModel.countDocuments(query);
            return count;
        } catch (error) {
            ErrorService.log('escalationService.countBy', error);
            throw error;
        }
    },

    deleteBy: async function(query, userId) {
        try {
            const group = await GroupModel.findOneAndUpdate(
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
            return group;
        } catch (error) {
            ErrorService.log('escalationService.deleteBy', error);
            throw error;
        }
    },

    updateOneBy: async function(query, data, projectId) {
        try {
            if (!query) {
                query = {};
            }

            if (!query.deleted) query.deleted = false;

            const groupExist = await this.findOneBy({
                name: data.name,
                projectId,
            });

            if (groupExist && String(groupExist._id) !== String(query._id)) {
                const error = new Error('Group already exist in this project');
                error.code = 400;
                ErrorService.log('groupService.update', error);
                throw error;
            }
            let group = await GroupModel.findOneAndUpdate(
                query,
                {
                    $set: data,
                },
                {
                    new: true,
                }
            );
            group = await this.findOneBy(query);
            return group;
        } catch (error) {
            ErrorService.log('escalationService.updateOneBy', error);
            throw error;
        }
    },
    removeGroupMember: async function(groupId, memberId) {
        try {
            const _this = this;
            const group = await _this.findOneBy({ _id: groupId });
            const teamMembers = group.teams;
            const data = teamMembers.filter(id => id !== memberId);
            const newGroup = await _this.updateOneBy(
                { _id: groupId },
                { teams: data }
            );
            return newGroup;
        } catch (error) {
            ErrorService.log('escalationService.removeEscalationMember', error);
            throw error;
        }
    },
};
