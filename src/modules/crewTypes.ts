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
        name: string | null;
        id: string;
        email: string;
    };
    hiringManager: {
        name: string | null;
        id: string;
        email: string;
    };
    status: VacancyStatus;
    unit: number | null;
    grade: number | null;

    activeSince: Date | null;
    timeAtWork: number;
}

export const getVacancyListSchema = z.object({
    search: z.string().optional(),
    archived: z.boolean().optional(),
    hireStreamIds: z.array(z.string()).optional(),
    searchByTeam: z.string().optional(),
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
