import { SectionType, User } from '@prisma/client';
import { z } from 'zod';

import { UserRoles } from '../utils/userRoles';

export const getUsersByHireStreamIdSchema = z.object({
    hireStreamId: z.number(),
});
export type GetUsersByHireStreamId = z.infer<typeof getUsersByHireStreamIdSchema>;

export const hireStreamIdAndUserIdSchema = z.object({
    hireStreamId: z.number(),
    userId: z.number(),
});
export type HireStreamIdAndUserId = z.infer<typeof hireStreamIdAndUserIdSchema>;

export const hireStreamIdAndSectionTypeIdAndUserIdSchema = z.object({
    hireStreamId: z.number(),
    sectionTypeId: z.number(),
    userId: z.number(),
});
export type HireStreamIdAndSectionTypeAndUserId = z.infer<typeof hireStreamIdAndSectionTypeIdAndUserIdSchema>;

export type HireStreamUsersWithRoles = {
    [UserRoles.HIRE_STREAM_MANAGER]: User[];
    [UserRoles.HIRING_LEAD]: User[];
    [UserRoles.RECRUITER]: User[];
    [UserRoles.INTERVIEWER]: { sectionType: SectionType; users: User[] }[];
};

export const addAndRemoveProblemEditorRoleSchema = z.object({
    userId: z.number(),
});
export type AddAndRemoveProblemEditorRole = z.infer<typeof addAndRemoveProblemEditorRoleSchema>;

export const getHireStreamRecruitersSchema = z.object({
    id: z.number(),
    search: z.string().optional(),
    take: z.number().optional(),
});
export type GetHireStreamRecruiters = z.infer<typeof getHireStreamRecruitersSchema>;
