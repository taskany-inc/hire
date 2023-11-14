import { z } from 'zod';

export const createAttachSchema = z.object({
    filename: z.string(),
    link: z.string(),
    sectionId: z.number(),
});
export type CreateAttach = z.infer<typeof createAttachSchema>;
