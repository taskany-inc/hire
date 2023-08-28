import { Prisma } from '@prisma/client';

import { SectionWithSolutionsAndSectionType } from '../section/section-types';

import {
    CheckIsAvailableProblemType,
    GetProblemList,
    ProblemFindManyWithAuthorAndTagsAndFavourite,
    ProblemWithRelationsAndProblemSection,
    UsedProblemMap,
} from './problem-types';

export const constructFindAllProblemsWhereFilter = async (
    authorId: number,
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
        where.difficulty = data.difficulty;
    }

    where.id = {};

    if (data.favoritesOnly) {
        where.favoritedBy = { some: { id: authorId } };
    }

    if (data.nonFavoritesOnly) {
        where.NOT = { favoritedBy: { some: { id: authorId } } };
    }

    if (data.authorId) {
        where.authorId = data.authorId;
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
export const getUsedProblemMapAndProblemIds = (
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

export const getProblemUsageInInterviewInfo = (
    problemId: number,
    usedProblemMap: UsedProblemMap,
): CheckIsAvailableProblemType => {
    const isUsed = usedProblemMap.has(problemId);

    return {
        isUsed,
        ...(isUsed && { problemSection: usedProblemMap.get(problemId) }),
    };
};

export const mergeProblemsUsedInTheInterview = (
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
