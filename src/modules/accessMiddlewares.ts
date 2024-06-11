import { TRPCError } from '@trpc/server';
import { Session } from 'next-auth';

import { middleware } from '../trpc/trpcBackend';

import { calendarMethods } from './calendarMethods';
import { candidateMethods } from './candidateMethods';
import { interviewMethods } from './interviewMethods';
import { problemMethods } from './problemMethods';
import { HireStreamIdAndUserId } from './rolesTypes';
import { sectionTypeMethods } from './sectionTypeMethods';
import { sectionMethods } from './sectionMethods';
import {
    CreateSection,
    DeleteSection,
    GetInterviewSections,
    GetSection,
    UpdateSectionWithMetadata,
} from './sectionTypes';
import { hireStreamMethods } from './hireStreamMethods';
import { EditInterviewAccessList, UpdateInterview } from './interviewTypes';
import { AccessCheckResult, accessChecks } from './accessChecks';
import { tr } from './modules.i18n';
import { commentMethods } from './commentMethods';
import { SolutionIdQuery, SwitchSolutionsOrder, UpdateSolution } from './solutionTypes';
import { solutionMethods } from './solutionMethods';

type AccessChecker = (session: Session) => AccessCheckResult;

const createMiddleware = (checker: AccessChecker) =>
    middleware(async ({ next, ctx }) => {
        const { session } = ctx;

        if (!session) {
            throw new TRPCError({ code: 'FORBIDDEN', message: tr('Not authorized') });
        }

        const check = checker(session);

        if (!check.allowed) {
            throw new TRPCError({ code: 'FORBIDDEN', message: check.errorMessage });
        }

        return next({ ctx: { session, accessOptions: check.accessOptions } });
    });

type EntityIdGetter<TInput, TId> = (input: TInput) => TId;
type EntityGetter<TId, TEntity> = (id: TId) => TEntity | Promise<TEntity>;
type EntityAccessChecker<TEntity> = (session: Session, entity: TEntity) => AccessCheckResult;

const createEntityCheckMiddleware = <TInput, TId, TEntity>(
    getId: EntityIdGetter<TInput, TId>,
    getEntity: EntityGetter<TId, TEntity>,
    checker: EntityAccessChecker<TEntity>,
) =>
    middleware(async ({ next, ctx, input }) => {
        const { session } = ctx;

        if (!session) {
            throw new TRPCError({ code: 'FORBIDDEN', message: tr('Not authorized') });
        }

        const id = getId(input as TInput);
        const entity = await getEntity(id);
        const check = checker(session, entity);

        if (!check.allowed) {
            throw new TRPCError({ code: 'FORBIDDEN', message: check.errorMessage });
        }

        return next({ ctx: { session, accessOptions: check.accessOptions } });
    });

