import { FilterEntity } from '@prisma/client';
import { z } from 'zod';

export const getDefaultFilterSchema = z.object({
    entity: z.nativeEnum(FilterEntity),
});

export type GetDefaultFilter = z.infer<typeof getDefaultFilterSchema>;
