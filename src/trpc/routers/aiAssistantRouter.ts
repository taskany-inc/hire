import { z } from 'zod';

import { protectedProcedure, router } from '../trpcBackend';
import { aiAssistantMethods } from '../../modules/aiAssistantMethods';
import {
    aiAssistantUpdateDataSchema,
    createAssistantOptionSchema,
    aiAssistantOptionSuggestionParamsSchema,
} from '../../modules/aiAssistantTypes';
import { accessMiddlewares } from '../../modules/accessMiddlewares';

export const aiAssistantRouter = router({
    getSheepPhrase: protectedProcedure.input(z.void()).query(async () => {
        return aiAssistantMethods.getSheepPhrase();
    }),

    createAssistantOption: protectedProcedure
        .input(createAssistantOptionSchema)
        .use(accessMiddlewares.aiAssistant.update)
        .mutation(async ({ input }) => {
            return aiAssistantMethods.createAssistantOption(input);
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

    optionSuggestion: protectedProcedure.input(aiAssistantOptionSuggestionParamsSchema).query(async ({ input }) => {
        return aiAssistantMethods.optionSuggestion(input);
    }),
});
