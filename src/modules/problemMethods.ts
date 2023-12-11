import { Prisma, Problem } from '@prisma/client';

import { prisma } from '../utils/prisma';
import { idsToIdObjs, ErrorWithStatus } from '../utils';
import { ApiEntityListResult } from '../utils/types';

import {
    CheckIsAvailableProblemType,
    CreateProblem,
    DeleteProblem,
    GetProblemList,
    ProblemCount,
    ProblemFindManyWithAuthorAndTagsAndFavourite,
    ProblemWithRelationsAndProblemSection,
    UpdateProblem,
    UsedProblemMap,
} from './problemTypes';
import { SectionWithSolutionsAndSectionType } from './sectionTypes';
import { sectionMethods } from './sectionMethods';
import { tr } from './modules.i18n';

const constructFindAllProblemsWhereFilter = async (
    userId: number,
    data: GetProblemList,
): Promise<Prisma.ProblemWhereInput> => {
    const where = {} as Prisma.ProblemWhereInput;

    if (data.search) {
        where.OR = [
            { name: { contains: data.search, mode: 'insensitive' } },
            { description: { contains: data.search, mode: 'insensitive' } },
        ];
    }

    if (data.tagIds) {
        where.AND = { tags: { some: { id: { in: data.tagIds } } } };
    }

    if (data.difficulty) {
        where.difficulty = { in: data.difficulty };
    }

    where.id = {};

    if (data.favoritesOnly) {
        where.favoritedBy = { some: { id: userId } };
    }

    if (data.nonFavoritesOnly) {
        where.NOT = { favoritedBy: { some: { id: userId } } };
    }

    if (data.authorIds) {
        where.authorId = { in: data.authorIds };
    }

    if (data.excludeProblemIds && data.excludeProblemIds.length) {
        where.id.notIn = data.excludeProblemIds;
    }

    return where;
};

/**
 * We go through the problems from the sections of the interview and divide them into:
 * - a map of all the problems from the interview with info about the section in which they were used
 * - list of issue IDs used in the current section
 */
const getUsedProblemMapAndProblemIds = (
    sections: SectionWithSolutionsAndSectionType[],
    currentSectionId: number,
): { usedProblemMap: UsedProblemMap; currentSectionProblemIds: number[] } => {
    const usedProblemMap: UsedProblemMap = new Map();
    const currentSectionProblemIds: number[] = [];

    sections.forEach((section) => {
        section.solutions.forEach((solution) => {
            if (section.id === currentSectionId) {
                currentSectionProblemIds.push(solution.problemId);
            } else {
                usedProblemMap.set(solution.problemId, {
                    sectionId: solution.sectionId,
                    sectionType: section.sectionType,
                });
            }
        });
    });

    return { usedProblemMap, currentSectionProblemIds };
};

const getProblemUsageInInterviewInfo = (
    problemId: number,
    usedProblemMap: UsedProblemMap,
): CheckIsAvailableProblemType => {
    const isUsed = usedProblemMap.has(problemId);

    return {
        isUsed,
        ...(isUsed && { problemSection: usedProblemMap.get(problemId) }),
    };
};

const mergeProblemsUsedInTheInterview = (
    problems: ProblemFindManyWithAuthorAndTagsAndFavourite[],
    usedProblemMap: UsedProblemMap,
): ProblemWithRelationsAndProblemSection[] => {
    if (usedProblemMap.size) {
        return problems.map((problem) => ({
            ...problem,
            ...getProblemUsageInInterviewInfo(problem.id, usedProblemMap),
        }));
    }

    return problems;
};

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
        throw new ErrorWithStatus(tr('Problem not found'), 404);
    }

    return problem;
};

const getCount = async (userId: number, data: GetProblemList): Promise<ProblemCount> => {
    const where = await constructFindAllProblemsWhereFilter(userId, data);

    const count = await prisma.problem.count({ where });
    const total = await prisma.problem.count();

    return { count, total };
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
            const sections = await sectionMethods.getInterviewSections({ interviewId: data.excludeInterviewId });
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

            return { nextCursor, items: firstQueryItems, total: total.count };
        }
        const secondLimit = limit - firstQueryItems.length;
        const secondQueryItems = await secondQueryItemsFunction(secondLimit);

        if (secondQueryItems.length > secondLimit) {
            const nextItem = secondQueryItems.pop();
            nextCursor = nextItem?.id;
        }

        return { nextCursor, items: [...firstQueryItems, ...secondQueryItems], total: total.count };
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

    return { nextCursor, items: secondQueryItems, total: total.count };
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

export const problemMethods = {
    create,
    getById,
    getList,
    update,
    delete: deleteProblem,
    getCount,
};
