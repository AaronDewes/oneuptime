export default class Service {
    async findBy({ query, skip, limit, sort, populate, select }: FindBy) {
        if (!skip) skip = 0;

        if (!limit) limit = 10;

        if (!sort) sort = -1;

        if (typeof skip === 'string') {
            skip = parseInt(skip);
        }

        if (typeof limit === 'string') {
            limit = parseInt(limit);
        }

        if (typeof sort === 'string') {
            sort = parseInt(sort);
        }

        if (!query) {
            query = {};
        }

        if (!query['deleted']) query['deleted'] = false;
        const itemsQuery = OnCallScheduleStatusModel.find(query)
            .lean()
            .limit(limit.toNumber())
            .skip(skip.toNumber());

        itemsQuery.select(select);
        itemsQuery.populate(populate);

        const items = await itemsQuery;

        return items;
    }

    async create({
        project,
        incident,
        activeEscalation,
        schedule,
        escalations,
        incidentAcknowledged,
    }: $TSFixMe) {
        let item = new OnCallScheduleStatusModel();

        item.project = project;

        item.activeEscalation = activeEscalation;

        item.schedule = schedule;

        item.incidentAcknowledged = incidentAcknowledged;

        item.incident = incident;

        item.escalations = escalations;

        item = await item.save();
        return item;
    }

    async countBy({ query }: $TSFixMe) {
        if (!query) {
            query = {};
        }

        if (!query['deleted']) query['deleted'] = false;
        const count = await OnCallScheduleStatusModel.countDocuments(query);
        return count;
    }

    async updateOneBy({ query, data }: $TSFixMe) {
        if (!query) {
            query = {};
        }

        if (!query['deleted']) query['deleted'] = false;
        const item = await OnCallScheduleStatusModel.findOneAndUpdate(
            query,
            {
                $set: data,
            },
            {
                new: true,
            }
        );
        return item;
    }

    async updateBy({ query, data }: $TSFixMe) {
        if (!query) {
            query = {};
        }

        if (!query['deleted']) query['deleted'] = false;
        await OnCallScheduleStatusModel.updateMany(query, {
            $set: data,
        });

        const selectOnCallScheduleStatus =
            'escalations createdAt project schedule activeEscalation activeEscalation incident incidentAcknowledged alertedEveryone isOnDuty deleted deletedAt deletedById';

        const populateOnCallScheduleStatus = [
            { path: 'incidentId', select: 'name slug' },
            { path: 'project', select: 'name slug' },
            { path: 'scheduleId', select: 'name slug' },
            { path: 'schedule', select: '_id name slug' },
            {
                path: 'activeEscalationId',
                select: 'projectId teams scheduleId',
            },
        ];
        const items = await this.findBy({
            query,
            select: selectOnCallScheduleStatus,
            populate: populateOnCallScheduleStatus,
        });
        return items;
    }

    async deleteBy({ query, userId }: $TSFixMe) {
        if (!query) {
            query = {};
        }

        query.deleted = false;
        const items = await OnCallScheduleStatusModel.findOneAndUpdate(
            query,
            {
                $set: {
                    deleted: true,
                    deletedAt: Date.now(),
                    deletedById: userId,
                },
            },
            {
                new: true,
            }
        );
        return items;
    }

    async hardDeleteBy({ query }: $TSFixMe) {
        await OnCallScheduleStatusModel.deleteMany(query);
    }
}

import OnCallScheduleStatusModel from '../Models/onCallScheduleStatus';

import FindBy from '../types/db/FindBy';
