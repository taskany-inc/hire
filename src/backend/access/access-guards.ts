import { NextApiRequest } from 'next';
import { Session } from 'next-auth';

import { getServerSession } from '../../utils/auth';
import { attachDbService } from '../modules/attach/attach-db-service';
import { NextHandler } from '../types';

import { accessChecks, AccessCheckResult } from './access-checks';

type EntityIdGetter<TId = number> = (req: NextApiRequest) => TId;

type EntityGetter<TEntity, TId = number> = (id: TId) => Promise<TEntity>;

type EntityAccessChecker<TEntity> = (session: Session, entity: TEntity) => AccessCheckResult;

const createEntityCheckGuard =
    <TEntity, TId = number>(
        getEntityId: EntityIdGetter<TId>,
        getEntity: EntityGetter<TEntity, TId>,
        checker: EntityAccessChecker<TEntity>,
    ): NextHandler =>
    async (req, res, next) => {
        const session = await getServerSession(req, res);

        if (!session) {
            res.status(401).end();

            return;
        }

        const id = getEntityId(req);
        const entity = await getEntity(id);

        const checkResult = checker(session, entity);

        if (checkResult.allowed) {
            req.accessOptions = checkResult.accessOptions;
            next();
        } else {
            res.setHeader('Content-Type', 'text/plain;  charset=UTF-8');
            res.status(403).end(checkResult.errorMessage);
        }
    };

const getSectionDbService = () => import('../modules/section/section-db-service');

export const accessGuards = {
    attach: {
        create: createEntityCheckGuard(
            (req) => Number(req.query.id),
            async (id) => {
                const { sectionDbService } = await getSectionDbService();

                return sectionDbService.getById(id);
            },
            accessChecks.section.attachFile,
        ),
        readOne: createEntityCheckGuard(
            (req) => String(req.query.id),
            async (id) => {
                const attach = await attachDbService.getById(id);

                return attach.section;
            },
            accessChecks.section.readOne,
        ),

        delete: createEntityCheckGuard(
            (req) => String(req.query.id),
            async (id) => {
                const attach = await attachDbService.getById(id);

                return attach.section;
            },
            accessChecks.section.attachFile,
        ),
    },
};
