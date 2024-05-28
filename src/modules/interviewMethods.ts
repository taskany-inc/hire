import { Interview, InterviewStatus, Prisma } from '@prisma/client';
import { Session } from 'next-auth';

import { prisma } from '../utils/prisma';
import { ErrorWithStatus, idsToIdObjs } from '../utils';
import { buildItemListOrderBy, buildItemListWhere } from '../utils/itemList';
import { ApiEntityListResult, ApiEntityListSelectionParams } from '../utils/types';
import { commentFormatting, getActivityFeed } from '../utils/commentFormatting';

import {
    CandidateInterviewsFetchParams,
    CreateInterview,
    EditInterviewAccessList,
    GetInterviewByIdOptions,
    InterviewByInterviewer,
    InterviewWithCandidateRelation,
    InterviewWithHireStreamAndSectionsRelation,
    InterviewWithRelations,
    InterviewWithSections,
    UpdateInterview,
} from './interviewTypes';
import { tr } from './modules.i18n';
import { crewMethods } from './crewMethods';
import { VacancyStatus } from './crewTypes';

const create = async (creatorId: number, data: CreateInterview): Promise<Interview> => {
    const { candidateId, hireStreamId, attachIds, cvAttachId, ...restData } = data;

    const createData: Prisma.InterviewCreateInput = {
        ...restData,
        feedback: '',
        creator: { connect: { id: creatorId } },
        candidate: { connect: { id: candidateId } },
        hireStream: { connect: { id: hireStreamId } },
        attaches: attachIds ? { connect: idsToIdObjs(attachIds) } : undefined,
        cv: cvAttachId ? { connect: { id: cvAttachId } } : undefined,
    };

    return prisma.interview.create({ data: createData });
};

const getById = async (id: number, options?: GetInterviewByIdOptions): Promise<InterviewWithRelations> => {
    const showGradeForOwnSectionOnly = options?.showGradeForOwnSectionOnly;

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
            cv: true,
            restrictedUsers: true,
            allowedUsers: true,
            comments: {
                include: {
                    user: true,
                    attaches: true,
                    reactions: { include: { user: { select: { name: true, email: true } } } },
                },
            },
        },
    });

    const comments = commentFormatting(interview?.comments);

    const sections = interview?.sections;

    const activityFeed = getActivityFeed(comments ?? [], sections ?? []);

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

    return { ...interview, comments, activityFeed };
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

    if (shouldHideSectionGrade) {
        return getById(id, { showGradeForOwnSectionOnly: { interviewerId: session.user.id } });
    }

    return getById(id);
};

const getListByCandidateId = async ({
    candidateId,
    accessOptions = {},
}: CandidateInterviewsFetchParams): Promise<InterviewWithHireStreamAndSectionsRelation[]> => {
    const {
        filterInterviewsByHireStreamIds,
        filterInterviewsBySectionTypeIds,
        addInterviewsByUserAccessPermission,
        filterInterviewsByUserAccessRestriction,
    } = accessOptions;
    const interviewAccessFilter: Prisma.InterviewWhereInput = {};

    if (filterInterviewsByHireStreamIds) {
        interviewAccessFilter.hireStreamId = { in: filterInterviewsByHireStreamIds };
    }

    if (filterInterviewsBySectionTypeIds) {
        interviewAccessFilter.sections = { some: { sectionTypeId: { in: filterInterviewsBySectionTypeIds } } };
    }

    if (filterInterviewsByUserAccessRestriction) {
        interviewAccessFilter.restrictedUsers = {
            none: { id: { equals: filterInterviewsByUserAccessRestriction } },
        };
    }

    return prisma.interview.findMany({
        where: {
            OR: [
                { candidateId, ...interviewAccessFilter },
                { candidateId, allowedUsers: { some: { id: { equals: addInterviewsByUserAccessPermission } } } },
            ],
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
    cvAttachId,
    ...data
}: UpdateInterview): Promise<Interview> => {
    const candidateSelectedSection =
        typeof candidateSelectedSectionId === 'number'
            ? { connect: { id: candidateSelectedSectionId } }
            : { disconnect: true };

    const hireStream = updateHireStreamConnection(hireStreamId);

    if (data.status === InterviewStatus.HIRED) {
        const interview = await prisma.interview.findFirstOrThrow({
            where: { id: interviewId },
            select: { crewVacancyId: true },
        });
        if (interview.crewVacancyId !== null) {
            crewMethods.editVacancy({ id: interview.crewVacancyId, status: VacancyStatus.CLOSED });
        }
    }

    return prisma.interview.update({
        data: {
            ...data,
            candidateSelectedSection,
            hireStream,
            cv: cvAttachId ? { connect: { id: cvAttachId } } : undefined,
        },
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
            comments: { include: { user: true } },
        },
        orderBy: buildItemListOrderBy<Prisma.InterviewOrderByWithRelationInput>(params, defaultOrderBy),
        take: params.limit,
        skip: params.offset,
    });

    return { items, total };
};

const editAccessList = async (data: EditInterviewAccessList) => {
    const interview = await prisma.interview.findFirst({
        where: { id: data.interviewId },
        select: {
            restrictedUsers: { select: { id: true } },
            allowedUsers: { select: { id: true } },
        },
    });
    let restrictedUserIds = interview?.restrictedUsers.map((u) => u.id) ?? [];
    let allowedUserIds = interview?.allowedUsers.map((u) => u.id) ?? [];
    if (data.type === 'RESTRICT' && data.action === 'ADD') {
        restrictedUserIds.push(data.userId);
    }
    if (data.type === 'RESTRICT' && data.action === 'DELETE') {
        restrictedUserIds = restrictedUserIds.filter((id) => id !== data.userId);
    }
    if (data.type === 'ALLOW' && data.action === 'ADD') {
        allowedUserIds.push(data.userId);
    }
    if (data.type === 'ALLOW' && data.action === 'DELETE') {
        allowedUserIds = allowedUserIds.filter((id) => id !== data.userId);
    }
    const uniqueRestrictedUsers = Array.from(new Set(restrictedUserIds));
    const uniqueAllowedUsers = Array.from(new Set(allowedUserIds));
    return prisma.interview.update({
        where: { id: data.interviewId },
        data: {
            restrictedUsers: { set: idsToIdObjs(uniqueRestrictedUsers) },
            allowedUsers: { set: idsToIdObjs(uniqueAllowedUsers) },
        },
    });
};

export const interviewMethods = {
    create,
    getById,
    getByIdWithFilteredSections,
    findAll,
    getListByCandidateId,
    update,
    delete: deleteInterview,
    findAllInterviewerInterviews,
    findWithSections,
    editAccessList,
};
