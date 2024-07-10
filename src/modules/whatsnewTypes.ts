import { z } from 'zod';

import { languages } from '../utils/getLang';

export const checkReleaseSchema = z.object({
    locale: z.enum(languages),
});

export type CheckRelease = z.infer<typeof checkReleaseSchema>;

export const markReleaseSchema = z.object({
    version: z.string(),
});

export type MarkRelease = z.infer<typeof markReleaseSchema>;

export interface WithUserId {
    userId: number;
}
