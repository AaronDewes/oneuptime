import express, { Request, Response } from 'common-server/utils/express';

import request from 'request';
import IntegrationService from '../services/integrationService';
const getUser = require('../middlewares/user').getUser;
const isUserAdmin = require('../middlewares/project').isUserAdmin;
const {
    CLIENT_ID,
    CLIENT_SECRET,
    APP_ROUTE,
    API_ROUTE,
} = require('../config/slack');
import {
    sendErrorResponse,
    sendListResponse,
    sendItemResponse,
} from 'common-server/utils/response';

const router = express.getRouter();

router.get('/auth/redirect', function (req: Request, res: Response) {
    // get oneuptime project id from slack auth state query params
    let state = req.query.state;
    const slackCode = req.query.code;

    if (!slackCode) {
        return sendErrorResponse(req, res, {
            code: 400,
            message: 'Slack code missing in query, must be present',
        });
    }

    if (!state) {
        return sendErrorResponse(req, res, {
            code: 400,
            message: 'Slack state missing in query, must be present',
        });
    }
    // hack that gets the user authToken and project ID, not very secure, but sufficient for now

    state = state.split(',', 2);

    const projectId = state[0];

    const userToken = state[1];

    const options = {
        uri: `${API_ROUTE}/slack/${projectId}/link?code=${slackCode}`,
        method: 'POST',
        headers: {
            Authorization: userToken,
        },
    };

    request(options, (error: $TSFixMe, response: $TSFixMe) => {
        if (error || response.statusCode === 400) {
            return sendErrorResponse(req, res, error);
        } else {
            return res.redirect(
                `${APP_ROUTE}/project/${projectId}/integrations`
            );
        }
    });
});

router.post(
    '/:projectId/link',
    getUser,
    isUserAdmin,
    async function (req: Request, res: Response) {
        const projectId = req.params.projectId;
        const code = req.query.code;

        const userId = req.user ? req.user.id : null;
        const slug = req.body.slug;

        if (!slug) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'projectId missing in query, must be present',
            });
        }

        if (!code) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'code missing in query, must be present',
            });
        }

        const options = {
            uri:
                'https://slack.com/api/oauth.access?code=' +
                code +
                '&client_id=' +
                CLIENT_ID +
                '&client_secret=' +
                CLIENT_SECRET,
            method: 'GET',
        };

        request(
            options,
            async (error: $TSFixMe, response: $TSFixMe, body: $TSFixMe) => {
                const JSONresponse = JSON.parse(body);
                if (!JSONresponse.ok) {
                    return sendErrorResponse(req, res, JSONresponse.error);
                } else {
                    // get slack response object
                    const data = {
                        userId: JSONresponse.user_id,
                        teamName: JSONresponse.team_name,
                        accessToken: JSONresponse.access_token,
                        teamId: JSONresponse.team_id,
                        channelId: JSONresponse.incoming_webhook.channel_id,
                        channel: JSONresponse.incoming_webhook.channel,
                        botUserId: JSONresponse.bot.bot_user_id,
                        botAccessToken: JSONresponse.bot.bot_access_token,
                    };

                    const integrationType = 'slack';
                    try {
                        const slack = await IntegrationService.create(
                            projectId,
                            userId,
                            data,
                            integrationType,
                            null
                        );
                        return sendItemResponse(req, res, slack);
                    } catch (error) {
                        return sendErrorResponse(req, res, error);
                    }
                }
            }
        );
    }
);

// req => params => {teamId, projectId}
router.delete(
    '/:projectId/unLink/:teamId',
    getUser,
    isUserAdmin,
    async function (req: Request, res: Response) {
        const projectId = req.params.projectId;
        const teamId = req.params.teamId;

        const userId = req.user ? req.user.id : null;

        const integrationType = 'slack';

        try {
            const data = await IntegrationService.deleteBy(
                {
                    projectId: projectId,
                    'data.teamId': teamId,
                    integrationType: integrationType,
                },
                userId
            );
            return sendItemResponse(req, res, data);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

// req => params => {projectId}
router.get(
    '/:projectId/teams',
    getUser,
    async function (req: Request, res: Response) {
        const projectId = req.params.projectId;
        const integrationType = 'slack';

        try {
            const select =
                'webHookName projectId createdById integrationType data monitors createdAt notificationOptions';
            const populate = [
                { path: 'createdById', select: 'name' },
                { path: 'projectId', select: 'name' },
                {
                    path: 'monitors.monitorId',
                    select: 'name',
                    populate: [{ path: 'componentId', select: 'name' }],
                },
            ];
            const [integrations, count] = await Promise.all([
                IntegrationService.findBy({
                    query: {
                        projectId: projectId,
                        integrationType: integrationType,
                    },
                    skip: req.query.skip || 0,
                    limit: req.query.limit || 10,
                    select,
                    populate,
                }),
                IntegrationService.countBy({
                    projectId: projectId,
                    integrationType: integrationType,
                }),
            ]);
            return sendListResponse(req, res, integrations, count);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

export default router;
