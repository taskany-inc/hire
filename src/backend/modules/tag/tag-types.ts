import { z } from 'zod';

export const CreateTagSchema = z.object({ name: z.string().min(2, 'Tag is too short') });
export type CreateTag = z.infer<typeof CreateTagSchema>;
