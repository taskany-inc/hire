import { v4 as uuidv4 } from 'uuid';
import pdfParse from 'pdf-parse';
import { Prisma } from '@prisma/client';

import config from '../config';
import { tryGetAsyncValue } from '../utils/tryGetAsyncValue';
import { safelyParseJson } from '../utils/safeParseJson';
import { prisma } from '../utils/prisma';
import { getSheep } from '../utils/sheep';

import {
    CvParsingResult,
    cvParsingResultSchema,
    AiAssistantUpdateData,
    AiAssistantUpdateResult,
    AiAssistantOption,
    AiAssistant,
    AiAssistantOptionType,
    CreateAssistantOptionData,
    CreateAssistantOptionTypeData,
    UpdateAssistantOptionTypeData,
    AiAssistantOptionSuggestionParams,
    CompletionsRequest,
} from './aiAssistantTypes';

const getConfigValues = () => {
    Object.values(config.aiAssistant).forEach((v) => {
        if (!v) throw new Error('Ai assistant is not configured');
    });
    return { ...config.aiAssistant } as Record<keyof typeof config.aiAssistant, string>;
};

const getToken = async () => {
    const { authUrl, authHeader, authScope } = getConfigValues();
    const response = await tryGetAsyncValue(() =>
        fetch(authUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
                RqUID: uuidv4(),
                Authorization: `Basic ${authHeader}`,
            },
            body: authScope,
        }),
    );
    if (!response?.ok) return;
    const json = await response.json();
    if (typeof json.access_token === 'string') {
        return json.access_token;
    }
};

