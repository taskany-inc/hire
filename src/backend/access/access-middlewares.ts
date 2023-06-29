import { TRPCError } from '@trpc/server';
import { Session } from 'next-auth';

import { calendarDbService } from '../modules/calendar/calendar-db-service';
import { candidateDbService } from '../modules/candidate/candidate-db-service';
import { interviewDbService } from '../modules/interview/interview-db-service';
import { problemDbService } from '../modules/problem/problem-db-service';
import { HireStreamIdAndUserId } from '../modules/roles/roles-types';
import { sectionTypeDbService } from '../modules/section-type/section-type-db-service';
import { sectionDbService } from '../modules/section/section-db-service';
import {
    CreateSection,
    DeleteSection,
    GetInterviewSections,
    GetSection,
    UpdateSectionWithMetadata,
} from '../modules/section/section-types';
import { solutionDbService } from '../modules/solution/solution-db-service';
import { middleware } from '../trpc/trpc-back';

import { AccessCheckResult, accessChecks } from './access-checks';

import { tr } from './access.i18n';

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
            problemDbService.getById,
            accessChecks.problem.updateOrDelete,
        ),
    },

    solution: {
        create: createEntityCheckMiddleware(
            (input: { sectionId: number }) => input.sectionId,
            sectionDbService.getById,
            accessChecks.solution.create,
        ),
        readBySectionId: createEntityCheckMiddleware(
            (input: { sectionId: number }) => input.sectionId,
            sectionDbService.getById,
            accessChecks.solution.read,
        ),
        updateOrDeleteBySectionId: createEntityCheckMiddleware(
            (input: { sectionId: number }) => input.sectionId,
            sectionDbService.getById,
            accessChecks.solution.updateOrDelete,
        ),
        updateOrDelete: createEntityCheckMiddleware(
            (input: { solutionId: number }) => input.solutionId,
            async (id) => {
                const solution = await solutionDbService.getById(id);

                return solution.section;
            },
            accessChecks.solution.updateOrDelete,
        ),
    },

    section: {
        create: createEntityCheckMiddleware(
            (input: CreateSection) => input.interviewId,
            async (interviewId) => {
                const interview = await interviewDbService.getById(interviewId);

                return interview.hireStreamId;
            },
            accessChecks.section.create,
        ),
        readOne: createEntityCheckMiddleware(
            (input: GetSection) => input.sectionId,
            sectionDbService.getById,
            accessChecks.section.readOne,
        ),
        readMany: createEntityCheckMiddleware(
            (input: GetInterviewSections) => input.interviewId,
            interviewDbService.getById,
            accessChecks.section.readMany,
        ),
        update: createEntityCheckMiddleware(
            (input: UpdateSectionWithMetadata) => input.data.sectionId,
            sectionDbService.getById,
            accessChecks.section.update,
        ),
        delete: createEntityCheckMiddleware(
            (input: DeleteSection) => input.sectionId,
            sectionDbService.getById,
            accessChecks.section.delete,
        ),
    },

    hireStream: {
        create: createMiddleware(accessChecks.hireStream.create),
        read: createMiddleware(accessChecks.hireStream.read),
        updateBySectionTypeId: createEntityCheckMiddleware(
            (input: { sectionTypeId: number }) => input.sectionTypeId,
            async (sectionTypeId) => {
                const sectionType = await sectionTypeDbService.getById({ id: sectionTypeId });

                return sectionType.hireStreamId;
            },
            accessChecks.hireStream.update,
        ),
    },

    tag: {
        create: createMiddleware(accessChecks.tag.create),
        read: createMiddleware(accessChecks.tag.read),
    },

    candidate: {
        create: createMiddleware(accessChecks.candidate.create),
        readOne: createEntityCheckMiddleware(
            (input: { candidateId: number }) => input.candidateId,
            candidateDbService.getByIdWithRelations,
            accessChecks.candidate.readOne,
        ),
        readMany: createMiddleware(accessChecks.candidate.readMany),
        update: createEntityCheckMiddleware(
            (input: { candidateId: number }) => input.candidateId,
            candidateDbService.getByIdWithRelations,
            accessChecks.candidate.update,
        ),
        delete: createEntityCheckMiddleware(
            (input: { candidateId: number }) => input.candidateId,
            candidateDbService.getByIdWithRelations,
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
            interviewDbService.getById,
            accessChecks.interview.readOne,
        ),
        readMany: createMiddleware(accessChecks.interview.readMany),
        update: createEntityCheckMiddleware(
            (input: { interviewId: number }) => input.interviewId,
            async (interviewId) => {
                const interview = await interviewDbService.getById(interviewId);

                return interview.hireStreamId;
            },
            accessChecks.interview.update,
        ),
        delete: createMiddleware(accessChecks.interview.delete),
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
            calendarDbService.getEventById,
            accessChecks.calendar.updateOrDelete,
        ),
    },

    reaction: {
        createOrReadOrUpdateOrDelete: createEntityCheckMiddleware(
            (input: { interviewId: number }) => input.interviewId,
            async (id) => {
                const interview = await interviewDbService.getById(id);

                return interview.hireStreamId;
            },
            accessChecks.reaction.createOrReadOrUpdateOrDelete,
        ),
    },

    user: {
        create: createMiddleware(accessChecks.user.create),
    },
};
