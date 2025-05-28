import { z } from 'zod';

import { protectedProcedure, router } from '../trpcBackend';
import { aiAssistantMethods } from '../../modules/aiAssistantMethods';
import {
    aiAssistantUpdateDataSchema,
    createAssistantOptionSchema,
    createAssistantOptionTypeSchema,
    updateAssistantOptionTypeSchema,
    aiAssistantOptionSuggestionParamsSchema,
    assistantAnswerRequestSchema,
} from '../../modules/aiAssistantTypes';
import { accessMiddlewares } from '../../modules/accessMiddlewares';

export const aiAssistantRouter = router({
    getAssistantAnswer: protectedProcedure
        .input(assistantAnswerRequestSchema)
        .use(accessMiddlewares.aiAssistant.update)
        .mutation(async ({ input }) => {
            return aiAssistantMethods.getAssistantAnswer(input.systemPrompt, input.userPrompt, input.options);
        }),

    getSheepPhrase: protectedProcedure.input(z.void()).query(async () => {
        return aiAssistantMethods.getSheepPhrase();
    }),

    getSheepUser: protectedProcedure.input(z.void()).query(async () => {
        return aiAssistantMethods.getSheepUser();
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

    getAllOptionTypes: protectedProcedure
        .input(z.void())
        .use(accessMiddlewares.aiAssistant.update)
        .query(async () => {
            return aiAssistantMethods.getAllOptionTypes();
        }),

    createOptionType: protectedProcedure
        .input(createAssistantOptionTypeSchema)
        .use(accessMiddlewares.aiAssistant.update)
        .mutation(async ({ input }) => {
            return aiAssistantMethods.createOptionType(input);
        }),

    updateOptionType: protectedProcedure
        .input(updateAssistantOptionTypeSchema)
        .use(accessMiddlewares.aiAssistant.update)
        .mutation(async ({ input }) => {
            return aiAssistantMethods.updateOptionType(input);
        }),

    deleteOptionType: protectedProcedure
        .input(z.string())
        .use(accessMiddlewares.aiAssistant.update)
        .mutation(async ({ input }) => {
            return aiAssistantMethods.deleteOptionType(input);
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
