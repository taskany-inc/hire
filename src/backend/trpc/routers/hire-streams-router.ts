import { accessMiddlewares } from '../../access/access-middlewares';
import { hireStreamDbService } from '../../modules/hire-streams/hire-stream-db-service';
import {
    createHireStreamSchema,
    hireStreamNameSchema,
    hireStreamQuerySchema,
} from '../../modules/hire-streams/hire-stream-types';
import { protectedProcedure, router } from '../trpc-back';

export const hireStreamsRouter = router({
    getById: protectedProcedure
        .input(hireStreamQuerySchema)
        .use(accessMiddlewares.hireStream.read)
        .query(({ input }) => {
            return hireStreamDbService.getById(input.hireStreamId);
        }),

    getByName: protectedProcedure
        .input(hireStreamNameSchema)
        .use(accessMiddlewares.hireStream.read)
        .query(({ input }) => {
            return hireStreamDbService.getByName(input.hireStreamName);
        }),

    getAll: protectedProcedure.use(accessMiddlewares.hireStream.read).query(hireStreamDbService.getAll),

    getAllowed: protectedProcedure.use(accessMiddlewares.hireStream.read).query(({ ctx }) => {
        return hireStreamDbService.getAllowed(ctx.session);
    }),

    create: protectedProcedure
        .input(createHireStreamSchema)
        .use(accessMiddlewares.hireStream.create)
        .mutation(({ input, ctx }) => {
            return hireStreamDbService.create(input, ctx.session.user.id);
        }),
});
