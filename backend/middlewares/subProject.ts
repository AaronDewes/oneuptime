import ProjectService from '../Services/projectService';
import { sendErrorResponse } from 'common-server/Utils/Response';
import BadDataException from 'common/types/exception/BadDataException';
import {
    ExpressRequest,
    ExpressResponse,
    NextFunction,
} from 'common-server/Utils/Express';
import url from 'url';

export default {
    // Description: Get subprojects which user belongs to.
    getSubProjects: async function (
        req: ExpressRequest,
        res: ExpressResponse,
        next: NextFunction
    ) {
        try {
            const userId = req.user
                ? req.user.id
                : null || url.parse(req.url, true).query.userId;

            const projectId =
                req.params.projectId ||
                req.body.projectId ||
                url.parse(req.url, true).query.projectId;

            req.user.subProjects = null;

            //sanitize
            if (!projectId) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Project id is not present.',
                });
            }

            const query =
                userId === 'API'
                    ? {
                          $or: [
                              { parentProjectId: projectId },
                              { _id: projectId },
                          ],
                      }
                    : {
                          $or: [
                              {
                                  parentProjectId: projectId,
                                  'users.userId': userId,
                              },
                              { _id: projectId, 'users.userId': userId },
                          ],
                      };
            // Fetch user subprojects
            const populate = [{ path: 'parentProjectId', select: 'name' }];
            const select =
                '_id slug name users stripePlanId stripeSubscriptionId parentProjectId seats deleted apiKey alertEnable alertLimit alertLimitReached balance alertOptions isBlocked adminNotes';

            const subProjects = await ProjectService.findBy({
                query,
                select,
                populate,
            });
            if (subProjects.length > 0) {
                req.user.subProjects = subProjects;
                return next();
            } else {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'You are not present in any subProject.',
                });
            }
        } catch (error) {
            return sendErrorResponse(
                req,
                res,
                new BadDataException('Bad request to server')
            );
        }
    },
};
