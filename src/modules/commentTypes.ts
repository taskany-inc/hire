import { z } from 'zod';
import { User, Comment } from '@prisma/client';

import { tr } from './modules.i18n';

export const commentSchema = z.object({
    text: z
        .string({
            required_error: tr("Comments's description is required"),
            invalid_type_error: tr("Comments's description must be a string"),
        })
        .min(1, {
            message: tr("Comments's description must be longer than 1 symbol"),
        }),
    attachIds: z.string().array().optional(),
});

export type CommentSchema = z.infer<typeof commentSchema>;

export const createCommentSchema = commentSchema.extend({
    userId: z.number(),
    target: z.union([z.object({ problemId: z.number() }), z.object({ interviewId: z.number() })]),
    attachIds: z.string().array().optional(),
});

export type CreateComment = z.infer<typeof createCommentSchema>;

export const editCommentSchema = commentSchema.extend({
    id: z.string(),
    attachIds: z.string().array().optional(),
});

export type EditComment = z.infer<typeof editCommentSchema>;

export const deleteCommentSchema = z.object({
    id: z.string(),
    attachIds: z.string().array().optional(),
});

export type DeleteComment = z.infer<typeof deleteCommentSchema>;

export type CommentWithUser = Comment & {
    user: User;
};
