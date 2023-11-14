import { z } from 'zod';

export const externalUserSearchSchema = z.object({
    search: z.string().optional(),
});
export type ExternalUserSearch = z.infer<typeof externalUserSearchSchema>;
