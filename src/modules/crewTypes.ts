import { z } from 'zod';

import { TagPaletteColor } from '../utils/tagPalette';

export enum VacancyStatus {
    ACTIVE = 'ACTIVE',
    ON_HOLD = 'ON_HOLD',
    CLOSED = 'CLOSED',
    ON_CONFIRMATION = 'ON_CONFIRMATION',
}

export const vacancyLabels: Record<VacancyStatus, string> = {
    [VacancyStatus.ACTIVE]: 'Active',
    [VacancyStatus.ON_HOLD]: 'Hold',
    [VacancyStatus.CLOSED]: 'Closed',
    [VacancyStatus.ON_CONFIRMATION]: 'Confirmation',
};

export const vacancyStatusColors: Record<VacancyStatus, string> = {
    [VacancyStatus.ACTIVE]: TagPaletteColor.BLUE,
    [VacancyStatus.ON_HOLD]: TagPaletteColor.CYAN,
    [VacancyStatus.CLOSED]: TagPaletteColor.MAGENTA,
    [VacancyStatus.ON_CONFIRMATION]: TagPaletteColor.GREEN,
};

export interface Vacancy {
    id: string;
    name: string;
    hireStreamId: string;
    archived: boolean;
    group: {
        name: string;
        id: string;
    };
    hr: {
        name?: string;
        id: string;
        email: string;
    };
    hiringManager: {
        name?: string;
        id: string;
        email: string;
    };
    status: VacancyStatus;
    unit?: number;
    grade?: number;

    closedAt?: Date;

    activeSince?: Date;
    timeAtWork: number;
}

export const getVacancyListSchema = z.object({
    search: z.string().optional(),
    archived: z.boolean().optional(),
    hireStreamIds: z.array(z.number()).optional(),
    statuses: z.array(z.nativeEnum(VacancyStatus)).optional(),
    hiringManagerEmails: z.array(z.string()).optional(),
    hrEmails: z.array(z.string()).optional(),
    teamIds: z.array(z.string()).optional(),
    closedAt: z.object({ startDate: z.string().datetime(), endDate: z.string().datetime() }).optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    cursor: z.number().optional(), // for infinite queries
});
export type GetVacancyList = z.infer<typeof getVacancyListSchema>;

export const editVacancySchema = z.object({
    id: z.string(),
    unit: z.number().optional(),
    status: z.nativeEnum(VacancyStatus).optional(),
});
export type EditVacancy = z.infer<typeof editVacancySchema>;

export interface Group {
    id: string;
    name: string;
    description?: string;
}

export const getGroupListSchema = z.object({
    search: z.string().optional(),
    filter: z.array(z.string()).optional(),
    take: z.number().optional(),
});

export type GetGroupList = z.infer<typeof getGroupListSchema>;

export const getAchievementsSchema = z.object({
    search: z.string().optional(),
    take: z.number().optional(),
});
export type GetAchievements = z.infer<typeof getAchievementsSchema>;

export const giveAchievementSchema = z.object({
    targetUserEmail: z.string(),
    actingUserEmail: z.string(),
    achievementId: z.string(),
    amount: z.number().optional(),
});
export type GiveAchievement = z.infer<typeof giveAchievementSchema>;

export interface Achievement {
    id: string;
    title: string;
    icon: string;
    description: string;
}

export interface CrewUserNameAndEmail {
    id: string;
    name: string;
    email: string;
}

interface UserAchievement {
    count: number;
    achievement: Achievement;
}

export interface CrewUser {
    id: string;
    active: boolean;
    email: string;
    achievements: UserAchievement[];
    name?: string;
    emailVerified?: Date;
    image?: string;
    organizationUnitId?: string;
    supervisorId?: string;
    title?: string;
    deactivatedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CrewUserShort {
    id: string;
    name?: string | null;
    login?: string | null;
    email: string;
    active: boolean;
    supervisorId?: string;
}
