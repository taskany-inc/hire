import { protectedProcedure, router } from '../trpcBackend';
import { createFeedbackSchema } from '../../modules/feedbackTypes';

export const feedbackRouter = router({
    create: protectedProcedure
        .input(createFeedbackSchema)
        .mutation(async ({ ctx, input: { title, description, href } }) => {
            if (!process.env.FEEDBACK_URL) {
                return;
            }
            const { id, name, email } = ctx.session.user;
            const userAgent = ctx.headers['user-agent'];
            const res = await fetch(process.env.FEEDBACK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    href,
                    userAgent,
                    name,
                    email,
                    id,
                }),
            });
            return res;
        }),
});