export const aiAssistantMethods = {
    completions: async (request: CompletionsRequest): Promise<string | undefined> => {
        const { apiUrl, model } = getConfigValues();
        const token = await getToken();
        if (!token) return;

        const messages: Array<{ role: string; content: string }> = [];

        if (request.systemPrompt) {
            messages.push({
                role: 'system',
                content: request.systemPrompt,
            });
        }

        messages.push({
            role: 'user',
            content: request.userPrompt,
        });

        const response = await tryGetAsyncValue(() =>
            fetch(`${apiUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    model,
                    messages,
                    temperature: request.temperature,
                    repetition_penalty: request.repetition_penalty,
                }),
            }).catch((error) => {
                throw error;
            }),
        );

        if (!response?.ok) return;
        const json = await response.json();
        return json.choices?.[0]?.message?.content?.trim();
    },

    parseCv: async (file: Buffer): Promise<CvParsingResult | undefined> => {
        const { cvParsePrompt } = getConfigValues();
        const parsedPdf = await pdfParse(file);

        const response = await aiAssistantMethods.completions({
            userPrompt: `${cvParsePrompt}\n${parsedPdf.text}`,
            temperature: 0.8,
            repetition_penalty: 0.8,
        });

        if (!response) return;

        const content = safelyParseJson(response);
        const validatedAssistantResponse = cvParsingResultSchema.safeParse(content);
        return validatedAssistantResponse.success ? validatedAssistantResponse.data : undefined;
    },

    getAssistantAnswer: async (
        systemPrompt: string,
        userPrompt: string,
        options: AiAssistantOption[],
    ): Promise<string> => {
        // Group options by their type key
        const optionsByTypeKey = options.reduce((acc, option) => {
            if (option.optionType) {
                const { key } = option.optionType;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(option);
            }
            return acc;
        }, {} as Record<string, typeof options>);

        // Replace all placeholders in userPrompt
        let prompt = userPrompt;
        for (const [key, typeOptions] of Object.entries(optionsByTypeKey)) {
            if (typeOptions.length > 0) {
                const randomOption = typeOptions[Math.floor(Math.random() * typeOptions.length)];
                const placeholder = `{${key}}`;
                prompt = prompt.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), randomOption.value);
            }
        }

        console.log('prompt', prompt);

        const response = await aiAssistantMethods.completions({
            systemPrompt,
            userPrompt: prompt,
            temperature: 0.8,
            repetition_penalty: 0.8,
        });

        return response || '';
    },

    getSheepPhrase: async (): Promise<string | null> => {
        const appConfig = await prisma.appConfig.findFirst({
            include: {
                aiAssistant: {
                    include: {
                        options: {
                            include: {
                                optionType: true,
                            },
                        },
                    },
                },
            },
        });

        const assistant = appConfig?.aiAssistant;

        if (assistant) {
            const { systemPrompt, userPrompt } = assistant;
            const response = await aiAssistantMethods.getAssistantAnswer(systemPrompt, userPrompt, assistant.options);

            if (!response) return null;

            return response.replace(/^['"«"']|['"»"']$/g, '');
        }

        return null;
    },

    optionSuggestion: async (params: AiAssistantOptionSuggestionParams): Promise<AiAssistantOption[]> => {
        const where: Prisma.AiAssistantOptionWhereInput = {
            optionTypeId: params.optionTypeId,
        };

        if (params.query) {
            where.value = { contains: params.query, mode: Prisma.QueryMode.insensitive };
        }

        if (params.exclude && params.exclude.length > 0) {
            where.id = { notIn: params.exclude };
        }

        const options = await prisma.aiAssistantOption.findMany({
            where,
            take: 20,
            include: {
                optionType: true,
            },
        });
        return options as AiAssistantOption[];
    },

    getAllAiAssistants: async (): Promise<AiAssistant[]> => {
        const assistants = await prisma.aiAssistant.findMany({
            include: {
                options: {
                    include: {
                        optionType: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        return assistants;
    },

    deleteAiAssistant: async (id: string) => {
        await prisma.aiAssistant.delete({
            where: { id },
        });
    },

    updateAiAssistant: async (data: AiAssistantUpdateData): Promise<AiAssistantUpdateResult> => {
        const config = await prisma.appConfig.findFirst({
            include: { aiAssistant: true },
        });

        if (!config) {
            throw new Error('App configuration not found');
        }

        if (data.id) {
            return prisma.aiAssistant.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    systemPrompt: data.systemPrompt,
                    userPrompt: data.userPrompt,
                    options: {
                        set: data.options.map((option) => ({ id: option.id })),
                    },
                },
                include: { options: true },
            });
        }

        const newAssistant = await prisma.aiAssistant.create({
            data: {
                name: data.name,
                systemPrompt: data.systemPrompt,
                userPrompt: data.userPrompt,
                options: {
                    connect: data.options.map((option) => ({ id: option.id })),
                },
            },
            include: { options: true },
        });

        await prisma.appConfig.update({
            where: { id: config.id },
            data: { aiAssistantId: newAssistant.id },
        });

        return newAssistant;
    },

    createAssistantOption: async (data: CreateAssistantOptionData): Promise<AiAssistantOption> => {
        return prisma.aiAssistantOption.create({
            data: {
                value: data.value,
                optionTypeId: data.optionTypeId,
            },
            include: {
                optionType: true,
            },
        });
    },

    getAllOptionTypes: async (): Promise<AiAssistantOptionType[]> => {
        return prisma.aiAssistantOptionType.findMany({
            orderBy: {
                createdAt: 'asc',
            },
        });
    },

    createOptionType: async (data: CreateAssistantOptionTypeData): Promise<AiAssistantOptionType> => {
        return prisma.aiAssistantOptionType.create({
            data: {
                key: data.key,
                name: data.name,
                description: data.description,
            },
        });
    },

    updateOptionType: async (data: UpdateAssistantOptionTypeData): Promise<AiAssistantOptionType> => {
        return prisma.aiAssistantOptionType.update({
            where: { id: data.id },
            data: {
                name: data.name,
                description: data.description,
            },
        });
    },

    deleteOptionType: async (id: string): Promise<void> => {
        await prisma.aiAssistantOptionType.delete({
            where: { id },
        });
    },

    getSheepUser: async () => {
        return getSheep();
    },
};
