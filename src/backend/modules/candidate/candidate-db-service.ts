import { Candidate, InterviewStatus, OutstaffVendor, Prisma } from '@prisma/client';

import { prisma } from '../..';
import { ErrorWithStatus } from '../../../utils';
import { wrapValueInObjPath } from '../../../utils/objects';
import { AccessOptions } from '../../access/access-checks';
import { buildItemListOrderBy, SearchSettings } from '../../item-list.utils';
import { ApiEntityListResult } from '../../types';
import config from '../../config';

import {
    CandidateWithVendorAndInterviewWithSectionsRelations,
    CandidateWithVendorRelation,
    CreateCandidate,
    GetCandidateList,
    UpdateCandidate,
} from './candidate-types';
import { tr } from './candidate.i18n';

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

type WhereList = {
    OR?: Prisma.CandidateWhereInput[];
    AND?: Prisma.CandidateWhereInput;
};

const getList = async (
    params: GetCandidateList = {},
    accessOptions: AccessOptions = {},
): Promise<ApiEntityListResult<CandidateWithVendorAndInterviewWithSectionsRelations>> => {
    const { statuses, search, hireStreamIds, cursor } = params;
    const limit = params.limit ?? 50;
    const { filterInterviewsByHireStreamIds, filterCandidatesBySectionTypeIds } = accessOptions;
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

    const where: WhereList = {};

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

    if (statuses && [statuses].flat().some((status) => status === InterviewStatus.NEW)) {
        where.AND = {
            OR: [
                { interviews: { none: {} } },
                { interviews: { some: { id: { in: interviewIdsWithRequestedStatuses } } } },
            ],
        };
    }

    if (statuses && ![statuses].flat().some((status) => status === InterviewStatus.NEW)) {
        where.AND = { interviews: { some: { id: { in: interviewIdsWithRequestedStatuses } } } };
    }

    if (hireStreamIds) {
        const interviewWithRequestedHireStreams = await prisma.interview.findMany({
            where: {
                id: { in: interviewIdsWithNoNulls },
                hireStreamId: { in: [...hireStreamIds].map(Number) },
            },
        });
        const interviewRequestedHireStreamIds = interviewWithRequestedHireStreams.map((item) => item.id);
        where.AND = { interviews: { some: { id: { in: interviewRequestedHireStreamIds } } } };
    }

    const interviewAccessFilter: Prisma.InterviewWhereInput = {};

    if (filterInterviewsByHireStreamIds) {
        interviewAccessFilter.hireStreamId = { in: filterInterviewsByHireStreamIds };
    }

    if (filterCandidatesBySectionTypeIds) {
        interviewAccessFilter.sections = { some: { sectionTypeId: { in: filterCandidatesBySectionTypeIds } } };
    }

    const total = await prisma.candidate.count({ where });

    if (!total) {
        return {
            items: [],
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
                    sections: true,
                },
                orderBy: { createdAt: 'asc' },
            },
        },
    });
    let nextCursor: typeof cursor | undefined;

    if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
    }

    return { items, total, nextCursor };
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
    const { filterInterviewsByHireStreamIds, filterInterviewsBySectionTypeIds } = options;
    const interviewAccessFilter: Prisma.InterviewWhereInput = {};

    if (filterInterviewsByHireStreamIds) {
        interviewAccessFilter.hireStreamId = { in: filterInterviewsByHireStreamIds };
    }

    if (filterInterviewsBySectionTypeIds) {
        interviewAccessFilter.sections = { some: { sectionTypeId: { in: filterInterviewsBySectionTypeIds } } };
    }

    const candidate = await prisma.candidate.findFirst({
        where: { id },
        include: {
            outstaffVendor: true,
            interviews: {
                include: { hireStream: true, sections: true },
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

export const candidateDbService = {
    create,
    getList,
    update,
    delete: deleteCandidate,
    getById,
    getByIdWithRelations,
    getOutstaffVendors,
};
