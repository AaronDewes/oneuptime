/**
 *
 * Copyright HackerBay, Inc.
 *
 */

module.exports = {
    findBy: async function({ query, skip, limit, populate, select }) {
        try {
            if (!skip) skip = 0;

            if (!limit) limit = 10;

            if (typeof skip === 'string') skip = parseInt(skip);

            if (typeof limit === 'string') limit = parseInt(limit);

            if (!query) query = {};

            query.deleted = false;
            let statusPagesQuery = StatusPageModel.find(query)
                .sort([['createdAt', -1]])
                .limit(limit)
                .skip(skip)
                .lean();

            statusPagesQuery = handleSelect(select, statusPagesQuery);
            statusPagesQuery = handlePopulate(populate, statusPagesQuery);

            const statusPages = await statusPagesQuery;
            return statusPages;
        } catch (error) {
            ErrorService.log('statusPageService.findBy', error);
            throw error;
        }
    },

    create: async function(data) {
        try {
            let existingStatusPage = null;

            if (data.name) {
                existingStatusPage = await this.countBy({
                    name: data.name,
                    projectId: data.projectId,
                });
            }
            if (existingStatusPage && existingStatusPage > 0) {
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
            statusPageModel.statusBubbleId = data.statusBubbleId || uuid.v4();

            if (data && data.name) {
                statusPageModel.slug = getSlug(data.name);
            }

            const statusPage = await statusPageModel.save();

            const populateStatusPage = [
                { path: 'projectId', select: 'parentProjectId' },
                { path: 'monitorIds', select: 'name' },
                { path: 'monitors.monitor', select: 'name' },
                {
                    path: 'domains.domainVerificationToken',
                    select: 'domain verificationToken verified ',
                },
            ];
            const selectStatusPage =
                'domains projectId monitors links twitterHandle slug title name isPrivate isSubscriberEnabled isGroupedByMonitorCategory showScheduledEvents moveIncidentToTheTop hideProbeBar hideUptime multipleNotifications hideResolvedIncident description copyright faviconPath logoPath bannerPath colors layout headerHTML footerHTML customCSS customJS statusBubbleId embeddedCss createdAt enableRSSFeed emailNotification smsNotification webhookNotification selectIndividualMonitors enableIpWhitelist ipWhitelist incidentHistoryDays scheduleHistoryDays announcementLogsHistory theme';

            const newStatusPage = await this.findOneBy({
                _id: statusPage._id,
                populate: populateStatusPage,
                select: selectStatusPage,
            });
            return newStatusPage;
        } catch (error) {
            ErrorService.log('statusPageService.create', error);
            throw error;
        }
    },

    createDomain: async function(
        subDomain,
        projectId,
        statusPageId,
        cert,
        privateKey,
        enableHttps,
        autoProvisioning
    ) {
        let createdDomain = {};

        try {
            // check if domain already exist
            // only one domain in the db is allowed
            const existingBaseDomain = await DomainVerificationService.findOneBy(
                {
                    query: {
                        domain: subDomain,
                    },
                    select: '_id',
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

            const populateStatusPage = [
                {
                    path: 'domains.domainVerificationToken',
                    select: 'domain verificationToken verified ',
                },
            ];

            const statusPage = await this.findOneBy({
                query: { _id: statusPageId },
                populate: populateStatusPage,
                select: 'domains',
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
                if (enableHttps && autoProvisioning) {
                    // trigger addition of this particular domain
                    // which should pass the acme challenge
                    // acme challenge is to be processed from status page project
                    const altnames = [subDomain];

                    // before adding any domain
                    // check if there's a certificate already created in the store
                    // if there's none, add the domain to the flow
                    const certificate = await CertificateStoreService.findOneBy(
                        {
                            query: { subject: subDomain },
                            select: 'id',
                        }
                    );

                    if (!certificate) {
                        // handle this in the background
                        greenlock.add({
                            subject: altnames[0],
                            altnames: altnames,
                        });
                    }
                }

                statusPage.domains = [
                    ...statusPage.domains,
                    {
                        domain: subDomain,
                        cert,
                        privateKey,
                        enableHttps,
                        autoProvisioning,
                        domainVerificationToken:
                            createdDomain._id || existingBaseDomain._id,
                    },
                ];
                return await this.updateOneBy(
                    { _id: statusPage._id },
                    {
                        domains: statusPage.domains,
                    }
                );
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

    // update all the occurence of the old domain to the new domain
    // use regex to replace the value
    updateCustomDomain: async function(domainId, newDomain, oldDomain) {
        const _this = this;
        try {
            const populateStatusPage = [
                {
                    path: 'domains.domainVerificationToken',
                    select: 'domain verificationToken verified ',
                },
            ];

            const statusPages = await _this.findBy({
                query: {
                    domains: {
                        $elemMatch: { domainVerificationToken: domainId },
                    },
                },
                populate: populateStatusPage,
                select: '_id domains',
            });

            for (const statusPage of statusPages) {
                const statusPageId = statusPage._id;
                const domains = [];
                for (const eachDomain of statusPage.domains) {
                    if (
                        String(eachDomain.domainVerificationToken._id) ===
                        String(domainId)
                    ) {
                        eachDomain.domain = eachDomain.domain.replace(
                            oldDomain,
                            newDomain
                        );
                    }
                    domains.push(eachDomain);
                }

                if (domains && domains.length > 0) {
                    await _this.updateOneBy({ _id: statusPageId }, { domains });
                }
            }
        } catch (error) {
            ErrorService.log('statusPageService.updateCustomDomain', error);
            throw error;
        }
    },

    updateDomain: async function(
        projectId,
        statusPageId,
        domainId,
        newDomain,
        cert,
        privateKey,
        enableHttps,
        autoProvisioning
    ) {
        let createdDomain = {};
        const _this = this;

        try {
            const existingBaseDomain = await DomainVerificationService.findOneBy(
                { query: { domain: newDomain }, select: '_id' }
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
            const populateStatusPage = [
                {
                    path: 'domains.domainVerificationToken',
                    select: 'domain verificationToken verified ',
                },
            ];

            const statusPage = await this.findOneBy({
                query: { _id: statusPageId },
                populate: populateStatusPage,
                select: 'domains',
            });

            if (!statusPage) {
                const error = new Error(
                    'Status page not found or does not exist'
                );
                error.code = 400;
                throw error;
            }

            let doesDomainExist = false;
            const domainList = [...statusPage.domains];
            const updatedDomainList = [];
            for (const eachDomain of domainList) {
                if (String(eachDomain._id) === String(domainId)) {
                    if (eachDomain.domain !== newDomain) {
                        doesDomainExist = await _this.doesDomainExist(
                            newDomain
                        );
                    }
                    // if domain exist
                    // break the loop
                    if (doesDomainExist) break;

                    eachDomain.domain = newDomain;
                    eachDomain.cert = cert;
                    eachDomain.privateKey = privateKey;
                    eachDomain.enableHttps = enableHttps;
                    eachDomain.autoProvisioning = autoProvisioning;
                    if (autoProvisioning && enableHttps) {
                        // trigger addition of this particular domain
                        // which should pass the acme challenge
                        // acme challenge is to be processed from status page project
                        const altnames = [eachDomain.domain];

                        // before adding any domain
                        // check if there's a certificate already created in the store
                        // if there's none, add the domain to the flow
                        const certificate = await CertificateStoreService.findOneBy(
                            {
                                query: { subject: eachDomain.domain },
                                select: 'id',
                            }
                        );

                        if (!certificate) {
                            // handle this in the background
                            greenlock.add({
                                subject: altnames[0],
                                altnames: altnames,
                            });
                        }
                    }
                    eachDomain.domainVerificationToken =
                        createdDomain._id || existingBaseDomain._id;
                }

                updatedDomainList.push(eachDomain);
            }

            if (doesDomainExist) {
                const error = new Error(
                    `This custom domain ${newDomain} already exist`
                );
                error.code = 400;
                throw error;
            }

            statusPage.domains = updatedDomainList;

            const result = await this.updateOneBy(
                { _id: statusPage._id },
                { domains: statusPage.domains }
            );
            return result;
        } catch (error) {
            ErrorService.log('statusPageService.updateDomain', error);
            throw error;
        }
    },

    deleteDomain: async function(statusPageId, domainId) {
        try {
            const populateStatusPage = [
                {
                    path: 'domains.domainVerificationToken',
                    select: 'domain verificationToken verified ',
                },
            ];
            const statusPage = await this.findOneBy({
                query: { _id: statusPageId },
                populate: populateStatusPage,
                select: 'domain',
            });

            if (!statusPage) {
                const error = new Error(
                    'Status page not found or does not exist'
                );
                error.code = 400;
                throw error;
            }

            let deletedDomain = null;
            const remainingDomains = statusPage.domains.filter(domain => {
                if (String(domain._id) === String(domainId)) {
                    deletedDomain = domain;
                }
                return String(domain._id) !== String(domainId);
            });

            // delete any associated certificate (only for auto provisioned ssl)
            // handle this in the background
            if (deletedDomain.enableHttps && deletedDomain.autoProvisioning) {
                greenlock
                    .remove({ subject: deletedDomain.domain })
                    .finally(() => {
                        CertificateStoreService.deleteBy({
                            subject: deletedDomain.domain,
                        });
                    });
            }

            statusPage.domains = remainingDomains;
            return await this.updateOneBy(
                { _id: statusPage._id },
                { domains: statusPage.domains }
            );
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
                    query: { statusPageId: statusPage._id },
                    select: '_id',
                });

                await Promise.all(
                    subscribers.map(async subscriber => {
                        await SubscriberService.deleteBy(
                            { _id: subscriber._id },
                            userId
                        );
                    })
                );

                // delete all certificate pipeline for the custom domains
                // handle this for autoprovisioned custom domains
                const customDomains = [...statusPage.domains];
                for (const eachDomain of customDomains) {
                    if (eachDomain.enableHttps && eachDomain.autoProvisioning) {
                        greenlock
                            .remove({ subject: eachDomain.domain })
                            .finally(() => {
                                CertificateStoreService.deleteBy({
                                    subject: eachDomain.domain,
                                });
                            });
                    }
                }
            }
            return statusPage;
        } catch (error) {
            ErrorService.log('statusPageService.deleteBy', error);
            throw error;
        }
    },

    removeMonitor: async function(monitorId) {
        try {
            const populateStatusPage = [
                {
                    path: 'monitors.monitor',
                    select: '_id name',
                },
            ];

            const selectStatusPage = 'monitors';

            const statusPages = await this.findBy({
                query: { 'monitors.monitor': monitorId },
                select: selectStatusPage,
                populate: populateStatusPage,
            });
            for (const statusPage of statusPages) {
                const monitors = statusPage.monitors.filter(
                    monitorData =>
                        String(
                            monitorData.monitor._id || monitorData.monitor
                        ) !== String(monitorId)
                );

                if (monitors.length !== statusPage.monitors.length) {
                    await this.updateOneBy(
                        { _id: statusPage._id },
                        { monitors }
                    );
                }
            }
        } catch (error) {
            ErrorService.log('statusPageService.removeMonitor', error);
            throw error;
        }
    },

    findOneBy: async function({ query, select, populate }) {
        try {
            if (!query) {
                query = {};
            }

            query.deleted = false;
            let statusPageQuery = StatusPageModel.findOne(query)
                .lean()
                .sort([['createdAt', -1]]);

            statusPageQuery = handleSelect(select, statusPageQuery);
            statusPageQuery = handlePopulate(populate, statusPageQuery);

            const statusPage = await statusPageQuery;
            return statusPage;
        } catch (error) {
            ErrorService.log('statusPageService.findOneBy', error);
            throw error;
        }
    },

    updateOneBy: async function(query, data) {
        try {
            const existingStatusPage = await this.findBy({
                query: {
                    name: data.name,
                    projectId: data.projectId,
                    _id: { $not: { $eq: data._id } },
                },
                select: 'slug',
            });
            if (existingStatusPage && existingStatusPage.length > 0) {
                const error = new Error(
                    'StatusPage with that name already exists.'
                );
                error.code = 400;
                ErrorService.log('statusPageService.updateOneBy', error);
                throw error;
            }

            if (data && data.name) {
                existingStatusPage.slug = getSlug(data.name);
            }

            if (!query) {
                query = {};
            }
            if (!query.deleted) query.deleted = false;

            let updatedStatusPage = await StatusPageModel.findOneAndUpdate(
                query,
                {
                    $set: data,
                },
                {
                    new: true,
                }
            );

            const populateStatusPage = [
                { path: 'projectId', select: 'parentProjectId' },
                { path: 'monitorIds', select: 'name' },
                { path: 'monitors.monitor', select: 'name' },
                {
                    path: 'domains.domainVerificationToken',
                    select: 'domain verificationToken verified ',
                },
            ];

            const selectStatusPage =
                'domains projectId monitors twitterHandle links slug title name isPrivate isSubscriberEnabled isGroupedByMonitorCategory showScheduledEvents moveIncidentToTheTop hideProbeBar hideUptime multipleNotifications hideResolvedIncident description copyright faviconPath logoPath bannerPath colors layout headerHTML footerHTML customCSS customJS statusBubbleId embeddedCss createdAt enableRSSFeed emailNotification smsNotification webhookNotification selectIndividualMonitors enableIpWhitelist ipWhitelist incidentHistoryDays scheduleHistoryDays announcementLogsHistory theme';

            updatedStatusPage = await this.findOneBy({
                query: { _id: updatedStatusPage._id },
                populate: populateStatusPage,
                select: selectStatusPage,
            });
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
            });

            const populateStatusPage = [
                {
                    path: 'projectId',
                    select: 'name parentProjectId',
                    populate: { path: 'parentProjectId', select: '_id' },
                },
                {
                    path: 'domains.domainVerificationToken',
                    select: 'domain verificationToken verified ',
                },
                {
                    path: 'monitors.monitor',
                    select: 'name',
                },
            ];

            const selectStatusPage =
                'domains projectId monitors links slug title name isPrivate isSubscriberEnabled isGroupedByMonitorCategory showScheduledEvents moveIncidentToTheTop hideProbeBar hideUptime multipleNotifications hideResolvedIncident description copyright faviconPath logoPath bannerPath colors layout headerHTML footerHTML customCSS customJS statusBubbleId embeddedCss createdAt enableRSSFeed emailNotification smsNotification webhookNotification selectIndividualMonitors enableIpWhitelist ipWhitelist incidentHistoryDays scheduleHistoryDays announcementLogsHistory theme';

            updatedData = await this.findBy({
                query,
                populate: populateStatusPage,
                select: selectStatusPage,
            });
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

            if (!limit || isNaN(limit)) limit = 5;

            if (typeof skip === 'string') skip = parseInt(skip);

            if (typeof limit === 'string') limit = parseInt(limit);

            if (!query) query = {};

            const statuspages = await _this.findBy({
                query,
                skip: 0,
                limit,
                select: 'hideResolvedIncident monitors',
                populate: [
                    {
                        path: 'monitors.monitor',
                        select: 'name',
                    },
                ],
            });
            const checkHideResolved = statuspages[0].hideResolvedIncident;
            let option = {};
            if (checkHideResolved) {
                option = {
                    resolved: false,
                };
            }

            const withMonitors = statuspages.filter(
                statusPage => statusPage.monitors.length
            );
            const statuspage = withMonitors[0];
            const monitorIds = statuspage
                ? statuspage.monitors.map(m => m.monitor._id)
                : [];
            if (monitorIds && monitorIds.length) {
                const populate = [
                    {
                        path: 'monitors.monitorId',
                        select: 'name slug componentId projectId type',
                        populate: { path: 'componentId', select: 'name slug' },
                    },
                    { path: 'createdById', select: 'name' },
                    { path: 'projectId', select: 'name slug' },
                    { path: 'resolvedBy', select: 'name' },
                    { path: 'acknowledgedBy', select: 'name' },
                    { path: 'incidentPriority', select: 'name color' },
                    {
                        path: 'acknowledgedByIncomingHttpRequest',
                        select: 'name',
                    },
                    { path: 'resolvedByIncomingHttpRequest', select: 'name' },
                    { path: 'createdByIncomingHttpRequest', select: 'name' },
                    { path: 'probes.probeId', select: 'name _id' },
                ];
                const select =
                    'notifications acknowledgedByIncomingHttpRequest resolvedByIncomingHttpRequest _id monitors createdById projectId createdByIncomingHttpRequest incidentType resolved resolvedBy acknowledged acknowledgedBy title description incidentPriority criterionCause probes acknowledgedAt resolvedAt manuallyCreated deleted customFields idNumber createdAt';

                const [notes, count] = await Promise.all([
                    IncidentService.findBy({
                        query: {
                            'monitors.monitorId': { $in: monitorIds },
                            hideIncident: false,
                            ...option,
                        },
                        limit,
                        skip,
                        populate,
                        select,
                    }),
                    IncidentService.countBy({
                        'monitors.monitorId': { $in: monitorIds },
                        hideIncident: false,
                        ...option,
                    }),
                ]);

                return { notes, count };
            } else {
                const error = new Error('No monitors on this status page');
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
            const populate = [
                {
                    path: 'monitors.monitorId',
                    select: 'name slug componentId projectId type',
                    populate: { path: 'componentId', select: 'name slug' },
                },
                { path: 'createdById', select: 'name' },
                { path: 'projectId', select: 'name slug' },
                { path: 'resolvedBy', select: 'name' },
                { path: 'acknowledgedBy', select: 'name' },
                { path: 'incidentPriority', select: 'name color' },
                {
                    path: 'acknowledgedByIncomingHttpRequest',
                    select: 'name',
                },
                { path: 'resolvedByIncomingHttpRequest', select: 'name' },
                { path: 'createdByIncomingHttpRequest', select: 'name' },
                { path: 'probes.probeId', select: 'name _id' },
            ];
            const select =
                'notifications acknowledgedByIncomingHttpRequest resolvedByIncomingHttpRequest _id monitors createdById projectId createdByIncomingHttpRequest incidentType resolved resolvedBy acknowledged acknowledgedBy title description incidentPriority criterionCause probes acknowledgedAt resolvedAt manuallyCreated deleted customFields idNumber';

            const incident = await IncidentService.findOneBy({
                query,
                select,
                populate,
            });

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

            const populateIncidentMessage = [
                {
                    path: 'incidentId',
                    select: 'idNumber name',
                },
                { path: 'createdById', select: 'name' },
            ];

            const selectIncidentMessage =
                '_id updated postOnStatusPage createdAt content incidentId createdById type incident_state';

            const [message, count] = await Promise.all([
                IncidentMessageService.findBy({
                    query,
                    skip,
                    limit,
                    populate: populateIncidentMessage,
                    select: selectIncidentMessage,
                }),
                IncidentMessageService.countBy(query),
            ]);

            return { message, count };
        } catch (error) {
            ErrorService.log('statusPageService.getIncidentNotes', error);
            throw error;
        }
    },

    getNotesByDate: async function(query, skip, limit) {
        try {
            const populate = [
                {
                    path: 'monitors.monitorId',
                    select: 'name slug componentId projectId type',
                    populate: { path: 'componentId', select: 'name slug' },
                },
                { path: 'createdById', select: 'name' },
                { path: 'projectId', select: 'name slug' },
                { path: 'resolvedBy', select: 'name' },
                { path: 'acknowledgedBy', select: 'name' },
                { path: 'incidentPriority', select: 'name color' },
                {
                    path: 'acknowledgedByIncomingHttpRequest',
                    select: 'name',
                },
                { path: 'resolvedByIncomingHttpRequest', select: 'name' },
                { path: 'createdByIncomingHttpRequest', select: 'name' },
                { path: 'probes.probeId', select: 'name _id' },
            ];
            const select =
                'notifications acknowledgedByIncomingHttpRequest resolvedByIncomingHttpRequest _id monitors createdById projectId createdByIncomingHttpRequest incidentType resolved resolvedBy acknowledged acknowledgedBy title description incidentPriority criterionCause probes acknowledgedAt resolvedAt manuallyCreated deleted customFields idNumber';

            const [incidents, count] = await Promise.all([
                IncidentService.findBy({
                    query,
                    limit,
                    skip,
                    populate,
                    select,
                }),
                IncidentService.countBy(query),
            ]);

            const investigationNotes = incidents.map(incident => {
                // return all the incident object
                return incident;
            });
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

            const statuspages = await _this.findBy({
                query,
                skip: 0,
                limit,
                select: 'monitors',
                populate: [
                    {
                        path: 'monitors.monitor',
                        select: 'name',
                    },
                ],
            });

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

                const populate = [
                    { path: 'resolvedBy', select: 'name' },
                    { path: 'projectId', select: 'name slug' },
                    { path: 'createdById', select: 'name' },
                    {
                        path: 'monitors.monitorId',
                        select: 'name',
                        populate: {
                            path: 'componentId',
                            select: 'name slug',
                        },
                    },
                ];
                const select =
                    'cancelled showEventOnStatusPage callScheduleOnEvent monitorDuringEvent monitorDuringEvent recurring interval alertSubscriber resolved monitors name startDate endDate description createdById projectId slug createdAt ';

                let events = await Promise.all(
                    monitorIds.map(async monitorId => {
                        const scheduledEvents = await ScheduledEventsService.findBy(
                            {
                                query: {
                                    'monitors.monitorId': monitorId,
                                    showEventOnStatusPage: true,
                                    startDate: { $lte: currentDate },
                                    endDate: {
                                        $gte: currentDate,
                                    },
                                    resolved: false,
                                },
                                select,
                                populate,
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
                // console.log(events);

                return { events, count };
            } else {
                const error = new Error('No monitors on this status page');
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

            const statuspages = await _this.findBy({
                query,
                skip: 0,
                limit,
                select: 'monitors',
                populate: [
                    {
                        path: 'monitors.monitor',
                        select: 'name',
                    },
                ],
            });

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
                const populate = [
                    { path: 'resolvedBy', select: 'name' },
                    { path: 'projectId', select: 'name slug' },
                    { path: 'createdById', select: 'name' },
                    {
                        path: 'monitors.monitorId',
                        select: 'name',
                        populate: {
                            path: 'componentId',
                            select: 'name slug',
                        },
                    },
                ];
                const select =
                    'cancelled showEventOnStatusPage callScheduleOnEvent monitorDuringEvent monitorDuringEvent recurring interval alertSubscriber resolved monitors name startDate endDate description createdById projectId slug createdAt ';

                let events = await Promise.all(
                    monitorIds.map(async monitorId => {
                        const scheduledEvents = await ScheduledEventsService.findBy(
                            {
                                query: {
                                    'monitors.monitorId': monitorId,
                                    showEventOnStatusPage: true,
                                    startDate: { $gt: currentDate },
                                },
                                select,
                                populate,
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

                // // sort in ascending start date
                events = events.sort((a, b) => b.startDate - a.startDate);

                const count = events.length;
                return { events, count };
            } else {
                const error = new Error('No monitors on this status page');
                error.code = 400;
                ErrorService.log('statusPageService.getFutureEvents', error);
                throw error;
            }
        } catch (error) {
            ErrorService.log('statusPageService.getFutureEvents', error);
            throw error;
        }
    },

    getPastEvents: async function(query, skip, limit) {
        try {
            const _this = this;

            if (!skip) skip = 0;

            if (!limit) limit = 5;

            if (typeof skip === 'string') skip = parseInt(skip);

            if (typeof limit === 'string') limit = parseInt(limit);

            if (!query) query = {};
            query.deleted = false;

            const statuspages = await _this.findBy({
                query,
                skip: 0,
                limit,
                select: 'monitors',
                populate: [
                    {
                        path: 'monitors.monitor',
                        select: '_id name',
                    },
                ],
            });

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
                const populate = [
                    { path: 'resolvedBy', select: 'name' },
                    { path: 'projectId', select: 'name slug' },
                    { path: 'createdById', select: 'name' },
                    {
                        path: 'monitors.monitorId',
                        select: 'name',
                        populate: {
                            path: 'componentId',
                            select: 'name slug',
                        },
                    },
                ];
                const select =
                    'cancelled showEventOnStatusPage callScheduleOnEvent monitorDuringEvent monitorDuringEvent recurring interval alertSubscriber resolved monitors name startDate endDate description createdById projectId slug createdAt ';

                let events = await Promise.all(
                    monitorIds.map(async monitorId => {
                        const scheduledEvents = await ScheduledEventsService.findBy(
                            {
                                query: {
                                    'monitors.monitorId': monitorId,
                                    showEventOnStatusPage: true,
                                    endDate: { $lt: currentDate },
                                },
                                populate,
                                select,
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
                const error = new Error('No monitors on this status page');
                error.code = 400;
                ErrorService.log('statusPageService.getPastEvents', error);
                throw error;
            }
        } catch (error) {
            ErrorService.log('statusPageService.getPastEvents', error);
            throw error;
        }
    },

    getEvent: async function(query) {
        const populate = [
            { path: 'resolvedBy', select: 'name' },
            { path: 'projectId', select: 'name slug' },
            { path: 'createdById', select: 'name' },
            {
                path: 'monitors.monitorId',
                select: 'name',
                populate: {
                    path: 'componentId',
                    select: 'name slug',
                },
            },
        ];
        const select =
            'cancelled showEventOnStatusPage callScheduleOnEvent monitorDuringEvent monitorDuringEvent recurring interval alertSubscriber resolved monitors name startDate endDate description createdById projectId slug createdAt ';

        try {
            const scheduledEvent = await ScheduledEventsService.findOneBy({
                query,
                select,
                populate,
            });
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

            const populate = [
                { path: 'createdById', select: 'name' },
                {
                    path: 'scheduledEventId',
                    select: 'name monitors alertSubscriber projectId',
                    populate: {
                        path: 'projectId',
                        select: 'name replyAddress',
                    },
                },
            ];
            const select =
                'updated content type event_state createdAt updatedAt createdById scheduledEventId';

            const [eventNote, count] = await Promise.all([
                ScheduledEventNoteService.findBy({
                    query,
                    limit,
                    skip,
                    populate,
                    select,
                }),
                ScheduledEventNoteService.countBy(query),
            ]);

            return { notes: eventNote, count };
        } catch (error) {
            ErrorService.log('statusPageService.getEventNotes', error);
            throw error;
        }
    },

    getEventsByDate: async function(query, skip, limit) {
        try {
            const populate = [
                { path: 'resolvedBy', select: 'name' },
                { path: 'projectId', select: 'name slug' },
                { path: 'createdById', select: 'name' },
                {
                    path: 'monitors.monitorId',
                    select: 'name',
                    populate: {
                        path: 'componentId',
                        select: 'name slug',
                    },
                },
            ];
            const select =
                'cancelled showEventOnStatusPage callScheduleOnEvent monitorDuringEvent monitorDuringEvent recurring interval alertSubscriber resolved monitors name startDate endDate description createdById projectId slug createdAt ';

            const [scheduledEvents, count] = await Promise.all([
                ScheduledEventsService.findBy({
                    query,
                    limit,
                    skip,
                    populate,
                    select,
                }),
                ScheduledEventsService.countBy(query),
            ]);

            return { scheduledEvents, count };
        } catch (error) {
            ErrorService.log('statusPageService.getEventsByDate', error);
            throw error;
        }
    },

    getStatusPage: async function({ query, userId, populate, select }) {
        try {
            const thisObj = this;
            if (!query) {
                query = {};
            }

            query.deleted = false;

            let statusPagesQuery = StatusPageModel.find(query)
                .sort([['createdAt', -1]])
                .lean();

            statusPagesQuery = handleSelect(select, statusPagesQuery);
            statusPagesQuery = handlePopulate(populate, statusPagesQuery);

            const statusPages = await statusPagesQuery;

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
                    monitor.monitor._id.toString()
                );
                const projectId = statusPage.projectId._id;
                const subProjects = await ProjectService.findBy({
                    query: {
                        $or: [
                            { parentProjectId: projectId },
                            { _id: projectId },
                        ],
                    },
                    select: '_id',
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

            const statuspages = await _this.findBy({
                query,
                select: 'monitors',
                populate: [
                    {
                        path: 'monitors.monitor',
                        select: 'name',
                    },
                ],
            });

            const withMonitors = statuspages.filter(
                statusPage => statusPage.monitors.length
            );
            const statuspage = withMonitors[0];
            const monitorIds =
                statuspage && statuspage.monitors.map(m => m.monitor._id);
            if (monitorIds && monitorIds.length) {
                const populate = [
                    {
                        path: 'monitors.monitorId',
                        select: 'name slug componentId projectId type',
                        populate: { path: 'componentId', select: 'name slug' },
                    },
                    { path: 'createdById', select: 'name' },
                    { path: 'projectId', select: 'name slug' },
                    { path: 'resolvedBy', select: 'name' },
                    { path: 'acknowledgedBy', select: 'name' },
                    { path: 'incidentPriority', select: 'name color' },
                    {
                        path: 'acknowledgedByIncomingHttpRequest',
                        select: 'name',
                    },
                    { path: 'resolvedByIncomingHttpRequest', select: 'name' },
                    { path: 'createdByIncomingHttpRequest', select: 'name' },
                    { path: 'probes.probeId', select: 'name _id' },
                ];
                const select =
                    'notifications acknowledgedByIncomingHttpRequest resolvedByIncomingHttpRequest _id monitors createdById projectId createdByIncomingHttpRequest incidentType resolved resolvedBy acknowledged acknowledgedBy title description incidentPriority criterionCause probes acknowledgedAt resolvedAt manuallyCreated deleted customFields idNumber';

                const [incidents, count] = await Promise.all([
                    IncidentService.findBy({
                        query: { 'monitors.monitorId': { $in: monitorIds } },
                        select,
                        populate,
                    }),
                    IncidentService.countBy({
                        'monitors.monitorId': { $in: monitorIds },
                    }),
                ]);
                return { incidents, count };
            } else {
                const error = new Error('No monitors on this status page');
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
                            query: { _id: statusPage.projectId._id },
                            select: '_id users',
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

        const populateStatusPage = [
            {
                path: 'projectId',
                select: 'name parentProjectId',
                populate: { path: 'parentProjectId', select: '_id' },
            },
            {
                path: 'domains.domainVerificationToken',
                select: 'domain verificationToken verified ',
            },
            {
                path: 'monitors.monitor',
                select: 'name',
            },
        ];

        const selectStatusPage =
            'domains projectId monitors links twitterHandle slug title name isPrivate isSubscriberEnabled isGroupedByMonitorCategory showScheduledEvents moveIncidentToTheTop hideProbeBar hideUptime multipleNotifications hideResolvedIncident description copyright faviconPath logoPath bannerPath colors layout headerHTML footerHTML customCSS customJS statusBubbleId embeddedCss createdAt enableRSSFeed emailNotification smsNotification webhookNotification selectIndividualMonitors enableIpWhitelist ipWhitelist incidentHistoryDays scheduleHistoryDays announcementLogsHistory theme';

        const subProjectStatusPages = await Promise.all(
            subProjectIds.map(async id => {
                const statusPages = await _this.findBy({
                    query: { projectId: id },
                    skip: 0,
                    limit: 10,
                    select: selectStatusPage,
                    populate: populateStatusPage,
                });
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

        const populateStatusPage = [
            {
                path: 'projectId',
                select: 'name parentProjectId',
                populate: { path: 'parentProjectId', select: '_id' },
            },
            {
                path: 'domains.domainVerificationToken',
                select: 'domain verificationToken verified ',
            },
            {
                path: 'monitors.monitor',
                select: 'name',
            },
        ];

        const selectStatusPage =
            'domains projectId monitors links twitterHandle slug title name isPrivate isSubscriberEnabled isGroupedByMonitorCategory showScheduledEvents moveIncidentToTheTop hideProbeBar hideUptime multipleNotifications hideResolvedIncident description copyright faviconPath logoPath bannerPath colors layout headerHTML footerHTML customCSS customJS statusBubbleId embeddedCss createdAt enableRSSFeed emailNotification smsNotification webhookNotification selectIndividualMonitors enableIpWhitelist ipWhitelist incidentHistoryDays scheduleHistoryDays announcementLogsHistory theme';

        const statusPage = await _this.findBy({
            query,
            populate: populateStatusPage,
            select: selectStatusPage,
        });
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
            let { monitors } = await IncidentModel.findById(incidentId).select(
                'monitors.monitorId'
            );

            let statusPages = [];
            let count = 0;
            if (monitors) {
                monitors = monitors.map(
                    monitor => monitor.monitorId._id || monitor.monitorId
                );
                count = await StatusPageModel.find({
                    'monitors.monitor': { $in: monitors },
                }).countDocuments({ 'monitors.monitor': { $in: monitors } });
                if (count) {
                    statusPages = await StatusPageModel.find({
                        'monitors.monitor': { $in: monitors },
                    })
                        .lean()
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

    getStatusBubble: async (statusPages, probes) => {
        try {
            if (statusPages && statusPages[0]) {
                statusPages = statusPages[0];
            }
            const endDate = moment(Date.now());
            const startDate = moment(Date.now()).subtract(90, 'days');
            const monitorsIds =
                statusPages && statusPages.monitors
                    ? statusPages.monitors.map(m =>
                          m.monitor && m.monitor._id ? m.monitor._id : null
                      )
                    : [];
            const statuses = await Promise.all(
                monitorsIds.map(async m => {
                    return await MonitorService.getMonitorStatuses(
                        m,
                        startDate,
                        endDate
                    );
                })
            );
            const bubble = await getServiceStatus(statuses, probes);
            let statusMessage = '';
            if (bubble === 'all') {
                statusMessage = 'All services are online';
            } else if (bubble === 'some') {
                statusMessage = 'Some services are offline';
            } else if (bubble === 'none') {
                statusMessage = 'All services are offline';
            } else if (bubble === 'some-degraded') {
                statusMessage = 'Some services are degraded';
            }
            return { bubble, statusMessage };
        } catch (error) {
            ErrorService.log('statusPageService.getStatusBubble', error);
            throw error;
        }
    },

    doesDomainExist: async function(domain) {
        const _this = this;
        try {
            const statusPage = await _this.countBy({
                domains: { $elemMatch: { domain } },
            });

            if (!statusPage || statusPage === 0) return false;

            return true;
        } catch (error) {
            ErrorService.log('statusPageService.doesDomainExist', error);
            throw error;
        }
    },

    createExternalStatusPage: async function(data) {
        try {
            const externalStatusPage = new ExternalStatusPageModel();
            externalStatusPage.name = data.name || null;
            externalStatusPage.projectId = data.projectId || null;
            externalStatusPage.statusPageId = data.statusPageId || null;
            externalStatusPage.url = data.url || null;
            externalStatusPage.createdById = data.createdById || null;
            const newExternalStatusPage = await externalStatusPage.save();

            return newExternalStatusPage;
        } catch (error) {
            ErrorService.log('statusPageService.externalStatusPage', error);
            throw error;
        }
    },
    getExternalStatusPage: async function(query, skip, limit) {
        try {
            if (!skip) skip = 0;

            if (!limit) limit = 0;

            if (typeof skip === 'string') {
                skip = Number(skip);
            }

            if (typeof limit === 'string') {
                limit = Number(limit);
            }

            if (!query) {
                query = {};
            }

            query.deleted = false;
            const externalStatusPages = await ExternalStatusPageModel.find(
                query
            );
            return externalStatusPages;
        } catch (error) {
            ErrorService.log('statusPageService.getExternalStatusPage', error);
            throw error;
        }
    },
    deleteExternalStatusPage: async function(projectId, _id, userId) {
        const query = { projectId, _id };

        try {
            const externalStatusPages = await ExternalStatusPageModel.findOneAndUpdate(
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
            return externalStatusPages;
        } catch (error) {
            ErrorService.log('statusPageService.getExternalStatusPage', error);
            throw error;
        }
    },

    createAnnouncement: async function(data) {
        try {
            // reassign data.monitors with a restructured monitor data
            data.monitors = data.monitors.map(monitor => ({
                monitorId: monitor,
            }));
            // slugify announcement name
            if (data && data.name) {
                data.slug = getSlug(data.name);
            }

            const announcement = new AnnouncementModel();
            announcement.name = data.name || null;
            announcement.projectId = data.projectId || null;
            announcement.statusPageId = data.statusPageId || null;
            announcement.description = data.description || null;
            announcement.monitors = data.monitors || null;
            announcement.createdById = data.createdById || null;
            announcement.slug = data.slug || null;
            const newAnnouncement = await announcement.save();

            return newAnnouncement;
        } catch (error) {
            ErrorService.log('statusPageService.createAnnouncement', error);
            throw error;
        }
    },

    getAnnouncements: async function(query, skip, limit) {
        try {
            if (!skip) skip = 0;

            if (!limit) limit = 0;

            if (typeof skip === 'string') {
                skip = Number(skip);
            }

            if (typeof limit === 'string') {
                limit = Number(limit);
            }

            if (!query) {
                query = {};
            }

            query.deleted = false;
            const allAnnouncements = await AnnouncementModel.find(query)
                .lean()
                .sort([['createdAt', -1]])
                .limit(limit)
                .skip(skip)
                .populate('createdById', 'name')
                .populate('monitors.monitorId', 'name');
            return allAnnouncements;
        } catch (error) {
            ErrorService.log('statusPageService.getAnnouncements', error);
            throw error;
        }
    },

    countAnnouncements: async function(query) {
        try {
            if (!query) {
                query = {};
            }
            query.deleted = false;
            const count = await AnnouncementModel.countDocuments(query);
            return count;
        } catch (error) {
            ErrorService.log('statusPageService.countAnnouncements', error);
            throw error;
        }
    },

    getSingleAnnouncement: async function(query) {
        try {
            if (!query) {
                query = {};
            }
            query.deleted = false;
            const response = await AnnouncementModel.findOne(query);
            return response;
        } catch (error) {
            ErrorService.log('statusPageService.getSingleAnnouncement', error);
            throw error;
        }
    },

    updateAnnouncement: async function(query, data) {
        try {
            const _this = this;
            if (!query) {
                query = {};
            }
            query.deleted = false;
            if (!data.hideAnnouncement) {
                await _this.updateManyAnnouncement({
                    statusPageId: query.statusPageId,
                });
            }
            const response = await AnnouncementModel.findOneAndUpdate(
                query,
                {
                    $set: data,
                },
                {
                    new: true,
                }
            );

            if (!data.hideAnnouncement && data.announcementToggle) {
                AlertService.sendAnnouncementNotificationToSubscribers(
                    response
                );
            }

            const log = {
                active: false,
                endDate: new Date(),
                updatedById: data.createdById,
            };
            await _this.updateAnnouncementLog({ active: true }, log);

            return response;
        } catch (error) {
            ErrorService.log('statusPageService.getSingleAnnouncement', error);
            throw error;
        }
    },

    updateManyAnnouncement: async function(query) {
        try {
            if (!query) {
                query = {};
            }
            query.deleted = false;
            const response = await AnnouncementModel.updateMany(
                query,
                {
                    $set: { hideAnnouncement: true },
                },
                {
                    new: true,
                }
            );
            return response;
        } catch (error) {
            ErrorService.log('statusPageService.updateManyAnnouncement', error);
            throw error;
        }
    },

    deleteAnnouncement: async function(query, userId) {
        try {
            if (!query) {
                query = {};
            }
            query.deleted = false;
            const response = await AnnouncementModel.findOneAndUpdate(
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
        } catch (error) {
            ErrorService.log('statusPageService.deleteAnnouncement', error);
            throw error;
        }
    },

    createAnnouncementLog: async function(data) {
        try {
            const announcementLog = new AnnouncementLogModel();
            announcementLog.announcementId = data.announcementId || null;
            announcementLog.createdById = data.createdById || null;
            announcementLog.statusPageId = data.statusPageId || null;
            announcementLog.startDate = data.startDate || null;
            announcementLog.endDate = data.endDate || null;
            announcementLog.active = data.active || null;
            const newAnnouncementLog = await announcementLog.save();
            return newAnnouncementLog;
        } catch (error) {
            ErrorService.log('statusPageService.createAnnouncementLog', error);
            throw error;
        }
    },

    updateAnnouncementLog: async function(query, data) {
        try {
            if (!query) {
                query = {};
            }
            query.deleted = false;
            const response = await AnnouncementLogModel.findOneAndUpdate(
                query,
                {
                    $set: data,
                },
                {
                    new: true,
                }
            );
            return response;
        } catch (error) {
            ErrorService.log('statusPageService.createAnnouncementLog', error);
            throw error;
        }
    },

    getAnnouncementLogs: async function(query, skip, limit) {
        try {
            if (!skip) skip = 0;

            if (!limit) limit = 0;

            if (typeof skip === 'string') {
                skip = Number(skip);
            }

            if (typeof limit === 'string') {
                limit = Number(limit);
            }

            if (!query) {
                query = {};
            }

            query.deleted = false;
            const announcementLogs = await AnnouncementLogModel.find(query)
                .lean()
                .sort([['createdAt', -1]])
                .limit(limit)
                .skip(skip)
                .populate({
                    path: 'announcementId',
                    select: 'name description',
                    populate: { path: 'monitors.monitorId', select: 'name' },
                });
            return announcementLogs;
        } catch (error) {
            ErrorService.log('statusPageService.getAnnouncementLogs', error);
            throw error;
        }
    },

    deleteAnnouncementLog: async function(query, userId) {
        try {
            if (!query) {
                query = {};
            }
            query.deleted = false;
            const response = await AnnouncementLogModel.findOneAndUpdate(
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
        } catch (error) {
            ErrorService.log('statusPageService.deleteAnnouncementLog', error);
            throw error;
        }
    },

    countAnnouncementLogs: async function(query) {
        try {
            if (!query) {
                query = {};
            }
            query.deleted = false;
            const count = await AnnouncementLogModel.countDocuments(query);
            return count;
        } catch (error) {
            ErrorService.log('statusPageService.countAnnouncementLogs', error);
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

const filterProbeData = (monitor, probe) => {
    const monitorStatuses = monitor && monitor.length > 0 ? monitor : null;

    const probesStatus =
        monitorStatuses && monitorStatuses.length > 0
            ? probe
                ? monitorStatuses.filter(probeStatuses => {
                      return (
                          probeStatuses._id === null ||
                          probeStatuses._id === probe._id
                      );
                  })
                : monitorStatuses
            : [];
    const statuses =
        probesStatus &&
        probesStatus[0] &&
        probesStatus[0].statuses &&
        probesStatus[0].statuses.length > 0
            ? probesStatus[0].statuses
            : [];

    return statuses;
};

const getServiceStatus = (monitorsData, probes) => {
    const monitorsLength = monitorsData.length;
    const probesLength = probes && probes.length;

    const totalServices = monitorsLength * probesLength;
    let onlineServices = totalServices;
    let degraded = 0;

    monitorsData.forEach(monitor => {
        probes.forEach(probe => {
            const statuses = filterProbeData(monitor, probe);
            const monitorStatus =
                statuses && statuses.length > 0
                    ? statuses[0].status || 'online'
                    : 'online';
            if (monitorStatus === 'offline') {
                onlineServices--;
            }
            if (monitorStatus === 'degraded') {
                degraded++;
            }
        });
    });

    if (onlineServices === totalServices) {
        if (degraded !== 0) return 'some-degraded';
        return 'all';
    } else if (onlineServices === 0) {
        return 'none';
    } else if (onlineServices < totalServices) {
        return 'some';
    }
};

const IncidentModel = require('../models/incident');
const StatusPageModel = require('../models/statusPage');
const IncidentService = require('./incidentService');
const ScheduledEventsService = require('./scheduledEventService');
const MonitorService = require('./monitorService');
const ErrorService = require('./errorService');
const SubscriberService = require('./subscriberService');
const ProjectService = require('./projectService');
const AlertService = require('./alertService');
const _ = require('lodash');
const defaultStatusPageColors = require('../config/statusPageColors');
const DomainVerificationService = require('./domainVerificationService');
const flattenArray = require('../utils/flattenArray');
const ScheduledEventNoteService = require('./scheduledEventNoteService');
const IncidentMessageService = require('./incidentMessageService');
const moment = require('moment');
const uuid = require('uuid');
const greenlock = require('../../greenlock');
const CertificateStoreService = require('./certificateStoreService');
const AnnouncementModel = require('../models/announcements');
const ExternalStatusPageModel = require('../models/externalstatuspage');
const getSlug = require('../utils/getSlug');
const AnnouncementLogModel = require('../models/announcementLogs');
const handleSelect = require('../utils/select');
const handlePopulate = require('../utils/populate');
