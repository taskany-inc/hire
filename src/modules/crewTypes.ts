import { z } from 'zod';

import { TagPaletteColor } from '../utils/tagPalette';

enum VacancyStatus {
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
}

export const getVacancyListSchema = z.object({
    hireStreamIds: z.array(z.string()).optional(),
    searchByTeam: z.string().optional(),
    status: z.nativeEnum(VacancyStatus).optional(),
    archived: z.boolean().optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    cursor: z.number().optional(),
});
export type GetVacancyList = z.infer<typeof getVacancyListSchema>;
