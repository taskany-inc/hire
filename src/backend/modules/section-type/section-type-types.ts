import { HireStream, SectionType } from '@prisma/client';
import { z } from 'zod';

import { SectionGrade, customGradesArray } from '../../../utils/dictionaries';

export const getAllSectionTypesSchema = z.object({
    hireStreamId: z.number().optional(),
});
export type GetAllSectionTypes = z.infer<typeof getAllSectionTypesSchema>;

export type SectionTypeWithHireStream = SectionType & { hireStream: HireStream };

export const gradeOptionsPackages = {
    hire: [SectionGrade.HIRE],
    juniorMiddleSenior: [SectionGrade.JUNIOR, SectionGrade.MIDDLE, SectionGrade.SENIOR],
    custom: customGradesArray,
};

export const createSectionTypeSchema = z.object({
    hireStreamId: z.number(),
    value: z
        .string()
        .min(3, 'Minimum 3 characters')
        .regex(/^[A-Z_]+$/, 'Valid characters: A-Z, _'),
    title: z.string().min(3, 'Minimum 3 characters'),
    hasTasks: z.boolean(),
    userSelect: z.boolean(),
    showOtherGrades: z.boolean(),
    schedulable: z.boolean(),
    eventColor: z.string(),
    gradeOptions: z.string().array(),
});
export type CreateSectionType = z.infer<typeof createSectionTypeSchema>;

export const updateSectionTypeSchema = createSectionTypeSchema
    .omit({ hireStreamId: true })
    .merge(z.object({ sectionTypeId: z.number() }));
export type UpdateSectionType = z.infer<typeof updateSectionTypeSchema>;

export const sectionTypeQuerySchema = z.object({
    sectionTypeId: z.number(),
});
export type SectionTypeQuery = z.infer<typeof sectionTypeQuerySchema>;

export const getSectionTypeSchema = z.object({
    id: z.number().optional(),
    type: z.string().optional(),
});
export type GetSectionType = z.infer<typeof getSectionTypeSchema>;