export const accessMiddlewares = {
    problem: {
        create: createMiddleware(accessChecks.problem.read),
        read: createMiddleware(accessChecks.problem.read),
        updateOrDelete: createEntityCheckMiddleware(
            (input: { problemId: number }) => input.problemId,
            problemMethods.getById,
            accessChecks.problem.updateOrDelete,
        ),
    },

    section: {
        create: createEntityCheckMiddleware(
            (input: CreateSection) => input.interviewId,
            async (interviewId) => {
                const interview = await interviewMethods.getById(interviewId);

                return interview.hireStreamId;
            },
            accessChecks.section.create,
        ),
        readOne: createEntityCheckMiddleware(
            (input: GetSection) => input.sectionId,
            sectionMethods.getById,
            accessChecks.section.readOne,
        ),
        readMany: createEntityCheckMiddleware(
            (input: GetInterviewSections) => input.interviewId,
            interviewMethods.getById,
            accessChecks.section.readMany,
        ),
        update: createEntityCheckMiddleware(
            (input: UpdateSectionWithMetadata) => input.data.sectionId,
            sectionMethods.getById,
            accessChecks.section.update,
        ),
        updateNoMetadata: createEntityCheckMiddleware(
            (input: { sectionId: number }) => input.sectionId,
            sectionMethods.getById,
            accessChecks.section.update,
        ),
        updateOrDeleteSolution: createEntityCheckMiddleware(
            (input: UpdateSolution | SolutionIdQuery) => input.solutionId,
            async (solutionId) => {
                const solution = await solutionMethods.getById(solutionId);
                return solution.section;
            },
            accessChecks.section.update,
        ),
        switchSolutions: createEntityCheckMiddleware(
            (input: SwitchSolutionsOrder) => input.sectionId,
            sectionMethods.getById,
            accessChecks.section.update,
        ),
        delete: createEntityCheckMiddleware(
            (input: DeleteSection) => input.sectionId,
            sectionMethods.getById,
            accessChecks.section.delete,
        ),
    },

    hireStream: {
        create: createMiddleware(accessChecks.hireStream.create),
        readOne: createEntityCheckMiddleware(
            (input: { hireStreamId: number }) => input.hireStreamId,
            hireStreamMethods.getById,
            accessChecks.hireStream.readOne,
        ),
        readOneByName: createEntityCheckMiddleware(
            (input: { hireStreamName: string }) => input.hireStreamName,
            hireStreamMethods.getByName,
            accessChecks.hireStream.readOne,
        ),
        read: createMiddleware(accessChecks.hireStream.read),
        updateBySectionTypeId: createEntityCheckMiddleware(
            (input: { sectionTypeId: number }) => input.sectionTypeId,
            async (sectionTypeId) => {
                const sectionType = await sectionTypeMethods.getById({ id: sectionTypeId });

                return sectionType.hireStreamId;
            },
            accessChecks.hireStream.update,
        ),
    },

    analytics: {
        readOne: createEntityCheckMiddleware(
            (input: { hireStreamName: string }) => input.hireStreamName,
            hireStreamMethods.getByName,
            accessChecks.hireStream.readOne,
        ),
        read: createMiddleware(accessChecks.analytics.read),
    },

    tag: {
        create: createMiddleware(accessChecks.tag.create),
        read: createMiddleware(accessChecks.tag.read),
    },

    candidate: {
        create: createMiddleware(accessChecks.candidate.create),
        readOne: createEntityCheckMiddleware(
            (input: { candidateId: number }) => input.candidateId,
            candidateMethods.getByIdWithRelations,
            accessChecks.candidate.readOne,
        ),
        readMany: createMiddleware(accessChecks.candidate.readMany),
        update: createEntityCheckMiddleware(
            (input: { candidateId: number }) => input.candidateId,
            candidateMethods.getByIdWithRelations,
            accessChecks.candidate.update,
        ),
        delete: createEntityCheckMiddleware(
            (input: { candidateId: number }) => input.candidateId,
            candidateMethods.getByIdWithRelations,
            accessChecks.candidate.delete,
        ),
    },

    interview: {
        create: createEntityCheckMiddleware(
            (input: { hireStreamId: number }) => input.hireStreamId,
            (id) => id,
            accessChecks.interview.create,
        ),
        readOne: createEntityCheckMiddleware(
            (input: { interviewId: number }) => input.interviewId,
            interviewMethods.getById,
            accessChecks.interview.readOne,
        ),
        readMany: createMiddleware(accessChecks.interview.readMany),
        update: createEntityCheckMiddleware(
            (input: { data: UpdateInterview }) => input.data.interviewId,
            async (interviewId) => {
                const interview = await interviewMethods.getById(interviewId);

                return interview.hireStreamId;
            },
            accessChecks.interview.update,
        ),
        delete: createMiddleware(accessChecks.interview.delete),
        editAccessList: createEntityCheckMiddleware(
            (input: EditInterviewAccessList) => input.interviewId,
            async (interviewId) => {
                const interview = await interviewMethods.getById(interviewId);
                return interview.hireStreamId;
            },
            accessChecks.interview.update,
        ),
    },

    roles: {
        readAdmins: createMiddleware(accessChecks.roles.readAdmins),
        readOrUpdateHireStreams: createEntityCheckMiddleware(
            (input: HireStreamIdAndUserId) => input.hireStreamId,
            (id) => id,
            accessChecks.roles.readOrUpdateHireStreamUsers,
        ),
    },

    calendar: {
        create: createMiddleware(accessChecks.calendar.create),
        readMany: createMiddleware(accessChecks.calendar.readMany),
        updateOrDelete: createEntityCheckMiddleware(
            (input: { eventId: string }) => input.eventId,
            calendarMethods.getEventById,
            accessChecks.calendar.updateOrDelete,
        ),
    },

    user: {
        create: createMiddleware(accessChecks.user.create),
    },

    comment: {
        create: createMiddleware(accessChecks.comment.create),

        updateOrDelete: createEntityCheckMiddleware(
            (input: { id: string }) => input.id,
            commentMethods.getById,
            accessChecks.comment.updateOrDelete,
        ),
    },

    vacancy: {
        read: createMiddleware(accessChecks.vacancy.read),
    },
};
