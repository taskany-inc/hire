import { z } from 'zod';

const technologiesArray = z.array(z.string());
const technologiesRecord = z.record(z.string(), technologiesArray);

export const cvParsingResultSchema = z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    technologies: z
        .union([
            technologiesArray,
            technologiesRecord,
            z.record(z.string(), z.union([technologiesArray, technologiesRecord])),
        ])
        .optional(),
});
export type CvParsingResult = z.infer<typeof cvParsingResultSchema>;

export const aiAssistantOptionTypeSchema = z.object({
    id: z.string(),
    name: z.string(),
    key: z.string(),
    description: z.string().nullable(),
    createdAt: z.union([z.date(), z.string()]),
    updatedAt: z.union([z.date(), z.string()]),
});

export type AiAssistantOptionType = z.infer<typeof aiAssistantOptionTypeSchema>;

export const aiAssistantSuggestionParamsSchema = z.object({
    query: z.string().optional(),
    exclude: z.array(z.string()).optional(),
});
export type AiAssistantSuggestionParams = z.infer<typeof aiAssistantSuggestionParamsSchema>;

export const aiAssistantOptionSuggestionParamsSchema = z.object({
    query: z.string().optional(),
    exclude: z.array(z.string()).optional(),
    optionTypeId: z.string(),
});
export type AiAssistantOptionSuggestionParams = z.infer<typeof aiAssistantOptionSuggestionParamsSchema>;

export const aiAssistantOptionSchema = z.object({
    id: z.string(),
    value: z.string(),
    optionTypeId: z.string(),
    optionType: aiAssistantOptionTypeSchema,
    createdAt: z.union([z.date(), z.string()]),
    updatedAt: z.union([z.date(), z.string()]),
});

export type AiAssistantOption = z.infer<typeof aiAssistantOptionSchema>;

export const aiAssistantUpdateDataSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    systemPrompt: z.string(),
    userPrompt: z.string(),
    temperature: z.number().min(0).max(2).default(0.8),
    repetitionPenalty: z.number().min(0).max(2).default(0.8),
    options: z.array(aiAssistantOptionSchema),
});

export type AiAssistantUpdateData = z.infer<typeof aiAssistantUpdateDataSchema>;

export const createAssistantOptionSchema = z.object({
    value: z.string(),
    optionTypeId: z.string(),
});

export type CreateAssistantOptionData = z.infer<typeof createAssistantOptionSchema>;

export const createAssistantOptionTypeSchema = z.object({
    name: z.string(),
    key: z.string(),
    description: z.string().optional(),
});

export type CreateAssistantOptionTypeData = z.infer<typeof createAssistantOptionTypeSchema>;

export const updateAssistantOptionTypeSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
});

export type UpdateAssistantOptionTypeData = z.infer<typeof updateAssistantOptionTypeSchema>;

export const aiAssistantSchema = z.object({
    id: z.string(),
    name: z.string(),
    systemPrompt: z.string(),
    userPrompt: z.string(),
    temperature: z.number().min(0).max(2).default(0.8),
    repetitionPenalty: z.number().min(0).max(2).default(0.8),
    options: z.array(aiAssistantOptionSchema),
    createdAt: z.union([z.date(), z.string()]),
    updatedAt: z.union([z.date(), z.string()]),
});

export type AiAssistant = z.infer<typeof aiAssistantSchema>;

export const aiAssistantUpdateResultSchema = aiAssistantSchema;
export type AiAssistantUpdateResult = z.infer<typeof aiAssistantUpdateResultSchema>;

export const completionsRequestSchema = z.object({
    systemPrompt: z.string().optional(),
    userPrompt: z.string(),
    // eslint-disable-next-line newline-per-chained-call
    temperature: z.number().min(0).max(2).optional().default(0.8),
    // eslint-disable-next-line newline-per-chained-call
    repetition_penalty: z.number().min(0).max(2).optional().default(0.8),
});

export type CompletionsRequest = z.infer<typeof completionsRequestSchema>;

export const assistantAnswerRequestSchema = z.object({
    systemPrompt: z.string(),
    userPrompt: z.string(),
    options: z.array(aiAssistantOptionSchema),
});

export type AssistantAnswerRequest = z.infer<typeof assistantAnswerRequestSchema>;
