import { z } from 'zod';

export const createSessionPayloadScheme = z.object({ title: z.string() });

export const createSessionResponseScheme = z.object({
    createdAt: z.date(),
    id: z.string(),
    updatedAt: z.date(),
    active: z.boolean().nullable(),
    ownerId: z.string().nullable(),
    roomId: z.string(),
    document: z.object({
        id: z.string(),
        title: z.string(),
        created_at: z.date(),
        updated_at: z.date(),
        editable: z.boolean(),
        data: z.any().nullable(),
    }),
    room: z.object({
        createdAt: z.date(),
        id: z.string(),
        updatedAt: z.date(),
        ownerId: z.string().nullable(),
        documentId: z.string(),
    }),
});

export interface CreateSession {
    payload: z.infer<typeof createSessionPayloadScheme>;
    response: z.infer<typeof createSessionResponseScheme>;
}
