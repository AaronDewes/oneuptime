/**
 *
 * Copyright HackerBay, Inc.
 *
 */

const express = require('express');
const StatusPageService = require('../services/statusPageService');
const MonitorService = require('../services/monitorService');
const ProbeService = require('../services/probeService');
const UtilService = require('../services/utilService');
const RealTimeService = require('../services/realTimeService');
const DomainVerificationService = require('../services/domainVerificationService');
const IncidentService = require('../services/incidentService');

const router = express.Router();
const validUrl = require('valid-url');
const multer = require('multer');
const ErrorService = require('../services/errorService');
const { toXML } = require('jstoxml');
const moment = require('moment');

const { getUser, checkUser } = require('../middlewares/user');
const { getSubProjects } = require('../middlewares/subProject');
const { isUserAdmin } = require('../middlewares/project');
const storage = require('../middlewares/upload');
const { isAuthorized } = require('../middlewares/authorization');
const IncidentTimelineService = require('../services/incidentTimelineService');
const { ipWhitelist } = require('../middlewares/ipHandler');
const sendErrorResponse = require('../middlewares/response').sendErrorResponse;
const sendListResponse = require('../middlewares/response').sendListResponse;
const sendItemResponse = require('../middlewares/response').sendItemResponse;
const uuid = require('uuid');
const defaultStatusPageColors = require('../config/statusPageColors');
const SubscriberService = require('../services/subscriberService');
const ScheduledEventService = require('../services/scheduledEventService');

// Route Description: Adding a status page to the project.
// req.params->{projectId}; req.body -> {[monitorIds]}
// Returns: response status page, error message

