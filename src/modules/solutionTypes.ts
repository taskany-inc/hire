import { Problem, SolutionResult } from '@prisma/client';
import { z } from 'zod';

import { ExtractPrismaTypeFromArray } from '../utils/types';

import { solutionMethods } from './solutionMethods';

export const solutionIdQuerySchema = z.object({
    solutionId: z.number(),
});
export type SolutionIdQuery = z.infer<typeof solutionIdQuerySchema>;

export const createSolutionSchema = z.object({
    answer: z.string().nullish(),
    result: z.nativeEnum(SolutionResult).optional(),
    problemId: z.number(),
    sectionId: z.number(),
});
export type CreateSolution = z.infer<typeof createSolutionSchema>;

export const getSolutionsBySectionIdSchema = z.object({
    sectionId: z.number(),
});
export type GetSolutionsBySectionId = z.infer<typeof getSolutionsBySectionIdSchema>;

export const updateSolutionSchema = z.object({
    solutionId: z.number(),
    answer: z.string().nullish(),
    result: z.nativeEnum(SolutionResult).optional(),
    position: z.number().optional(),
});
export type UpdateSolution = z.infer<typeof updateSolutionSchema>;

export type SolutionWithRelations = ExtractPrismaTypeFromArray<typeof solutionMethods.getBySectionId>;

export const switchSolutionsOrderSchema = z.object({
    sectionId: z.number(),
    firstSolutionId: z.number(),
    secondSolutionId: z.number(),
});
export type SwitchSolutionsOrder = z.infer<typeof switchSolutionsOrderSchema>;

export interface SolutionProblem {
    problem: Problem;
}
