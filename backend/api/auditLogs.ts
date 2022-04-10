import express, {
    ExpressRequest,
    ExpressResponse,
} from 'common-server/Utils/Express';
const router = express.getRouter();

import AuditLogsService from '../Services/auditLogsService';
const getUser = require('../middlewares/user').getUser;
const isUserMasterAdmin = require('../middlewares/user').isUserMasterAdmin;

import { sendErrorResponse } from 'common-server/Utils/Response';
import Exception from 'common/types/exception/Exception';

import { sendListResponse } from 'common-server/Utils/Response';

import { sendItemResponse } from 'common-server/Utils/Response';

router.get(
    '/',
    getUser,
    isUserMasterAdmin,
    async (req: ExpressRequest, res: ExpressResponse) => {
        try {
            const query = {};
            const skip = req.query['skip'];
            const limit = req.query['limit'];

            const populateAuditLog = [
                { path: 'userId', select: 'name' },
                { path: 'projectId', select: 'name' },
            ];

            const selectAuditLog =
                'userId projectId request response createdAt';
            const [auditLogs, count] = await Promise.all([
                AuditLogsService.findBy({
                    query,
                    skip,
                    limit,
                    select: selectAuditLog,
                    populate: populateAuditLog,
                }),
                AuditLogsService.countBy({ query }),
            ]);

            return sendListResponse(req, res, auditLogs, count);
        } catch (error) {
            return sendErrorResponse(req, res, error as Exception);
        }
    }
);

router.post(
    '/search',
    getUser,
    isUserMasterAdmin,
    async (req: ExpressRequest, res: ExpressResponse) => {
        try {
            const filter = req.body.filter;
            const skip = req.query['skip'];
            const limit = req.query['limit'];

            const { searchedAuditLogs, totalSearchCount } =
                await AuditLogsService.search({ filter, skip, limit });

            return sendListResponse(
                req,
                res,
                searchedAuditLogs,
                totalSearchCount
            );
        } catch (error) {
            return sendErrorResponse(req, res, error as Exception);
        }
    }
);

router.delete(
    '/',
    getUser,
    isUserMasterAdmin,
    async (req: ExpressRequest, res: ExpressResponse) => {
        try {
            const query = {};

            const msg = await AuditLogsService.hardDeleteBy({ query });

            return sendItemResponse(req, res, msg);
        } catch (error) {
            return sendErrorResponse(req, res, error as Exception);
        }
    }
);

export default router;
