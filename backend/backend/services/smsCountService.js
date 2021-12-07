module.exports = {
    findBy: async function({ query, limit, skip, select, populate }) {
        try {
            if (!skip) skip = 0;

            if (!limit) limit = 10;

            if (typeof skip === 'string') skip = parseInt(skip);

            if (typeof limit === 'string') limit = parseInt(limit);

            if (!query) query = {};

            if (!query.deleted) query.deleted = false;

            let smsCountQuery = SmsCountModel.find(query)
                .sort([['createdAt', -1]])
                .limit(limit)
                .skip(skip);

            smsCountQuery = handleSelect(select, smsCountQuery);
            smsCountQuery = handlePopulate(populate, smsCountQuery);

            const SmsCount = await smsCountQuery;
            return SmsCount;
        } catch (error) {
            ErrorService.log('smsCountService.findBy', error);
            throw error;
        }
    },

    findOneBy: async function({ query, select, populate }) {
        try {
            if (!query) {
                query = {};
            }

            if (!query.deleted) query.deleted = false;

            let smsCountQuery = SmsCountModel.findOne(query)
                .lean()
                .sort([['createdAt', -1]]);

            smsCountQuery = handleSelect(select, smsCountQuery);
            smsCountQuery = handlePopulate(populate, smsCountQuery);

            const SmsCount = await smsCountQuery;
            return SmsCount;
        } catch (error) {
            ErrorService.log('smsCountService.findOneBy', error);
            throw error;
        }
    },

    create: async function(userId, sentTo, projectId, content, status, error) {
        try {
            const smsCountModel = new SmsCountModel();
            smsCountModel.userId = userId || null;
            smsCountModel.sentTo = sentTo || null;
            smsCountModel.projectId = projectId || null;
            smsCountModel.content = content || null;
            smsCountModel.status = status || null;
            smsCountModel.error = error || null;
            const smsCount = await smsCountModel.save();
            return smsCount;
        } catch (error) {
            ErrorService.log('smsCountService.create', error);
            throw error;
        }
    },

    countBy: async function(query) {
        try {
            if (!query) {
                query = {};
            }

            if (!query.deleted) query.deleted = false;
            const count = await SmsCountModel.countDocuments(query);
            return count;
        } catch (error) {
            ErrorService.log('smsCountService.countBy', error);
            throw error;
        }
    },

    search: async function({ filter, skip, limit }) {
        const _this = this;
        try {
            const query = {
                sendTo: { $regex: new RegExp(filter), $options: 'i' },
            };

            const populate = [
                { path: 'projectId', select: 'name' },
                { path: 'userId', select: 'name' },
            ];
            const select =
                'userId sentTo createdAt projectId parentProjectId deleted deletedAt deletedById content status error';
            const [searchedSmsLogs, totalSearchCount] = await Promise.all([
                _this.findBy({ query, skip, limit, select, populate }),
                _this.countBy({ query }),
            ]);

            return { searchedSmsLogs, totalSearchCount };
        } catch (error) {
            ErrorService.log('smsCountService.search', error);
            throw error;
        }
    },

    validateResend: async function(userId) {
        try {
            const _this = this;
            let problem = '';
            const select = 'createdAt';
            const smsCount = await _this.findBy({
                query: {
                    userId: userId,
                    createdAt: {
                        $gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
                limit: 4,
                skip: 0,
                select,
            });
            if (smsCount.length > 3) {
                let time = moment(smsCount[3].createdAt).add(1, 'days');
                time = time.diff(moment(Date.now()), 'minutes');
                problem = `You have exhausted the maximum limit of sms resends in a day please wait ${Math.floor(
                    time / 60
                )} Hours ${Math.floor(time % 60)} minutes before retrying.`;
            }
            return {
                validateResend: smsCount.length > 3 ? false : true,
                problem: problem,
            };
        } catch (error) {
            ErrorService.log('smsCountService.validateResend', error);
            throw error;
        }
    },

    deleteBy: async function(query, userId) {
        try {
            const smsCount = await SmsCountModel.findOneAndUpdate(
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
            return smsCount;
        } catch (error) {
            ErrorService.log('smsCountService.deleteBy', error);
            throw error;
        }
    },

    hardDeleteBy: async function(query) {
        try {
            await SmsCountModel.deleteMany(query);
            return 'SmsCount(s) removed successfully';
        } catch (error) {
            ErrorService.log('smsCountService.hard`DeleteBy', error);
            throw error;
        }
    },
};

const SmsCountModel = require('../models/smsCount');
const moment = require('moment');
const ErrorService = require('../services/errorService');
const handleSelect = require('../utils/select');
const handlePopulate = require('../utils/populate');
