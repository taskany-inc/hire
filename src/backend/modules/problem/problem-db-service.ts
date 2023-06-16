import { Prisma, Problem } from '@prisma/client';

import { prisma } from '../..';
import { idsToIdObjs } from '../../utils';
import { ErrorWithStatus } from '../../../utils';
import { sectionDbService } from '../section/section-db-service';
import { ApiEntityListResult } from '../../types';

import {
    constructFindAllProblemsWhereFilter,
    getUsedProblemMapAndProblemIds,
    mergeProblemsUsedInTheInterview,
} from './problem-db-utils';
import {
    CreateProblem,
    DeleteProblem,
    GetProblemList,
    ProblemWithRelationsAndProblemSection,
    UpdateProblem,
    UsedProblemMap,
} from './problem-types';

const create = async (authorId: number, data: CreateProblem): Promise<Problem> => {
    const { tagIds, ...restData } = data;
    const createData: Prisma.ProblemCreateInput = {
        ...restData,
        author: { connect: { id: authorId } },
        tags: { connect: idsToIdObjs(tagIds) },
    };

    return prisma.problem.create({ data: createData });
};

const getById = async (id: number) => {
    const problem = await prisma.problem.findFirst({
        where: { id },
        include: { author: true, tags: true, favoritedBy: true },
    });

    if (problem === null) {
        throw new ErrorWithStatus('Problem not found', 404);
    }

    return problem;
};

const getCount = async (authorId: number, data: GetProblemList): Promise<number> => {
    const where = await constructFindAllProblemsWhereFilter(authorId, data);

    return prisma.problem.count({ where });
};

// TODO: specify the type when we write the ProblemWithRelation type explicitly
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const getList = async (
    userId: number,
    params: GetProblemList = {},
): Promise<ApiEntityListResult<ProblemWithRelationsAndProblemSection>> => {
    const { favoritesOnly, nonFavoritesOnly, cursor, ...data } = params;
    let firstQueryWhere: Prisma.ProblemWhereInput | undefined;
    let usedProblemMap: UsedProblemMap = new Map();
    let secondQueryWhere: Prisma.ProblemWhereInput | undefined;
    let currentSectionProblemIds: number[] = [];
    const limit = params.limit ?? 50;
    const total = await getCount(userId, params);

    if (!favoritesOnly && !nonFavoritesOnly) {
        if (data.excludeInterviewId && data.sectionId) {
            const sections = await sectionDbService.getInterviewSections({ interviewId: data.excludeInterviewId });
            const usedProblemMapAndProblemIds = getUsedProblemMapAndProblemIds(sections, data.sectionId);
            usedProblemMap = usedProblemMapAndProblemIds.usedProblemMap;
            currentSectionProblemIds = usedProblemMapAndProblemIds.currentSectionProblemIds;
        }

        firstQueryWhere = await constructFindAllProblemsWhereFilter(userId, {
            ...data,
            excludeProblemIds: currentSectionProblemIds,
            favoritesOnly: true,
        });
        secondQueryWhere = await constructFindAllProblemsWhereFilter(userId, {
            ...data,
            excludeProblemIds: currentSectionProblemIds,
            nonFavoritesOnly: true,
        });
    } else {
        firstQueryWhere = await constructFindAllProblemsWhereFilter(userId, {
            ...data,
            favoritesOnly,
            nonFavoritesOnly,
        });
    }

    const include = {
        author: true,
        tags: true,
        favoritedBy: {
            where: {
                id: userId,
            },
        },
    };
    const orderBy = [
        {
            id: 'asc',
        },
    ] as Prisma.ProblemOrderByWithRelationInput;

    const firstQueryItems: ProblemWithRelationsAndProblemSection[] = await prisma.problem
        .findMany({
            where: firstQueryWhere,
            include,
            orderBy,
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
        })
        .then((problems) => mergeProblemsUsedInTheInterview(problems, usedProblemMap));

    const secondQueryItemsFunction = async (
        secondLimit: number,
        secondCursor?: number,
    ): Promise<ProblemWithRelationsAndProblemSection[]> => {
        const result = await prisma.problem
            .findMany({
                where: secondQueryWhere,
                include,
                orderBy,
                take: secondLimit + 1,
                cursor: secondCursor ? { id: secondCursor } : undefined,
            })
            .then((problems) => mergeProblemsUsedInTheInterview(problems, usedProblemMap));

        return result;
    };

    let nextCursor: typeof cursor | undefined;

    const cursorProblemFunc = async () => {
        if (firstQueryItems.length > limit) {
            const nextItem = firstQueryItems.pop();
            nextCursor = nextItem?.id;

            return { nextCursor, items: firstQueryItems, total };
        }
        const secondLimit = limit - firstQueryItems.length;
        const secondQueryItems = await secondQueryItemsFunction(secondLimit);

        if (secondQueryItems.length > secondLimit) {
            const nextItem = secondQueryItems.pop();
            nextCursor = nextItem?.id;
        }

        return { nextCursor, items: [...firstQueryItems, ...secondQueryItems], total };
    };

    if (!cursor) {
        return cursorProblemFunc();
    }

    const cursorProblem = await getById(cursor);
    const cursorProblemFavorites = cursorProblem.favoritedBy.some((user) => user.id === userId);

    if (cursorProblemFavorites) {
        return cursorProblemFunc();
    }
    const secondQueryItems = await secondQueryItemsFunction(limit, cursor);

    if (secondQueryItems.length > limit) {
        const nextItem = secondQueryItems.pop();
        nextCursor = nextItem?.id;
    }

    return { nextCursor, items: secondQueryItems, total };
};

const update = (data: UpdateProblem): Promise<Problem> => {
    const { problemId, tagIds, ...restData } = data;
    const updateData: Prisma.ProblemUpdateInput = { ...restData };

    if (tagIds && tagIds.length > 0) {
        updateData.tags = { set: idsToIdObjs(tagIds) };
    }

    return prisma.problem.update({ data: updateData, where: { id: problemId } });
};

const deleteProblem = ({ problemId }: DeleteProblem): Promise<Problem> => {
    return prisma.problem.delete({ where: { id: problemId } });
};

export const problemDbService = {
    create,
    getById,
    getList,
    update,
    delete: deleteProblem,
    getCount,
};
