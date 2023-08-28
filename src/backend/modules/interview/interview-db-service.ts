import { Interview, Prisma } from '@prisma/client';
import { Session } from 'next-auth';

import { prisma } from '../..';
import { ErrorWithStatus } from '../../../utils';
import { buildItemListOrderBy, buildItemListWhere } from '../../item-list.utils';
import { ApiEntityListResult, ApiEntityListSelectionParams } from '../../types';

import {
    CandidateInterviewsFetchParams,
    CreateInterview,
    GetInterviewByIdOptions,
    InterviewByInterviewer,
    InterviewWithCandidateRelation,
    InterviewWithHireStreamAndSectionsRelation,
    InterviewWithRelations,
    InterviewWithSections,
    UpdateInterview,
} from './interview-types';
import { tr } from './interview.i18n';

const create = async (creatorId: number, data: CreateInterview): Promise<Interview> => {
    const { candidateId, hireStreamId, ...restData } = data;

    const createData: Prisma.InterviewCreateInput = {
        ...restData,
        feedback: '',
        creator: { connect: { id: creatorId } },
        candidate: { connect: { id: candidateId } },
        hireStream: { connect: { id: hireStreamId } },
    };

    return prisma.interview.create({ data: createData });
};

const getById = async (id: number, options?: GetInterviewByIdOptions): Promise<InterviewWithRelations> => {
    const showGradeForOwnSectionOnly = options?.showGradeForOwnSectionOnly;
    const showReactions = options?.showReactions;
    const reactions = showReactions && {
        reactions: {
            include: {
                user: true,
            },
        },
    };

    const interview = await prisma.interview.findFirst({
        where: { id },
        include: {
            creator: true,
            candidate: true,
            sections: {
                orderBy: {
                    createdAt: 'asc',
                },
                include: {
                    interviewer: true,
                    sectionType: true,
                    solutions: {
                        include: {
                            problem: true,
                        },
                    },
                },
                where: { isCanceled: false },
            },
            candidateSelectedSection: true,
            hireStream: true,
            ...reactions,
        },
    });

    if (interview === null) {
        throw new ErrorWithStatus(tr('Interview not found'), 404);
    }

    if (showGradeForOwnSectionOnly) {
        interview.sections.forEach((section) => {
            if (section.interviewerId !== showGradeForOwnSectionOnly.interviewerId) {
                section.grade = null;
            }
        });
    }

    return interview as InterviewWithRelations;
};

const findWithSections = async (id: number): Promise<InterviewWithSections> => {
    const interview = await prisma.interview.findFirst({
        where: { id },
        include: {
            sections: true,
        },
    });

    if (interview === null) {
        throw new ErrorWithStatus(tr('Interview not found'), 404);
    }

    return interview;
};

const getByIdWithFilteredSections = async (session: Session | null, id: number): Promise<InterviewWithRelations> => {
    if (!session) {
        throw new ErrorWithStatus(tr('No session'), 401);
    }
    const shouldHideSectionGrade = !session.userRoles.admin && session.userRoles.interviewer;
    const showReactions = session.userRoles.admin || session.userRoles.hasHiringLeadRoles;

    if (shouldHideSectionGrade) {
        return getById(id, { showGradeForOwnSectionOnly: { interviewerId: session.user.id }, showReactions });
    }

    return getById(id, { showReactions });
};

const getListByCandidateId = async ({
    candidateId,
    accessOptions = {},
}: CandidateInterviewsFetchParams): Promise<InterviewWithHireStreamAndSectionsRelation[]> => {
    const { filterInterviewsByHireStreamIds, filterInterviewsBySectionTypeIds } = accessOptions;
    const interviewAccessFilter: Prisma.InterviewWhereInput = {};

    if (filterInterviewsByHireStreamIds) {
        interviewAccessFilter.hireStreamId = { in: filterInterviewsByHireStreamIds };
    }

    if (filterInterviewsBySectionTypeIds) {
        interviewAccessFilter.sections = { some: { sectionTypeId: { in: filterInterviewsBySectionTypeIds } } };
    }

    return prisma.interview.findMany({
        where: {
            candidateId,
            ...interviewAccessFilter,
        },
        include: { hireStream: true, sections: true },
    });
};

function updateHireStreamConnection(hireStreamId?: number | null) {
    if (typeof hireStreamId === 'number') {
        return { connect: { id: hireStreamId } };
    }

    if (hireStreamId === null) {
        return { disconnect: true };
    }
}

const update = async ({
    candidateId,
    interviewId,
    candidateSelectedSectionId,
    hireStreamId,
    ...data
}: UpdateInterview): Promise<Interview> => {
    const candidateSelectedSection =
        typeof candidateSelectedSectionId === 'number'
            ? { connect: { id: candidateSelectedSectionId } }
            : { disconnect: true };

    const hireStream = updateHireStreamConnection(hireStreamId);

    return prisma.interview.update({
        data: { ...data, candidateSelectedSection, hireStream },
        where: { id: interviewId },
    });
};

const deleteInterview = async (id: number): Promise<Interview> => {
    return prisma.interview.delete({ where: { id } });
};

const findAllInterviewerInterviews = (interviewerId: number): Promise<InterviewByInterviewer[]> => {
    const sections = {
        where: {
            interviewerId,
        },
        include: {
            sectionType: true,
            interviewer: true,
        },
    };
    const include = {
        creator: true,
        candidate: true,
        sections,
    };

    return prisma.interview.findMany({
        where: {
            OR: [
                { creatorId: interviewerId },
                {
                    sections: {
                        some: { interviewerId },
                    },
                },
            ],
        },
        include,
        orderBy: {
            createdAt: 'desc',
        },
    });
};

const defaultOrderBy: Prisma.InterviewOrderByWithRelationInput = {
    id: 'asc',
};

const searchSettings = {
    minSearchLength: 2,
    fieldsToSearchFrom: ['description', 'candidate.name'],
};

const findAll = async (
    params: ApiEntityListSelectionParams,
): Promise<ApiEntityListResult<InterviewWithCandidateRelation>> => {
    const where = buildItemListWhere<Prisma.InterviewWhereInput>(params, searchSettings);

    const total = await prisma.interview.count({ where });

    if (!total) {
        return {
            items: [],
            total,
        };
    }

    const items = await prisma.interview.findMany({
        where,
        include: {
            candidate: { select: { name: true } },
        },
        orderBy: buildItemListOrderBy<Prisma.InterviewOrderByWithRelationInput>(params, defaultOrderBy),
        take: params.limit,
        skip: params.offset,
    });

    return { items, total };
};

export const interviewDbService = {
    create,
    getById,
    getByIdWithFilteredSections,
    findAll,
    getListByCandidateId,
    update,
    delete: deleteInterview,
    findAllInterviewerInterviews,
    findWithSections,
};
