import { z } from 'zod';

import { languages } from '../utils/getLang';

export const checkReleaseSchema = z.object({
    locale: z.enum(languages),
});

export type CheckRelease = z.infer<typeof checkReleaseSchema>;

export interface CheckWhatsnew extends CheckRelease {
    userSettingId?: string;
}

export const markReleaseSchema = z.object({
    version: z.string(),
    userSettingId: z.string().optional(),
});

export type MarkRelease = z.infer<typeof markReleaseSchema>;
