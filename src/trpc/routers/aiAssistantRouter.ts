import { z } from 'zod';

import { protectedProcedure, router } from '../trpcBackend';
import { aiAssistantMethods } from '../../modules/aiAssistantMethods';
import { aiAssistantSuggestionParamsSchema, aiAssistantUpdateDataSchema } from '../../modules/aiAssistantTypes';
import { accessMiddlewares } from '../../modules/accessMiddlewares';

export const aiAssistantRouter = router({
    getSheepPhrase: protectedProcedure.input(z.void()).query(async () => {
        return aiAssistantMethods.getSheepPhrase();
    }),

    topicSuggestion: protectedProcedure.input(aiAssistantSuggestionParamsSchema).query(async ({ input }) => {
        return aiAssistantMethods.topicSuggestion(input);
    }),

    formatSuggestion: protectedProcedure.input(aiAssistantSuggestionParamsSchema).query(async ({ input }) => {
        return aiAssistantMethods.formatSuggestion(input);
    }),

    createTopic: protectedProcedure
        .input(z.object({ value: z.string() }))
        .use(accessMiddlewares.aiAssistant.update)
        .mutation(async ({ input }) => {
            return aiAssistantMethods.createTopic(input.value);
        }),

    createFormat: protectedProcedure
        .input(z.object({ value: z.string() }))
        .use(accessMiddlewares.aiAssistant.update)
        .mutation(async ({ input }) => {
            return aiAssistantMethods.createFormat(input.value);
        }),

    getAllAiAssistants: protectedProcedure
        .input(z.void())
        .use(accessMiddlewares.aiAssistant.update)
        .query(async () => {
            return aiAssistantMethods.getAllAiAssistants();
        }),

    updateAiAssistant: protectedProcedure
        .input(aiAssistantUpdateDataSchema)
        .use(accessMiddlewares.aiAssistant.update)
        .mutation(async ({ input }) => {
            return aiAssistantMethods.updateAiAssistant(input);
        }),

    deleteAiAssistant: protectedProcedure
        .input(z.string())
        .use(accessMiddlewares.aiAssistant.update)
        .mutation(async ({ input }) => {
            return aiAssistantMethods.deleteAiAssistant(input);
        }),
});