router.post('/:projectId', getUser, isAuthorized, isUserAdmin, async function(
    req,
    res
) {
    try {
        const data = req.body;
        data.projectId = req.params.projectId;

        if (!data.name) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Status Page name is empty',
            });
        }

        // Call the StatusPageService.
        const statusPage = await StatusPageService.create(data);
        return sendItemResponse(req, res, statusPage);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.put(
    '/:projectId/:statusPageId/resetBubbleId',
    getUser,
    isAuthorized,
    async (req, res) => {
        const { projectId, statusPageId } = req.params;
        const newStatusBubbleId = uuid.v4();
        try {
            // response should be an updated statusPage
            const statusPage = await StatusPageService.updateOneBy(
                { projectId, _id: statusPageId },
                { statusBubbleId: newStatusBubbleId }
            );
            const updatedStatusPage = await StatusPageService.getStatusPage(
                { _id: statusPage._id },
                req.user.id
            );
            await RealTimeService.statusPageEdit(updatedStatusPage);
            return sendItemResponse(req, res, updatedStatusPage);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

router.put('/:projectId/theme', getUser, isAuthorized, async (req, res) => {
    const { projectId } = req.params;
    const { theme, statusPageId } = req.body;
    try {
        const statusPage = await StatusPageService.updateOneBy(
            { projectId, _id: statusPageId },
            { theme }
        );
        const updatedStatusPage = await StatusPageService.getStatusPage(
            { _id: statusPageId },
            req.user.id
        );
        await RealTimeService.statusPageEdit(updatedStatusPage);
        return sendItemResponse(req, res, statusPage);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route Description: Creates a domain and domainVerificationToken
// req.params -> {projectId, statusPageId}; req.body -> {domain}
// Returns: response updated status page, error message
router.put(
    '/:projectId/:statusPageId/domain',
    getUser,
    isAuthorized,
    async (req, res) => {
        const { projectId, statusPageId } = req.params;
        const {
            domain: subDomain,
            cert,
            privateKey,
            enableHttps,
            autoProvisioning,
        } = req.body;

        if (typeof subDomain !== 'string') {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Domain is not of type string.',
            });
        }

        if (!UtilService.isDomainValid(subDomain)) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Domain is not valid.',
            });
        }

        try {
            const doesDomainBelongToProject = await DomainVerificationService.doesDomainBelongToProject(
                projectId,
                subDomain
            );

            if (doesDomainBelongToProject) {
                return sendErrorResponse(req, res, {
                    message: `This domain is already associated with another project`,
                    code: 400,
                });
            }

            const doesDomainExist = await StatusPageService.doesDomainExist(
                subDomain
            );

            if (doesDomainExist) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: `This custom domain ${subDomain} already exist`,
                });
            }

            const resp = await StatusPageService.createDomain(
                subDomain,
                projectId,
                statusPageId,
                cert,
                privateKey,
                enableHttps,
                autoProvisioning
            );
            return sendItemResponse(req, res, resp);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

//reset status page colors to default colors
router.put(
    '/:projectId/:statusPageId/resetColors',
    getUser,
    isAuthorized,
    async (req, res) => {
        const { projectId, statusPageId } = req.params;
        const defaultBrandColor = defaultStatusPageColors.default;
        try {
            // response should be an updated statusPage
            const response = await StatusPageService.updateOneBy(
                {
                    _id: statusPageId,
                    projectId,
                },
                { colors: defaultBrandColor }
            );
            return sendItemResponse(req, res, response);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);
/**
 * @description updates a particular domain from statuspage collection
 * @param {string} projectId id of the project
 * @param {string} statusPageId id of the status page
 * @param {string} domainId id of the domain on the status page
 * @returns response body
 */
router.put(
    '/:projectId/:statusPageId/:domainId',
    getUser,
    isAuthorized,
    async (req, res) => {
        const { projectId, statusPageId, domainId } = req.params;
        const {
            domain: newDomain,
            cert,
            privateKey,
            enableHttps,
            autoProvisioning,
        } = req.body;

        if (typeof newDomain !== 'string') {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Domain is not of type string.',
            });
        }

        if (!UtilService.isDomainValid(newDomain)) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Domain is not valid.',
            });
        }

        try {
            // response should be an updated statusPage
            const response = await StatusPageService.updateDomain(
                projectId,
                statusPageId,
                domainId,
                newDomain,
                cert,
                privateKey,
                enableHttps,
                autoProvisioning
            );
            return sendItemResponse(req, res, response);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

router.post('/:projectId/certFile', async function(req, res) {
    try {
        const upload = multer({
            storage,
        }).fields([
            {
                name: 'cert',
                maxCount: 1,
            },
        ]);
        upload(req, res, async function(error) {
            let cert;
            if (error) {
                return sendErrorResponse(req, res, error);
            }
            if (req.files && req.files.cert && req.files.cert[0].filename) {
                cert = req.files.cert[0].filename;
            }
            return sendItemResponse(req, res, { cert });
        });
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.post('/:projectId/privateKeyFile', async function(req, res) {
    try {
        const upload = multer({
            storage,
        }).fields([
            {
                name: 'privateKey',
                maxCount: 1,
            },
        ]);
        upload(req, res, async function(error) {
            let privateKey;
            if (error) {
                return sendErrorResponse(req, res, error);
            }
            if (
                req.files &&
                req.files.privateKey &&
                req.files.privateKey[0].filename
            ) {
                privateKey = req.files.privateKey[0].filename;
            }
            return sendItemResponse(req, res, { privateKey });
        });
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// fetch details about a custom domain
// to be consumed by the status page
router.get('/tlsCredential', async function(req, res) {
    try {
        const { domain } = req.query;
        const user = req.user;

        if (!domain) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'No domain is specified',
            });
        }

        const statusPage = await StatusPageService.getStatusPage(
            { domains: { $elemMatch: { domain } } },
            user
        );

        let domainObj = {};
        statusPage &&
            statusPage.domains &&
            statusPage.domains.forEach(eachDomain => {
                if (eachDomain.domain === domain) {
                    domainObj = eachDomain;
                }
            });

        return sendItemResponse(req, res, {
            cert: domainObj.cert,
            privateKey: domainObj.privateKey,
            autoProvisioning: domainObj.autoProvisioning,
            enableHttps: domainObj.enableHttps,
            domain: domainObj.domain,
        });
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

/**
 * @description deletes a particular domain from statuspage collection
 * @param {string} projectId id of the project
 * @param {string} statusPageId id of the status page
 * @param {string} domainId id of the domain
 * @returns response body
 */
router.delete(
    '/:projectId/:statusPageId/:domainId',
    getUser,
    isAuthorized,
    async (req, res) => {
        const { statusPageId, domainId } = req.params;

        try {
            const response = await StatusPageService.deleteDomain(
                statusPageId,
                domainId
            );
            return sendItemResponse(req, res, response);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

// Route Description: Updating Status Page.
// Params:
// Param1:
// Returns: response status, error message
router.put('/:projectId', getUser, isAuthorized, isUserAdmin, async function(
    req,
    res
) {
    const data = req.body;
    const upload = multer({
        storage,
    }).fields([
        {
            name: 'favicon',
            maxCount: 1,
        },
        {
            name: 'logo',
            maxCount: 1,
        },
        {
            name: 'banner',
            maxCount: 1,
        },
    ]);

    if (data.links) {
        if (typeof data.links !== 'object') {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'links are not of type object.',
            });
        }

        if (data.links.length > 5) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'You can have up to five links.',
            });
        }

        for (let i = 0; i < data.links.length; i++) {
            if (!data.links[i].name) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Link name is required',
                });
            }

            if (typeof data.links[i].name !== 'string') {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Link name is not of type text.',
                });
            }
            if (!data.links[i].url) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'URL is required.',
                });
            }

            if (typeof data.links[i].url !== 'string') {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'URL is not of type text.',
                });
            }
            if (!validUrl.isUri(data.links[i].url)) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Please enter a valid URL.',
                });
            }
        }
    }

    upload(req, res, async function(error) {
        const files = req.files || {};
        const data = req.body;
        data.projectId = req.params.projectId;
        data.subProjectId = req.params.subProjectId;
        if (error) {
            ErrorService.log(error);
            return sendErrorResponse(req, res, error);
        }

        let statusPage;
        if (data._id) {
            statusPage = await StatusPageService.findOneBy({
                _id: data._id,
            });
            const imagesPath = {
                faviconPath: statusPage.faviconPath,
                logoPath: statusPage.logoPath,
                bannerPath: statusPage.bannerPath,
            };
            if (
                Object.keys(files).length === 0 &&
                Object.keys(imagesPath).length !== 0
            ) {
                data.faviconPath = imagesPath.faviconPath;
                data.logoPath = imagesPath.logoPath;
                data.bannerPath = imagesPath.bannerPath;
                if (data.favicon === '') {
                    data.faviconPath = null;
                }
                if (data.logo === '') {
                    data.logoPath = null;
                }
                if (data.banner === '') {
                    data.bannerPath = null;
                }
            } else {
                if (files && files.favicon && files.favicon[0].filename) {
                    data.faviconPath = files.favicon[0].filename;
                }

                if (files && files.logo && files.logo[0].filename) {
                    data.logoPath = files.logo[0].filename;
                }
                if (files && files.banner && files.banner[0].filename) {
                    data.bannerPath = files.banner[0].filename;
                }
            }
        }
        if (data.colors) {
            data.colors = JSON.parse(data.colors);
        }

        try {
            const statusPage = await StatusPageService.updateOneBy(
                { projectId: data.projectId, _id: data._id },
                data
            );

            const updatedStatusPage = await StatusPageService.getStatusPage(
                { _id: statusPage._id },
                req.user.id
            );
            await RealTimeService.statusPageEdit(updatedStatusPage);

            return sendItemResponse(req, res, statusPage);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    });
});

