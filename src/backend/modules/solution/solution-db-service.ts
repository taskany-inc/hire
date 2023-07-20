import { Prisma, Solution, SolutionResult } from '@prisma/client';
import { Session } from 'next-auth';

import { prisma } from '../..';
import { ErrorWithStatus } from '../../../utils';

import { CreateSolution, GetSolutionsBySectionId, SwitchSolutionsOrder, UpdateSolution } from './solution-types';

import { tr } from './solution.i18n';

const create = async (data: CreateSolution): Promise<Solution> => {
    const { problemId, sectionId, ...restData } = data;
    const createData: Prisma.SolutionCreateInput = {
        ...restData,
        problem: { connect: { id: problemId } },
        section: { connect: { id: sectionId } },
    };

    return prisma.solution.create({ data: createData });
};

const getById = async (id: number, interviewerId?: number) => {
    const solution = await prisma.solution.findFirst({
        where: { id, section: { interviewerId } },
        include: { problem: true, section: { include: { interview: { include: { sections: true } } } } },
    });

    if (solution === null) {
        throw new ErrorWithStatus(tr('Solution not found'), 404);
    }

    return solution;
};

const getByIdWithFilteredSection = async (session: Session | null, id: number) =>
    session?.userRoles.interviewer ? getById(id, session.user.id) : getById(id);

const getBySectionId = async (data: GetSolutionsBySectionId) => {
    return prisma.solution.findMany({
        where: { sectionId: data.sectionId },
        include: { problem: true, section: true },
        orderBy: { position: 'asc' },
    });
};

const solutionPreviousResultToProblemUpdateData = {
    [SolutionResult.GOOD]: { solutionsGood: { decrement: 1 } },
    [SolutionResult.OK]: { solutionsOk: { decrement: 1 } },
    [SolutionResult.BAD]: { solutionsBad: { decrement: 1 } },
    [SolutionResult.UNKNOWN]: {},
};

const solutionNewResultToProblemUpdateData = {
    [SolutionResult.GOOD]: { solutionsGood: { increment: 1 } },
    [SolutionResult.OK]: { solutionsOk: { increment: 1 } },
    [SolutionResult.BAD]: { solutionsBad: { increment: 1 } },
    [SolutionResult.UNKNOWN]: {},
};

const update = async (data: UpdateSolution): Promise<Solution> => {
    const { solutionId, ...restData } = data;
    const solution = await getById(solutionId);

    if (restData.result) {
        await prisma.problem.update({
            where: { id: solution.problemId },
            data: {
                ...solutionPreviousResultToProblemUpdateData[solution.result],
                ...solutionNewResultToProblemUpdateData[restData.result],
            },
        });
    }

    return prisma.solution.update({ data: restData, where: { id: solutionId } });
};

const switchSolutionsOrder = async (data: SwitchSolutionsOrder) => {
    const { firstSolutionId, secondSolutionId } = data;

    const firstSolution = await getById(firstSolutionId);
    const secondSolution = await getById(secondSolutionId);

    return prisma.$transaction([
        prisma.solution.update({ data: { position: secondSolution.position }, where: { id: firstSolutionId } }),
        prisma.solution.update({ data: { position: firstSolution.position }, where: { id: secondSolutionId } }),
    ]);
};

const deleteSolution = async (id: number): Promise<Solution> => {
    const solution = await getById(id);

    if (solution.result !== SolutionResult.UNKNOWN) {
        await prisma.problem.update({
            where: { id: solution.problem.id },
            data: solutionPreviousResultToProblemUpdateData[solution.result],
        });
    }

    return prisma.solution.delete({ where: { id } });
};

export const solutionDbService = {
    create,
    getById,
    getByIdWithFilteredSection,
    getBySectionId,
    update,
    switchSolutionsOrder,
    delete: deleteSolution,
};
