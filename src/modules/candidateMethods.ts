import { Candidate, OutstaffVendor, Prisma } from '@prisma/client';
import { decodeUrlDateRange, getDateString } from '@taskany/bricks';

import { prisma } from '../utils/prisma';
import { ErrorWithStatus } from '../utils';
import { wrapValueInObjPath } from '../utils/objects';
import { buildItemListOrderBy, SearchSettings } from '../utils/itemList';
import { ApiEntityListResult } from '../utils/types';
import config from '../config';

import { AccessOptions } from './accessChecks';
import {
    CandidateWithVendorAndInterviewWithSectionsRelations,
    CandidateWithVendorAndInterviewWithSectionsWithCommentsWithCreatorRelations,
    CandidateWithVendorRelation,
    CreateCandidate,
    GetCandidateList,
    UpdateCandidate,
} from './candidateTypes';
import { tr } from './modules.i18n';

const defaultOrderBy: Prisma.CandidateOrderByWithRelationInput = {
    id: 'desc',
};

function prepareCandidateInput<T extends CreateCandidate | Omit<UpdateCandidate, 'candidateId'>>({
    email,
    outstaffVendorId,
    ...otherData
}: T): T {
    return {
        // Replacing empty strings with null to bypass a unique constraint
        email: email || null,
        ...(outstaffVendorId ? { outstaffVendor: { connect: { id: outstaffVendorId } } } : {}),
        ...otherData,
    } as T;
}

const create = (candidate: CreateCandidate): Promise<Candidate> => {
    const data = prepareCandidateInput(candidate);

    return prisma.candidate.create({ data });
};

const searchSettings: SearchSettings = {
    minSearchLength: 2,
    fieldsToSearchFrom: ['name', 'email', 'phone', 'outstaffVendor.title', 'outstaffVendorId'],
};

const getList = async (
    params: GetCandidateList = {},
    accessOptions: AccessOptions = {},
): Promise<ApiEntityListResult<CandidateWithVendorAndInterviewWithSectionsWithCommentsWithCreatorRelations>> => {
    const { statuses, search, hireStreamIds, cursor, hrIds, vacancyIds, createdAt, sectionTypeIds } = params;
    const limit = params.limit ?? 50;
    const { filterInterviewsByHireStreamIds, filterByInterviewerId, filterSectionGradeByInterviewer } = accessOptions;
    const interviewIdsGroupByCandidates = await prisma.interview.groupBy({ by: ['candidateId'], _max: { id: true } });
    // eslint-disable-next-line no-underscore-dangle
    const interviewIds = interviewIdsGroupByCandidates.map((item) => item._max.id);
    const interviewIdsWithNoNulls = interviewIds.reduce((acc: number[], rec: number | null) => {
        if (!acc && rec !== null) acc = [rec];

        if (rec !== null) acc = [...acc, rec];

        return acc;
    }, []);

    const interviewWithRequestedStatuses = await prisma.interview.findMany({
        where: { id: { in: interviewIdsWithNoNulls }, status: { in: statuses } },
    });

    const interviewIdsWithRequestedStatuses = interviewWithRequestedStatuses.map((it) => it.id);

    const conditionForInsideCandidateSearch =
        params.search && config.defaultCandidateVendor?.toLowerCase().includes(params.search.toLowerCase());
    const insideCandidateCondition: Prisma.StringNullableFilter = {
        equals: null,
    } as Prisma.StringNullableFilter;

    const where: Prisma.CandidateWhereInput = {};

    const whereAnd: Prisma.CandidateWhereInput[] = [{}];

    if (search && search.length >= searchSettings.minSearchLength) {
        const whereSearchCondition: Prisma.StringFilter = {
            contains: search,
            mode: 'insensitive',
        } as Prisma.StringFilter;

        where.OR = searchSettings.fieldsToSearchFrom.map((field): Prisma.CandidateWhereInput => {
            if (conditionForInsideCandidateSearch && field === 'outstaffVendorId') {
                return wrapValueInObjPath(insideCandidateCondition, field) as Prisma.CandidateWhereInput;
            }

            return wrapValueInObjPath(whereSearchCondition, field) as Prisma.CandidateWhereInput;
        });
    }

    if (createdAt) {
        whereAnd.push({
            interviews: {
                some: {
                    OR: createdAt.reduce<
                        {
                            createdAt:
                                | {
                                      lte: Date | undefined;
                                      gte: Date | undefined;
                                  }
                                | {
                                      in: Date[];
                                  };
                        }[]
                    >((acum, item) => {
                        const dateRange = decodeUrlDateRange(item);

                        if (dateRange) {
                            const end = new Date(getDateString(dateRange.end));
                            const start = dateRange.start ? new Date(getDateString(dateRange.start)) : null;

                            acum.push({
                                createdAt: start
                                    ? {
                                          gte: start,
                                          lte: end,
                                      }
                                    : {
                                          in: [end],
                                      },
                            });
                        }

                        return acum;
                    }, []),
                },
            },
        });
    }

    if (statuses) {
        whereAnd.push({ interviews: { some: { id: { in: interviewIdsWithRequestedStatuses } } } });
    }

    if (hrIds) {
        const interviewsOfRequestedHrs = await prisma.interview.findMany({
            where: {
                id: { in: interviewIdsWithNoNulls },
                creatorId: { in: hrIds },
            },
        });

        whereAnd.push({ interviews: { some: { id: { in: interviewsOfRequestedHrs.map(({ id }) => id) } } } });
    }

    if (hireStreamIds) {
        const interviewWithRequestedHireStreams = await prisma.interview.findMany({
            where: {
                id: { in: interviewIdsWithNoNulls },
                hireStreamId: { in: [...hireStreamIds].map(Number) },
            },
        });
        const interviewRequestedHireStreamIds = interviewWithRequestedHireStreams.map((item) => item.id);
        whereAnd.push({ interviews: { some: { id: { in: interviewRequestedHireStreamIds } } } });
    }

    if (sectionTypeIds) {
        whereAnd.push({
            interviews: {
                some: {
                    sections: {
                        some: {
                            sectionTypeId: {
                                in: sectionTypeIds,
                            },
                        },
                    },
                },
            },
        });
    }

    const interviewAccessFilter: Prisma.InterviewWhereInput = {};

    if (filterInterviewsByHireStreamIds) {
        interviewAccessFilter.hireStreamId = { in: filterInterviewsByHireStreamIds };
    }

    if (filterByInterviewerId) {
        interviewAccessFilter.sections = { some: { interviewers: { some: { id: filterByInterviewerId } } } };
        where.interviews = { some: { sections: { some: { interviewers: { some: { id: filterByInterviewerId } } } } } };
    }

    if (vacancyIds) {
        whereAnd.push({ interviews: { some: { crewVacancyId: { in: vacancyIds } } } });
    }

    if (whereAnd.length) where.AND = whereAnd;

    const count = await prisma.candidate.count({ where });

    const total = await prisma.candidate.count({});

    if (!count) {
        return {
            items: [],
            count,
            total,
        };
    }

    const items = await prisma.candidate.findMany({
        where,
        orderBy: buildItemListOrderBy<Prisma.CandidateOrderByWithRelationInput>(params, defaultOrderBy),
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
            outstaffVendor: true,
            interviews: {
                where: interviewAccessFilter,
                include: {
                    hireStream: true,
                    sections: {
                        include: {
                            sectionType: true,
                            interviewer: true,
                            interviewers: true,
                        },
                    },
                    creator: true,
                    comments: {
                        include: {
                            user: true,
                        },
                    },
                },
                orderBy: { createdAt: 'asc' },
            },
        },
    });

    items.forEach((candidate) =>
        candidate.interviews.forEach((interview) =>
            interview.sections.forEach((section) => {
                if (filterSectionGradeByInterviewer) {
                    section.grade = null;
                }
            }),
        ),
    );

    let nextCursor: typeof cursor | undefined;

    if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
    }

    return { items, total, nextCursor, count };
};

