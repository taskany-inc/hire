import { accessMiddlewares } from '../../modules/accessMiddlewares';
import { commentMethods } from '../../modules/commentMethods';
import { createCommentSchema, deleteCommentSchema, editCommentSchema } from '../../modules/commentTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const commentRouter = router({
    create: protectedProcedure
        .input(createCommentSchema)
        .use(accessMiddlewares.comment.create)
        .mutation(({ input }) => {
            return commentMethods.createComment(input);
        }),

    edit: protectedProcedure
        .input(editCommentSchema)
        .use(accessMiddlewares.comment.updateOrDelete)
        .mutation(({ input }) => {
            return commentMethods.updateComment(input);
        }),

    delete: protectedProcedure
        .input(deleteCommentSchema)
        .use(accessMiddlewares.comment.updateOrDelete)
        .mutation(({ input }) => {
            return commentMethods.deleteComment(input);
        }),
});
