import { z } from 'zod';

import { tr } from './modules.i18n';

export const CreateTagSchema = z.object({ name: z.string().min(2, tr('Tag is too short')) });
export type CreateTag = z.infer<typeof CreateTagSchema>;
