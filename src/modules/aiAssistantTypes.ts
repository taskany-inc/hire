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

export const aiAssistantItemSchema = z.object({
    id: z.string(),
    value: z.string(),
});
export type AiAssistantItem = z.infer<typeof aiAssistantItemSchema>;

export const aiAssistantSuggestionParamsSchema = z.object({
    query: z.string().optional(),
    exclude: z.array(z.string()).optional(),
});
export type AiAssistantSuggestionParams = z.infer<typeof aiAssistantSuggestionParamsSchema>;

export const aiAssistantUpdateDataSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, { message: 'Name is required' }),
    systemPrompt: z.string(),
    userPrompt: z.string(),
    topics: z.array(aiAssistantItemSchema),
    formats: z.array(aiAssistantItemSchema),
});

export type AiAssistantUpdateData = z.infer<typeof aiAssistantUpdateDataSchema>;

export const aiAssistantSchema = z.object({
    id: z.string(),
    name: z.string(),
    systemPrompt: z.string(),
    userPrompt: z.string(),
    topics: z.array(aiAssistantItemSchema),
    formats: z.array(aiAssistantItemSchema),
    createdAt: z.union([z.date(), z.string()]),
    updatedAt: z.union([z.date(), z.string()]),
});

export type AiAssistant = z.infer<typeof aiAssistantSchema>;

export const aiAssistantUpdateResultSchema = aiAssistantSchema;
export type AiAssistantUpdateResult = z.infer<typeof aiAssistantUpdateResultSchema>;
