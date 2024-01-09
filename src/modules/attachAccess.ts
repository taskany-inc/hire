import { Session } from 'next-auth';

import { getServerSession } from '../utils/auth';
import { NextHandler } from '../utils/types';

import { accessChecks, AccessCheckResult } from './accessChecks';

type AccessChecker = (session: Session) => AccessCheckResult;

const createGuard =
    (checker: AccessChecker): NextHandler =>
    async (req, res, next) => {
        const session = await getServerSession(req, res);

        if (!session) {
            res.status(401).end();
            return;
        }

        const checkResult = checker(session);

        if (checkResult.allowed) {
            req.accessOptions = checkResult.accessOptions;
            next();
        } else {
            res.setHeader('Content-Type', 'text/plain;  charset=UTF-8');
            res.status(403).end(checkResult.errorMessage);
        }
    };

export const accessGuards = {
    attach: {
        create: createGuard(accessChecks.attach.create),
        readOne: createGuard(accessChecks.attach.readOne),
        delete: createGuard(accessChecks.attach.delete),
    },
};
