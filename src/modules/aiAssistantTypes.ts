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

export enum AiAssistantOptionType {
    Format = 'Format',
    Topic = 'Topic',
}

export const aiAssistantSuggestionParamsSchema = z.object({
    query: z.string().optional(),
    exclude: z.array(z.string()).optional(),
});
export type AiAssistantSuggestionParams = z.infer<typeof aiAssistantSuggestionParamsSchema>;

export const aiAssistantOptionSuggestionParamsSchema = z.object({
    query: z.string().optional(),
    exclude: z.array(z.string()).optional(),
    type: z.nativeEnum(AiAssistantOptionType),
});
export type AiAssistantOptionSuggestionParams = z.infer<typeof aiAssistantOptionSuggestionParamsSchema>;

export const aiAssistantOptionSchema = z.object({
    id: z.string(),
    value: z.string(),
    type: z.string(),
});

export type AiAssistantOption = z.infer<typeof aiAssistantOptionSchema>;

export const aiAssistantUpdateDataSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    systemPrompt: z.string(),
    userPrompt: z.string(),
    options: z.array(aiAssistantOptionSchema),
});

export type AiAssistantUpdateData = z.infer<typeof aiAssistantUpdateDataSchema>;

export const createAssistantOptionSchema = z.object({
    value: z.string(),
    type: z.nativeEnum(AiAssistantOptionType),
});

export type CreateAssistantOptionData = z.infer<typeof createAssistantOptionSchema>;

export const aiAssistantSchema = z.object({
    id: z.string(),
    name: z.string(),
    systemPrompt: z.string(),
    userPrompt: z.string(),
    options: z.array(aiAssistantOptionSchema),
    createdAt: z.union([z.date(), z.string()]),
    updatedAt: z.union([z.date(), z.string()]),
});

export type AiAssistant = z.infer<typeof aiAssistantSchema>;

export const aiAssistantUpdateResultSchema = aiAssistantSchema;
export type AiAssistantUpdateResult = z.infer<typeof aiAssistantUpdateResultSchema>;