const getById = async (id: number): Promise<CandidateWithVendorRelation> => {
    const candidate = await prisma.candidate.findFirst({ where: { id }, include: { outstaffVendor: true } });

    if (candidate === null) {
        throw new ErrorWithStatus(tr('Candidate not found!'), 404);
    }

    return candidate;
};

const getByIdWithRelations = async (
    id: number,
    options: AccessOptions = {},
): Promise<CandidateWithVendorAndInterviewWithSectionsRelations> => {
    const { filterInterviewsByHireStreamIds, filterByInterviewerId } = options;
    const interviewAccessFilter: Prisma.InterviewWhereInput = {};

    if (filterInterviewsByHireStreamIds) {
        interviewAccessFilter.hireStreamId = { in: filterInterviewsByHireStreamIds };
    }

    if (filterByInterviewerId) {
        interviewAccessFilter.sections = { some: { interviewers: { some: { id: filterByInterviewerId } } } };
    }

    const candidate = await prisma.candidate.findFirst({
        where: { id },
        include: {
            outstaffVendor: true,
            interviews: {
                include: {
                    hireStream: true,
                    sections: {
                        include: {
                            interviewers: true,
                        },
                    },
                },
                where: interviewAccessFilter,
            },
        },
    });

    if (candidate === null) {
        throw new ErrorWithStatus(tr('Candidate not found!'), 404);
    }

    return candidate;
};

const update = (data: UpdateCandidate): Promise<Candidate> => {
    const { candidateId, ...restData } = data;
    const preparedData = prepareCandidateInput(restData);

    return prisma.candidate.update({ where: { id: candidateId }, data: preparedData });
};

const deleteCandidate = (id: number): Promise<Candidate> => {
    return prisma.candidate.delete({ where: { id } });
};

async function getOutstaffVendors(): Promise<OutstaffVendor[]> {
    const items = await prisma.outstaffVendor.findMany();

    return items;
}

export const candidateMethods = {
    create,
    getList,
    update,
    delete: deleteCandidate,
    getById,
    getByIdWithRelations,
    getOutstaffVendors,
};
