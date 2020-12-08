/**
 *
 * Copyright HackerBay, Inc.
 *
 */

module.exports = {
    findBy: async function(query, skip, limit) {
        try {
            if (!skip) skip = 0;

            if (!limit) limit = 10;

            if (typeof skip === 'string') skip = parseInt(skip);

            if (typeof limit === 'string') limit = parseInt(limit);

            if (!query) query = {};

            query.deleted = false;
            const statusPages = await StatusPageModel.find(query)
                .sort([['createdAt', -1]])
                .limit(limit)
                .skip(skip)
                .populate('projectId')
                .populate('domains.domainVerificationToken')
                .populate('monitors.monitor', 'name')
                .lean();
            return statusPages;
        } catch (error) {
            ErrorService.log('statusPageService.findBy', error);
            throw error;
        }
    },

    create: async function(data) {
        try {
            const existingStatusPage = await this.findBy({
                name: data.name,
                projectId: data.projectId,
            });
            if (existingStatusPage && existingStatusPage.length > 0) {
                const error = new Error(
                    'StatusPage with that name already exists.'
                );
                error.code = 400;
                ErrorService.log('statusPageService.create', error);
                throw error;
            }
            const statusPageModel = new StatusPageModel();
            statusPageModel.projectId = data.projectId || null;
            statusPageModel.domains = data.domains || [];
            statusPageModel.links = data.links || null;
            statusPageModel.title = data.title || null;
            statusPageModel.name = data.name || null;
            statusPageModel.isPrivate = data.isPrivate || null;
            statusPageModel.description = data.description || null;
            statusPageModel.copyright = data.copyright || null;
            statusPageModel.faviconPath = data.faviconPath || null;
            statusPageModel.logoPath = data.logoPath || null;
            statusPageModel.bannerPath = data.bannerPath || null;
            statusPageModel.colors =
                data.colors || defaultStatusPageColors.default;
            statusPageModel.deleted = data.deleted || false;
            statusPageModel.isSubscriberEnabled =
                data.isSubscriberEnabled || false;
            statusPageModel.monitors = Array.isArray(data.monitors)
                ? [...data.monitors]
                : [];

            const statusPage = await statusPageModel.save();
            return statusPage;
        } catch (error) {
            ErrorService.log('statusPageService.create', error);
            throw error;
        }
    },

    createDomain: async function(subDomain, projectId, statusPageId) {
        let createdDomain = {};

        try {
            // check if domain already exist
            const existingBaseDomain = await DomainVerificationService.findOneBy(
                {
                    domain: subDomain,
                    projectId,
                }
            );

            if (!existingBaseDomain) {
                const creationData = {
                    domain: subDomain,
                    projectId,
                };
                // create the domain
                createdDomain = await DomainVerificationService.create(
                    creationData
                );
            }
            const statusPage = await this.findOneBy({
                _id: statusPageId,
            });

            if (statusPage) {
                // attach the domain id to statuspage collection and update it
                const domain = statusPage.domains.find(domain =>
                    domain.domain === subDomain ? true : false
                );
                if (domain) {
                    const error = new Error('Domain already exists');
                    error.code = 400;
                    ErrorService.log('statusPageService.createDomain', error);
                    throw error;
                }
                statusPage.domains = [
                    ...statusPage.domains,
                    {
                        domain: subDomain,
                        domainVerificationToken:
                            createdDomain._id || existingBaseDomain._id,
                    },
                ];
                const result = await statusPage.save();

                return result
                    .populate('domains.domainVerificationToken')
                    .execPopulate();
            } else {
                const error = new Error(
                    'Status page not found or does not exist'
                );
                error.code = 400;
                ErrorService.log('statusPageService.createDomain', error);
                throw error;
            }
        } catch (error) {
            ErrorService.log('statusPageService.createDomain', error);
            throw error;
        }
    },

    updateDomain: async function(projectId, statusPageId, domainId, newDomain) {
        let createdDomain = {};

        try {
            const existingBaseDomain = await DomainVerificationService.findOneBy(
                { domain: newDomain }
            );

            if (!existingBaseDomain) {
                const creationData = {
                    domain: newDomain,
                    projectId,
                };
                // create the domain
                createdDomain = await DomainVerificationService.create(
                    creationData
                );
            }

            const statusPage = await this.findOneBy({
                _id: statusPageId,
            });

            if (!statusPage) {
                const error = new Error(
                    'Status page not found or does not exist'
                );
                error.code = 400;
                throw error;
            }

            let domainList = [...statusPage.domains];
            domainList = domainList.map(eachDomain => {
                if (String(eachDomain._id) === String(domainId)) {
                    eachDomain.domain = newDomain;
                    eachDomain.domainVerificationToken =
                        createdDomain._id || existingBaseDomain._id;
                }
                return eachDomain;
            });

            statusPage.domains = domainList;

            const result = await statusPage.save();
            return result
                .populate('domains.domainVerificationToken')
                .execPopulate();
        } catch (error) {
            ErrorService.log('statusPageService.deleteDomain', error);
            throw error;
        }
    },

    deleteDomain: async function(statusPageId, domainId) {
        try {
            const statusPage = await this.findOneBy({
                _id: statusPageId,
            });

            if (!statusPage) {
                const error = new Error(
                    'Status page not found or does not exist'
                );
                error.code = 400;
                throw error;
            }

            const remainingDomains = statusPage.domains.filter(domain => {
                return String(domain._id) !== String(domainId);
            });

            statusPage.domains = remainingDomains;
            return statusPage.save();
        } catch (error) {
            ErrorService.log('statusPageService.deleteDomain', error);
            throw error;
        }
    },

    countBy: async function(query) {
        try {
            if (!query) {
                query = {};
            }
            query.deleted = false;
            const count = await StatusPageModel.countDocuments(query);
            return count;
        } catch (error) {
            ErrorService.log('statusPageService.countBy', error);
            throw error;
        }
    },

    deleteBy: async function(query, userId) {
        try {
            if (!query) {
                query = {};
            }

            query.deleted = false;
            const statusPage = await StatusPageModel.findOneAndUpdate(
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

            if (statusPage) {
                const subscribers = await SubscriberService.findBy({
                    statusPageId: statusPage._id,
                });

                await Promise.all(
                    subscribers.map(async subscriber => {
                        await SubscriberService.deleteBy(
                            { _id: subscriber },
                            userId
                        );
                    })
                );
            }
            return statusPage;
        } catch (error) {
            ErrorService.log('statusPageService.deleteBy', error);
            throw error;
        }
    },

    removeMonitor: async function(monitorId) {
        try {
            const statusPages = await this.findBy({
                'monitors.monitor': monitorId,
            });

            await Promise.all(
                statusPages.map(async statusPage => {
                    const monitors = statusPage.monitors.filter(
                        monitorData =>
                            String(monitorData.monitor) !== String(monitorId)
                    );

                    if (monitors.length !== statusPage.monitors.length) {
                        statusPage = await this.updateOneBy(
                            { _id: statusPage._id },
                            { monitors }
                        );
                    }

                    return statusPage;
                })
            );
        } catch (error) {
            ErrorService.log('statusPageService.removeMonitor', error);
            throw error;
        }
    },

    findOneBy: async function(query) {
        try {
            if (!query) {
                query = {};
            }

            query.deleted = false;
            const statusPage = await StatusPageModel.findOne(query)
                .sort([['createdAt', -1]])
                .populate('projectId')
                .populate('monitorIds', 'name')
                .populate('domains.domainVerificationToken');
            return statusPage;
        } catch (error) {
            ErrorService.log('statusPageService.findOneBy', error);
            throw error;
        }
    },

    updateOneBy: async function(query, data) {
        try {
            const existingStatusPage = await this.findBy({
                name: data.name,
                projectId: data.projectId,
                _id: { $not: { $eq: data._id } },
            });
            if (existingStatusPage && existingStatusPage.length > 0) {
                const error = new Error(
                    'StatusPage with that name already exists.'
                );
                error.code = 400;
                ErrorService.log('statusPageService.updateOneBy', error);
                throw error;
            }

            if (!query) {
                query = {};
            }
            if (!query.deleted) query.deleted = false;

            const updatedStatusPage = await StatusPageModel.findOneAndUpdate(
                query,
                {
                    $set: data,
                },
                {
                    new: true,
                }
            ).populate('domains.domainVerificationToken');
            return updatedStatusPage;
        } catch (error) {
            ErrorService.log('statusPageService.updateOneBy', error);
            throw error;
        }
    },

    updateBy: async function(query, data) {
        try {
            if (!query) {
                query = {};
            }

            if (!query.deleted) query.deleted = false;
            let updatedData = await StatusPageModel.updateMany(query, {
                $set: data,
            }).populate('domains.domainVerificationToken');
            updatedData = await this.findBy(query);
            return updatedData;
        } catch (error) {
            ErrorService.log('statusPageService.updateMany', error);
            throw error;
        }
    },

    getNotes: async function(query, skip, limit) {
        try {
            const _this = this;

            if (!skip) skip = 0;

            if (!limit) limit = 5;

            if (typeof skip === 'string') skip = parseInt(skip);

            if (typeof limit === 'string') limit = parseInt(limit);

            if (!query) query = {};
            const statuspages = await _this.findBy(query, 0, limit);

            const withMonitors = statuspages.filter(
                statusPage => statusPage.monitors.length
            );
            const statuspage = withMonitors[0];
            const monitorIds = statuspage
                ? statuspage.monitors.map(m => m.monitor._id)
                : [];
            if (monitorIds && monitorIds.length) {
                const notes = await IncidentService.findBy(
                    { monitorId: { $in: monitorIds } },
                    limit,
                    skip
                );
                const count = await IncidentService.countBy({
                    monitorId: { $in: monitorIds },
                });

                return { notes, count };
            } else {
                const error = new Error('no monitor to check');
                error.code = 400;
                ErrorService.log('statusPage.getNotes', error);
                throw error;
            }
        } catch (error) {
            ErrorService.log('statusPageService.getNotes', error);
            throw error;
        }
    },

    getIncident: async function(query) {
        try {
            const incident = await IncidentService.findOneBy(query);

            return incident;
        } catch (error) {
            ErrorService.log('statusPageService.getIncident', error);
            throw error;
        }
    },

    getIncidentNotes: async function(query, skip, limit) {
        try {
            if (!skip) skip = 0;

            if (!limit) limit = 5;

            if (typeof skip === 'string') skip = Number(skip);

            if (typeof limit === 'string') limit = Number(limit);

            if (!query) query = {};
            query.deleted = false;

            const message = await IncidentMessageService.findBy(
                query,
                skip,
                limit
            );

            const count = await IncidentMessageService.countBy(query);

            return { message, count };
        } catch (error) {
            ErrorService.log('statusPageService.getIncidentNotes', error);
            throw error;
        }
    },

    getNotesByDate: async function(query, skip, limit) {
        try {
            const incidents = await IncidentService.findBy(query, limit, skip);

            const investigationNotes = incidents.map(incident => {
                // return all the incident object
                return incident;
            });
            const count = await IncidentService.countBy(query);
            return { investigationNotes, count };
        } catch (error) {
            ErrorService.log('statusPageService.getNotesByDate', error);
            throw error;
        }
    },

    getEvents: async function(query, skip, limit) {
        try {
            const _this = this;

            if (!skip) skip = 0;

            if (!limit) limit = 5;

            if (typeof skip === 'string') skip = parseInt(skip);

            if (typeof limit === 'string') limit = parseInt(limit);

            if (!query) query = {};
            query.deleted = false;

            const statuspages = await _this.findBy(query, 0, limit);

            const withMonitors = statuspages.filter(
                statusPage => statusPage.monitors.length
            );
            const statuspage = withMonitors[0];
            const monitorIds = statuspage
                ? statuspage.monitors.map(m => m.monitor)
                : [];
            if (monitorIds && monitorIds.length) {
                const currentDate = moment();
                const eventIds = [];
                let events = await Promise.all(
                    monitorIds.map(async monitorId => {
                        const scheduledEvents = await ScheduledEventsService.findBy(
                            {
                                'monitors.monitorId': monitorId,
                                showEventOnStatusPage: true,
                                startDate: { $lte: currentDate },
                                endDate: {
                                    $gte: currentDate,
                                },
                                resolved: false,
                            }
                        );
                        scheduledEvents.map(event => {
                            const id = String(event._id);
                            if (!eventIds.includes(id)) {
                                eventIds.push(id);
                            }
                            return event;
                        });

                        return scheduledEvents;
                    })
                );

                events = flattenArray(events);
                // do not repeat the same event two times
                events = eventIds.map(id => {
                    return events.find(
                        event => String(event._id) === String(id)
                    );
                });
                const count = events.length;

                return { events, count };
            } else {
                const error = new Error('no monitor to check');
                error.code = 400;
                ErrorService.log('statusPageService.getEvents', error);
                throw error;
            }
        } catch (error) {
            ErrorService.log('statusPageService.getEvents', error);
            throw error;
        }
    },

    getFutureEvents: async function(query, skip, limit) {
        try {
            const _this = this;

            if (!skip) skip = 0;

            if (!limit) limit = 5;

            if (typeof skip === 'string') skip = parseInt(skip);

            if (typeof limit === 'string') limit = parseInt(limit);

            if (!query) query = {};
            query.deleted = false;

            const statuspages = await _this.findBy(query, 0, limit);

            const withMonitors = statuspages.filter(
                statusPage => statusPage.monitors.length
            );
            const statuspage = withMonitors[0];
            const monitorIds = statuspage
                ? statuspage.monitors.map(m => m.monitor)
                : [];
            if (monitorIds && monitorIds.length) {
                const currentDate = moment();
                const eventIds = [];
                let events = await Promise.all(
                    monitorIds.map(async monitorId => {
                        const scheduledEvents = await ScheduledEventsService.findBy(
                            {
                                'monitors.monitorId': monitorId,
                                showEventOnStatusPage: true,
                                startDate: { $gt: currentDate },
                            }
                        );
                        scheduledEvents.map(event => {
                            const id = String(event._id);
                            if (!eventIds.includes(id)) {
                                eventIds.push(id);
                            }
                            return event;
                        });

                        return scheduledEvents;
                    })
                );

                events = flattenArray(events);
                // do not repeat the same event two times
                events = eventIds.map(id => {
                    return events.find(
                        event => String(event._id) === String(id)
                    );
                });

                // sort in ascending start date
                events = events.sort((a, b) => a.startDate - b.startDate);

                const count = events.length;
                return { events: limitEvents(events, limit, skip), count };
            } else {
                const error = new Error('no monitor to check');
                error.code = 400;
                ErrorService.log('statusPageService.getFutureEvents', error);
                throw error;
            }
        } catch (error) {
            ErrorService.log('statusPageService.getFutureEvents', error);
            throw error;
        }
    },

    getEvent: async function(query) {
        try {
            const scheduledEvent = await ScheduledEventsService.findOneBy(
                query
            );
            return scheduledEvent;
        } catch (error) {
            ErrorService.log('statusPageService.getEvent', error);
            throw error;
        }
    },

    getEventNotes: async function(query, skip, limit) {
        try {
            if (!skip) skip = 0;

            if (!limit) limit = 5;

            if (typeof skip === 'string') skip = Number(skip);

            if (typeof limit === 'string') limit = Number(limit);

            if (!query) query = {};
            query.deleted = false;

            const eventNote = await ScheduledEventNoteService.findBy(
                query,
                limit,
                skip
            );

            const count = await ScheduledEventNoteService.countBy(query);

            return { notes: eventNote, count };
        } catch (error) {
            ErrorService.log('statusPageService.getEventNotes', error);
            throw error;
        }
    },

    getEventsByDate: async function(query, skip, limit) {
        try {
            const scheduledEvents = await ScheduledEventsService.findBy(
                query,
                limit,
                skip
            );
            const count = await ScheduledEventsService.countBy(query);

            return { scheduledEvents, count };
        } catch (error) {
            ErrorService.log('statusPageService.getEventsByDate', error);
            throw error;
        }
    },

    getStatusPage: async function(query, userId) {
        try {
            const thisObj = this;
            if (!query) {
                query = {};
            }

            query.deleted = false;

            const statusPages = await StatusPageModel.find(query)
                .sort([['createdAt', -1]])
                .populate('projectId')
                .populate('monitorIds', 'name')
                .populate('domains.domainVerificationToken')
                .lean();

            let statusPage = null;

            if (
                query &&
                query.domains &&
                query.domains.$elemMatch &&
                query.domains.$elemMatch.domain
            ) {
                const domain = query.domains.$elemMatch.domain;

                const verifiedStatusPages = statusPages.filter(
                    page =>
                        page &&
                        page.domains.length > 0 &&
                        page.domains.filter(
                            domainItem =>
                                domainItem &&
                                domainItem.domain === domain &&
                                domainItem.domainVerificationToken &&
                                domainItem.domainVerificationToken.verified ===
                                    true
                        ).length > 0
                );
                if (verifiedStatusPages.length > 0) {
                    statusPage = verifiedStatusPages[0];
                }
            } else {
                if (statusPages.length > 0) {
                    statusPage = statusPages[0];
                }
            }

            if (statusPage && (statusPage._id || statusPage.id)) {
                const permitted = await thisObj.isPermitted(userId, statusPage);
                if (!permitted) {
                    const error = new Error(
                        'You are unauthorized to access the page please login to continue.'
                    );
                    error.code = 401;
                    ErrorService.log('statusPageService.getStatusPage', error);
                    throw error;
                }

                const monitorIds = statusPage.monitors.map(monitor =>
                    monitor.monitor.toString()
                );
                const projectId = statusPage.projectId._id;
                const subProjects = await ProjectService.findBy({
                    $or: [{ parentProjectId: projectId }, { _id: projectId }],
                });
                const subProjectIds = subProjects
                    ? subProjects.map(project => project._id)
                    : null;
                const monitors = await MonitorService.getMonitorsBySubprojects(
                    subProjectIds,
                    0,
                    0
                );
                const filteredMonitorData = monitors.map(subProject => {
                    return subProject.monitors.filter(monitor =>
                        monitorIds.includes(monitor._id.toString())
                    );
                });
                statusPage.monitorsData = _.flatten(filteredMonitorData);
            } else {
                if (statusPages.length > 0) {
                    const error = new Error('Domain not verified');
                    error.code = 400;
                    ErrorService.log('statusPageService.getStatusPage', error);
                    throw error;
                } else {
                    const error = new Error('Page Not Found');
                    error.code = 400;
                    ErrorService.log('statusPageService.getStatusPage', error);
                    throw error;
                }
            }
            return statusPage;
        } catch (error) {
            ErrorService.log('statusPageService.getStatusPage', error);
            throw error;
        }
    },

    getIncidents: async function(query) {
        try {
            const _this = this;

            if (!query) query = {};
            const statuspages = await _this.findBy(query);

            const withMonitors = statuspages.filter(
                statusPage => statusPage.monitors.length
            );
            const statuspage = withMonitors[0];
            const monitorIds =
                statuspage && statuspage.monitors.map(m => m.monitor._id);
            if (monitorIds && monitorIds.length) {
                const incidents = await IncidentService.findBy({
                    monitorId: { $in: monitorIds },
                });
                const count = await IncidentService.countBy({
                    monitorId: { $in: monitorIds },
                });
                return { incidents, count };
            } else {
                const error = new Error('No monitor to check');
                error.code = 400;
                throw error;
            }
        } catch (error) {
            ErrorService.log('StatusPageService.getIncidents', error);
            throw error;
        }
    },
    isPermitted: async function(userId, statusPage) {
        try {
            const fn = async resolve => {
                if (statusPage.isPrivate) {
                    if (userId) {
                        const project = await ProjectService.findOneBy({
                            _id: statusPage.projectId._id,
                        });
                        if (project && project._id) {
                            if (
                                project.users.some(
                                    user => user.userId === userId
                                )
                            ) {
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        } else {
                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                } else {
                    resolve(true);
                }
            };
            return fn;
        } catch (error) {
            ErrorService.log('statusPageService.isPermitted', error);
            throw error;
        }
    },

    getSubProjectStatusPages: async function(subProjectIds) {
        const _this = this;
        const subProjectStatusPages = await Promise.all(
            subProjectIds.map(async id => {
                const statusPages = await _this.findBy(
                    { projectId: id },
                    0,
                    10
                );
                const count = await _this.countBy({ projectId: id });
                return { statusPages, count, _id: id, skip: 0, limit: 10 };
            })
        );
        return subProjectStatusPages;
    },

    hardDeleteBy: async function(query) {
        try {
            await StatusPageModel.deleteMany(query);
            return 'Status Page(s) Removed Successfully!';
        } catch (error) {
            ErrorService.log('statusPageService.hardDeleteBy', error);
            throw error;
        }
    },

    restoreBy: async function(query) {
        const _this = this;
        query.deleted = true;
        const statusPage = await _this.findBy(query);
        if (statusPage && statusPage.length > 1) {
            const statusPages = await Promise.all(
                statusPage.map(async statusPage => {
                    const statusPageId = statusPage._id;
                    statusPage = await _this.updateOneBy(
                        { _id: statusPageId, deleted: true },
                        {
                            deleted: false,
                            deletedAt: null,
                            deleteBy: null,
                        }
                    );
                    await SubscriberService.restoreBy({
                        statusPageId,
                        deleted: true,
                    });
                    return statusPage;
                })
            );
            return statusPages;
        }
    },
    // get status pages for this incident
    getStatusPagesForIncident: async (incidentId, skip, limit) => {
        try {
            // first get the monitor, then scan status page collection containing the monitor
            const { monitorId } = await IncidentModel.findById(
                incidentId
            ).select('monitorId');
            let statusPages = [];
            let count = 0;
            if (monitorId) {
                count = await StatusPageModel.find({
                    'monitors.monitor': monitorId,
                }).countDocuments({ 'monitors.monitor': monitorId });
                if (count) {
                    statusPages = await StatusPageModel.find({
                        'monitors.monitor': monitorId,
                    })
                        .populate('projectId')
                        .populate('monitors.monitor')
                        .skip(skip)
                        .limit(limit)
                        .exec();
                }
            }
            return { statusPages: statusPages || [], count };
        } catch (error) {
            ErrorService.log(
                'statusPageService.getStatusPagesForIncident',
                error
            );
            throw error;
        }
    },
};

// handle the unique pagination for scheduled events on status page
function limitEvents(events, limit, skip) {
    skip = skip * limit;
    if (skip !== 0) {
        limit += limit;
    }
    return events.slice(skip, limit);
}

const IncidentModel = require('../models/incident');
const StatusPageModel = require('../models/statusPage');
const IncidentService = require('./incidentService');
const ScheduledEventsService = require('./scheduledEventService');
const MonitorService = require('./monitorService');
const ErrorService = require('./errorService');
const SubscriberService = require('./subscriberService');
const ProjectService = require('./projectService');
const _ = require('lodash');
const defaultStatusPageColors = require('../config/statusPageColors');
const DomainVerificationService = require('./domainVerificationService');
const flattenArray = require('../utils/flattenArray');
const ScheduledEventNoteService = require('./scheduledEventNoteService');
const IncidentMessageService = require('./incidentMessageService');
const moment = require('moment');