router.get('/statusBubble', async function(req, res) {
    const statusPageId = req.query.statusPageId;
    const statusBubbleId = req.query.statusBubbleId;
    try {
        const probes = await ProbeService.findBy({}, 0, 0);
        if (!statusPageId) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'StatusPage Id is required',
            });
        }
        if (!statusBubbleId) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'StatusBubble Id is required',
            });
        }
        const statusPages = await StatusPageService.findBy({
            _id: statusPageId,
            statusBubbleId,
        });
        if (!(statusPages && statusPages.length)) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'There are no statuspages attached to this Id',
            });
        }
        // Call the StatusPageService.

        const statusPage = await StatusPageService.getStatusBubble(
            statusPages,
            probes
        );
        return sendItemResponse(req, res, statusPage);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route Description: Gets status pages of a project.
// Params:
// Param1: req.params-> {projectId};
// Returns: response status, error message

router.get('/:projectId/dashboard', getUser, isAuthorized, async function(
    req,
    res
) {
    const projectId = req.params.projectId;
    try {
        // Call the StatusPageService.
        const statusPages = await StatusPageService.findBy(
            { projectId: projectId },
            req.query.skip || 0,
            req.query.limit || 10
        );
        const count = await StatusPageService.countBy({ projectId: projectId });
        return sendListResponse(req, res, statusPages, count);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get(
    '/:projectId/statuspages',
    getUser,
    isAuthorized,
    getSubProjects,
    async function(req, res) {
        try {
            const subProjectIds = req.user.subProjects
                ? req.user.subProjects.map(project => project._id)
                : null;
            const statusPages = await StatusPageService.getSubProjectStatusPages(
                subProjectIds
            );
            return sendItemResponse(req, res, statusPages); // frontend expects sendItemResponse
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

router.get('/:projectId/statuspage', getUser, isAuthorized, async function(
    req,
    res
) {
    const projectId = req.params.projectId;
    try {
        const statusPage = await StatusPageService.findBy(
            { projectId },
            req.query.skip || 0,
            req.query.limit || 10
        );
        const count = await StatusPageService.countBy({ projectId });
        return sendListResponse(req, res, statusPage, count); // frontend expects sendListResponse
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// External status page api - get the data to show on status page using Slug
router.get('/:statusPageSlug', checkUser, ipWhitelist, async function(
    req,
    res
) {
    const statusPageSlug = req.params.statusPageSlug;
    const url = req.query.url;
    const user = req.user;
    let statusPage = {};
    try {
        // Call the StatusPageService.
        if (url && url !== 'null') {
            statusPage = await StatusPageService.getStatusPage(
                { domains: { $elemMatch: { domain: url } } },
                user
            );
        } else if ((!url || url === 'null') && statusPageSlug) {
            statusPage = await StatusPageService.getStatusPage(
                { slug: statusPageSlug },
                user
            );
        } else {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'StatusPage Slug or Url required',
            });
        }

        if (statusPage.isPrivate && !req.user) {
            return sendErrorResponse(req, res, {
                code: 401,
                message: 'You are unauthorized to access the page.',
            });
        } else {
            return sendItemResponse(req, res, statusPage);
        }
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get('/:statusPageId/rss', checkUser, async function(req, res) {
    const statusPageId = req.params.statusPageId;
    const url = req.query.url;
    const user = req.user;
    let statusPage = {};
    try {
        // Call the StatusPageService.
        if (url && url !== 'null') {
            statusPage = await StatusPageService.getStatusPage(
                { domains: { $elemMatch: { domain: url } } },
                user
            );
        } else if ((!url || url === 'null') && statusPageId) {
            statusPage = await StatusPageService.getStatusPage(
                { _id: statusPageId },
                user
            );
        } else {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'StatusPage Id or Url required',
            });
        }

        if (statusPage.isPrivate && !req.user) {
            return sendErrorResponse(req, res, {
                code: 401,
                message: 'You are unauthorized to access the page.',
            });
        } else {
            const { incidents } = await StatusPageService.getIncidents({
                _id: statusPageId,
            });
            const refinedIncidents = [];
            for (const incident of incidents) {
                refinedIncidents.push({
                    item: {
                        title: incident.title,
                        guid: `${global.apiHost}/statusPage/${statusPageId}/rss/${incident._id}`,
                        pubDate: new Date(incident.createdAt).toUTCString(),
                        description: `<![CDATA[Description: ${
                            incident.description
                        }<br>Incident Id: ${incident._id.toString()} <br>Monitor Name(s): ${handleMonitorList(
                            incident.monitors
                        )}<br>Acknowledge Time: ${
                            incident.acknowledgedAt
                        }<br>Resolve Time: ${incident.resolvedAt}<br>${
                            incident.investigationNote
                                ? `Investigation Note: ${incident.investigationNote}`
                                : ''
                        }]]>`,
                    },
                });
            }
            const xmlOptions = {
                indent: '  ',
                header: true,
            };

            const feedObj = {
                _name: 'rss',
                _attrs: {
                    version: '2.0',
                    'xmlns:content': 'http://purl.org/rss/1.0/modules/content/',
                    'xmlns:wfw': 'http://wellformedweb.org/CommentAPI/',
                },
                _content: {
                    channel: [
                        {
                            title: `Incidents for status page ${statusPage.name}`,
                        },
                        {
                            description:
                                'RSS feed for all incidents related to monitors attached to status page',
                        },
                        {
                            link: `${global.apiHost}/statusPage/${statusPageId}/rss`,
                        },
                        {
                            lastBuildDate: () => new Date().toUTCString(),
                        },
                        {
                            language: 'en',
                        },
                        ...refinedIncidents,
                    ],
                },
            };
            const finalFeed = toXML(feedObj, xmlOptions);
            res.contentType('application/rss+xml');
            return sendItemResponse(req, res, finalFeed);
        }
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});
router.get(
    '/:projectId/:statusPageSlug/notes',
    checkUser,
    ipWhitelist,
    async function(req, res) {
        let result;
        const statusPageSlug = req.params.statusPageSlug;
        const skip = req.query.skip || 0;
        const limit = req.query.limit || 10;
        const days = req.query.days || 14;
        const newTheme = req.query.newTheme;

        try {
            // Call the StatusPageService.
            const response = await StatusPageService.getNotes(
                { slug: statusPageSlug },
                skip,
                limit
            );
            const notes = response.notes;
            const count = response.count;
            const updatedNotes = [];
            if (newTheme) {
                if (notes.length > 0) {
                    for (const note of notes) {
                        const statusPageNote = await StatusPageService.getIncidentNotes(
                            { incidentId: note._id, postOnStatusPage: true },
                            skip,
                            limit
                        );

                        const sortMsg = statusPageNote.message.reverse();

                        updatedNotes.push({
                            ...note,
                            message: sortMsg,
                        });
                    }
                }
                result = formatNotes(updatedNotes, days);
                result = checkDuplicateDates(result);
            } else {
                result = notes;
            }
            return sendListResponse(req, res, result, count);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

router.get('/:projectId/incident/:incidentId', checkUser, async function(
    req,
    res
) {
    try {
        const { incidentId, projectId } = req.params;

        const incidentData = await IncidentService.findOneBy({
            projectId,
            idNumber: incidentId,
        });

        const incident = await StatusPageService.getIncident({
            _id: incidentData._id,
        });
        return sendItemResponse(req, res, incident);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get('/:projectId/:incidentId/incidentNotes', checkUser, async function(
    req,
    res
) {
    try {
        const { incidentId, projectId } = req.params;

        const incident = await IncidentService.findOneBy({
            projectId,
            idNumber: incidentId,
        });
        const { skip, limit, postOnStatusPage } = req.query;

        const response = await StatusPageService.getIncidentNotes(
            { incidentId: incident._id, postOnStatusPage },
            skip,
            limit
        );
        const { message, count } = response;
        return sendListResponse(req, res, message, count);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get('/:projectId/:monitorId/individualnotes', checkUser, async function(
    req,
    res
) {
    let date = req.query.date;
    date = new Date(date);
    const theme = req.query.theme;
    const start = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0,
        0,
        0
    );
    const end = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59
    );

    const skip = req.query.skip || 0;
    const limit = req.query.limit || 5;
    const query = {
        'monitors.monitorId': req.params.monitorId,
        deleted: false,
        createdAt: { $gte: start, $lt: end },
    };

    try {
        // Call the StatusPageService.
        const response = await StatusPageService.getNotesByDate(
            query,
            skip,
            limit
        );
        let notes = response.investigationNotes;
        if ((theme && typeof theme === 'boolean') || theme === 'true') {
            const updatedNotes = [];
            if (notes.length > 0) {
                for (const note of notes) {
                    const statusPageNote = await StatusPageService.getIncidentNotes(
                        { incidentId: note._id, postOnStatusPage: true },
                        skip,
                        0
                    );

                    const sortMsg = statusPageNote.message.reverse();

                    updatedNotes.push({
                        ...note,
                        message: sortMsg,
                    });
                }
                notes = updatedNotes;
            }
            notes = checkDuplicateDates(notes);
        }
        const count = response.count;
        return sendListResponse(req, res, notes, count);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get(
    '/:projectId/:statusPageSlug/events',
    checkUser,
    ipWhitelist,
    async function(req, res) {
        const statusPageSlug = req.params.statusPageSlug;
        const skip = req.query.skip || 0;
        const limit = req.query.limit || 5;
        const theme = req.query.theme;
        try {
            // Call the StatusPageService.
            const response = await StatusPageService.getEvents(
                { slug: statusPageSlug },
                skip,
                limit,
                theme
            );

            let events = response.events;
            const count = response.count;
            if ((theme && typeof theme === 'boolean') || theme === 'true') {
                const results = await fetchNotes(events, limit);
                events = results;
            }
            return sendListResponse(req, res, events, count);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

router.get(
    '/:projectId/:statusPageSlug/futureEvents',
    checkUser,
    ipWhitelist,
    async function(req, res) {
        try {
            const { statusPageSlug } = req.params;
            const { skip = 0, limit = 5, theme } = req.query;
            const response = await StatusPageService.getFutureEvents(
                { slug: statusPageSlug },
                skip,
                limit
            );
            if ((theme && typeof theme === 'boolean') || theme === 'true') {
                const results = await fetchNotes(response.events, limit);
                response.events = results;
            }
            const { events, count } = response;
            return sendListResponse(req, res, events, count);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

router.get(
    '/:projectId/:statusPageSlug/pastEvents',
    checkUser,
    ipWhitelist,
    async function(req, res) {
        try {
            const { statusPageSlug } = req.params;
            const { skip = 0, limit = 5, theme } = req.query;

            const response = await StatusPageService.getPastEvents(
                { slug: statusPageSlug },
                skip,
                limit
            );
            if ((theme && typeof theme === 'boolean') || theme === 'true') {
                const results = await fetchNotes(response.events, limit);
                response.events = results;
            }
            const { events, count } = response;

            return sendListResponse(req, res, events, count);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

const fetchNotes = async (events, limit) => {
    const updatedEvents = [];
    if (events.length > 0) {
        for (const event of events) {
            const statusPageEvent = await StatusPageService.getEventNotes({
                scheduledEventId: event._id,
                type: 'investigation',
            });
            updatedEvents.push({
                ...event,
                notes: statusPageEvent.notes,
            });
        }

        events = formatNotes(updatedEvents, limit);
        events = checkDuplicateDates(events);
        return events;
    }
};

router.get('/:projectId/notes/:scheduledEventSlug', checkUser, async function(
    req,
    res
) {
    const { scheduledEventSlug } = req.params;
    const { skip, limit, type } = req.query;
    const scheduledEventId = await ScheduledEventService.findOneBy({
        slug: scheduledEventSlug,
    });

    try {
        const response = await StatusPageService.getEventNotes(
            { scheduledEventId, type },
            skip,
            limit
        );
        const { notes, count } = response;
        return sendListResponse(req, res, notes, count);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get('/:projectId/:monitorId/individualevents', checkUser, async function(
    req,
    res
) {
    let date = req.query.date;
    date = moment(date)
        .endOf('day')
        .format();

    const skip = req.query.skip || 0;
    const limit = req.query.limit || 5;
    const theme = req.query.theme;

    const currentDate = moment().format();
    const query = {
        'monitors.monitorId': req.params.monitorId,
        showEventOnStatusPage: true,
        deleted: false,
        startDate: { $lte: date },
        endDate: {
            $gte: currentDate,
        },
    };

    try {
        // Call the StatusPageService.
        const response = await StatusPageService.getEventsByDate(
            query,
            skip,
            limit
        );
        let events = response.scheduledEvents;
        const count = response.count;
        if ((theme && typeof theme === 'boolean') || theme === 'true') {
            const updatedEvents = [];
            if (events.length > 0) {
                for (const event of events) {
                    const statusPageEvent = await StatusPageService.getEventNotes(
                        { scheduledEventId: event._id, type: 'investigation' }
                    );
                    updatedEvents.push({
                        ...event,
                        notes: statusPageEvent.notes,
                    });
                }
                events = updatedEvents;
            }
        }
        return sendListResponse(req, res, events, count);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// get a particular scheduled event
router.get(
    '/:projectId/scheduledEvent/:scheduledEventId',
    checkUser,
    async function(req, res) {
        const { scheduledEventId } = req.params;

        try {
            const response = await StatusPageService.getEvent({
                slug: scheduledEventId,
            });
            return sendListResponse(req, res, response);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);
// Route
// Description: Get all Monitor Statuses by monitorId
router.post('/:projectId/:monitorId/monitorStatuses', checkUser, async function(
    req,
    res
) {
    try {
        const { startDate, endDate } = req.body;
        const monitorId = req.params.monitorId;
        const monitorStatuses = await MonitorService.getMonitorStatuses(
            monitorId,
            startDate,
            endDate
        );
        return sendListResponse(req, res, monitorStatuses);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.post('/:projectId/:monitorId/monitorLogs', checkUser, async function(
    req,
    res
) {
    try {
        const { monitorId } = req.params;
        const endDate = moment(Date.now());
        const startDate = moment(endDate).subtract(90, 'days');
        const { memory, cpu, storage, responseTime, temperature } = req.body;
        const filter = {
            ...(!memory && {
                maxMemoryUsed: 0,
                memoryUsed: 0,
            }),
            ...(!cpu && {
                maxCpuLoad: 0,
                cpuLoad: 0,
            }),
            ...(!storage && {
                maxStorageUsed: 0,
                storageUsed: 0,
            }),
            ...(!responseTime && {
                maxResponseTime: 0,
                responseTime: 0,
            }),
            ...(!temperature && {
                maxMainTemp: 0,
                mainTemp: 0,
            }),
        };

        const monitorLogs = await MonitorService.getMonitorLogsByDay(
            monitorId,
            startDate,
            endDate,
            filter
        );
        return sendListResponse(req, res, monitorLogs);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get('/:projectId/probes', checkUser, async function(req, res) {
    try {
        const skip = req.query.skip || 0;
        const limit = req.query.limit || 0;
        const probes = await ProbeService.findBy({}, limit, skip);
        const count = await ProbeService.countBy({});
        return sendListResponse(req, res, probes, count);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.delete(
    '/:projectId/:statusPageSlug',
    getUser,
    isAuthorized,
    isUserAdmin,
    async function(req, res) {
        const statusPageSlug = req.params.statusPageSlug;
        const userId = req.user ? req.user.id : null;
        try {
            // Call the StatusPageService.
            const statusPage = await StatusPageService.deleteBy(
                { slug: statusPageSlug },
                userId
            );
            return sendItemResponse(req, res, statusPage);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

router.get('/:projectId/timeline/:incidentId', checkUser, async function(
    req,
    res
) {
    try {
        const { incidentId, projectId } = req.params;

        const incidentData = await IncidentService.findOneBy({
            projectId,
            idNumber: incidentId,
        });
        // setting limit to one
        // since the frontend only need the last content (current content)
        // of incident timeline
        const { skip = 0, limit = 1 } = req.query;

        const timeline = await IncidentTimelineService.findBy(
            { incidentId: incidentData._id },
            skip,
            limit
        );
        return sendItemResponse(req, res, timeline);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get(
    '/:projectId/:statusPageSlug/timelines',
    checkUser,
    ipWhitelist,
    async function(req, res) {
        try {
            const { statusPageSlug } = req.params;

            const incidents = await StatusPageService.getNotes({
                slug: statusPageSlug,
            });
            const response = await IncidentTimelineService.getIncidentLastTimelines(
                incidents.notes
            );
            return sendItemResponse(req, res, response);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

//get subscribers by monitorId in a statuspage
// req.params-> {projectId, monitorId, statusPageId};
// Returns: response subscribers, error message
router.get('/:projectId/monitor/:statusPageId', checkUser, async function(
    req,
    res
) {
    try {
        const { statusPageId } = req.params;
        const skip = req.query.skip || 0;
        const limit = req.query.limit || 10;
        const statusPage = await StatusPageService.findOneBy({
            _id: statusPageId,
        });
        const monitors = statusPage.monitors.map(mon => mon.monitor._id);
        const subscribers = await SubscriberService.findBy(
            {
                monitorId: monitors,
            },
            skip,
            limit
        );
        const count = await SubscriberService.countBy({
            monitorId: monitors,
        });
        return sendItemResponse(req, res, { subscribers, skip, limit, count });
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.post('/:projectId/announcement/:statusPageId', checkUser, async function(
    req,
    res
) {
    try {
        const { projectId, statusPageId } = req.params;
        const { data } = req.body;
        data.createdById = req.user ? req.user.id : null;

        if (!data) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: "Values can't be null",
            });
        }

        if (!data.name || !data.name.trim()) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Announcement name is required.',
            });
        }

        // data.monitors should be an array containing id of monitor(s)
        if (data.monitors && !Array.isArray(data.monitors)) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Monitors is not of type array',
            });
        }

        if (!projectId) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Project ID is required.',
            });
        }

        data.projectId = projectId;
        data.statusPageId = statusPageId;
        const response = await StatusPageService.createAnnouncement(data);

        return sendItemResponse(req, res, response);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.put(
    '/:projectId/announcement/:statusPageId/:announcementId',
    checkUser,
    async function(req, res) {
        try {
            const { projectId, statusPageId, announcementId } = req.params;
            const { data } = req.body;
            data.createdById = req.user ? req.user.id : null;

            if (!data.announcementToggle) {
                if (!data) {
                    return sendErrorResponse(req, res, {
                        code: 400,
                        message: "Values can't be null",
                    });
                }

                if (!data.name || !data.name.trim()) {
                    return sendErrorResponse(req, res, {
                        code: 400,
                        message: 'Announcement name is required.',
                    });
                }

                // data.monitors should be an array containing id of monitor(s)
                if (data.monitors && !Array.isArray(data.monitors)) {
                    return sendErrorResponse(req, res, {
                        code: 400,
                        message: 'Monitors is not of type array',
                    });
                }

                if (!projectId) {
                    return sendErrorResponse(req, res, {
                        code: 400,
                        message: 'Project ID is required.',
                    });
                }

                data.monitors = data.monitors.map(monitor => ({
                    monitorId: monitor,
                }));
            }

            const query = { projectId, statusPageId, _id: announcementId };

            const response = await StatusPageService.updateAnnouncement(
                query,
                data
            );

            if (response && data.announcementToggle) {
                const date = new Date();
                const log = {};
                log.statusPageId = statusPageId;
                if (data.hideAnnouncement) {
                    log.endDate = date;
                    log.updatedById = data.createdById;
                    log.active = false;
                    await StatusPageService.updateAnnouncementLog(
                        { active: true },
                        log
                    );
                } else {
                    log.announcementId = announcementId;
                    log.createdById = data.createdById;
                    log.startDate = date;
                    log.active = true;
                    await StatusPageService.createAnnouncementLog(log);
                }
            }

            return sendItemResponse(req, res, response);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

router.get(
    '/:projectId/announcementLogs/:statusPageId',
    checkUser,
    async function(req, res) {
        try {
            const { statusPageId } = req.params;
            const { skip, limit, theme } = req.query;
            let announcementLogs = await StatusPageService.getAnnouncementLogs(
                {
                    statusPageId,
                },
                skip,
                limit
            );

            const count = await StatusPageService.countAnnouncementLogs({
                statusPageId,
            });

            if ((theme && typeof theme === 'boolean') || theme === 'true') {
                const updatedLogs = [];
                for (const log of announcementLogs) {
                    updatedLogs.push({ ...log });
                }
                announcementLogs = formatNotes(updatedLogs, 20);
                announcementLogs = checkDuplicateDates(announcementLogs);
            }

            return sendItemResponse(req, res, {
                announcementLogs,
                skip,
                limit,
                count,
            });
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

router.get('/:projectId/announcement/:statusPageId', checkUser, async function(
    req,
    res
) {
    try {
        const { projectId, statusPageId } = req.params;
        const { skip, limit, show } = req.query;
        const query = { projectId, statusPageId };
        if (show) query.hideAnnouncement = false;

        const allAnnouncements = await StatusPageService.getAnnouncements(
            query,
            skip,
            limit
        );

        const count = await StatusPageService.countAnnouncements(query);

        return sendItemResponse(req, res, {
            allAnnouncements,
            skip,
            limit,
            count,
        });
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get(
    '/:projectId/announcement/:statusPageSlug/single/:announcementSlug',
    checkUser,
    async function(req, res) {
        try {
            const { projectId, statusPageSlug, announcementSlug } = req.params;
            const { _id } = await StatusPageService.findOneBy({
                slug: statusPageSlug,
            });
            const response = await StatusPageService.getSingleAnnouncement({
                projectId,
                statusPageId: _id,
                slug: announcementSlug,
            });
            return sendItemResponse(req, res, response);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

router.delete(
    `/:projectId/announcement/:announcementId/delete`,
    checkUser,
    async function(req, res) {
        try {
            const { projectId, announcementId } = req.params;
            const userId = req.user ? req.user.id : null;
            const response = await StatusPageService.deleteAnnouncement(
                {
                    projectId,
                    _id: announcementId,
                },
                userId
            );
            return sendItemResponse(req, res, response);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

router.delete(
    `/:projectId/announcementLog/:announcementLogId/delete`,
    checkUser,
    async function(req, res) {
        try {
            const { announcementLogId } = req.params;
            const userId = req.user ? req.user.id : null;
            const response = await StatusPageService.deleteAnnouncementLog(
                {
                    _id: announcementLogId,
                },
                userId
            );
            return sendItemResponse(req, res, response);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

const formatNotes = (data = [], days) => {
    const result = [];
    const limit = days - 1;

    for (let i = 0; i <= limit; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        if (data.length > 0) {
            for (const incident of data) {
                const { createdAt } = incident;
                const incidentDate = new Date(createdAt);

                // check if any incidence occured on this day.
                if (incidentDate.toDateString() === date.toDateString()) {
                    const lastIncident = result[result.length - 1];
                    const lastIncidentDate = new Date(lastIncident?.createdAt);

                    // if date has been pushed into result array, and we find an incidence, replace date with the incidence, else push incidence
                    lastIncidentDate.toDateString() ===
                        incidentDate.toDateString() && !lastIncident._id
                        ? (result[result.length - 1] = incident)
                        : result.push(incident);
                }
            }
        }
    }

    return result;
};

function checkDuplicateDates(items) {
    const track = {};

    const result = [];

    for (const item of items) {
        const date = String(item.createdAt).slice(0, 10);

        if (!track[date]) {
            item.style = true;
            track[date] = date;
        } else {
            item.style = false;
        }

        result.push(item);
    }
    return result;
}

function handleMonitorList(monitors) {
    if (monitors.length === 1) {
        return monitors[0].monitorId.name;
    }
    if (monitors.length === 2) {
        return `${monitors[0].monitorId.name} and ${monitors[1].monitorId.name}`;
    }
    if (monitors.length === 3) {
        return `${monitors[0].monitorId.name}, ${monitors[1].monitorId.name} and ${monitors[2].monitorId.name}`;
    }
    if (monitors.length > 3) {
        return `${monitors[0].monitorId.name}, ${
            monitors[1].monitorId.name
        } and ${monitors.length - 2} others`;
    }
}

module.exports = router;
