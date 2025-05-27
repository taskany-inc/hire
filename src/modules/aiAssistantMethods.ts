import { v4 as uuidv4 } from 'uuid';
import pdfParse from 'pdf-parse';
import { Prisma } from '@prisma/client';

import config from '../config';
import { tryGetAsyncValue } from '../utils/tryGetAsyncValue';
import { safelyParseJson } from '../utils/safeParseJson';
import { prisma } from '../utils/prisma';

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
    parseCv: async (file: Buffer): Promise<CvParsingResult | undefined> => {
        const { apiUrl, model, cvParsePrompt } = getConfigValues();
        const token = await getToken();
        if (!token) return;
        const parsedPdf = await pdfParse(file);
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
                    messages: [
                        {
                            role: 'user',
                            content: `${cvParsePrompt}\n${parsedPdf.text}`,
                        },
                    ],
                }),
            }).catch((error) => {
                throw error;
            }),
        );
        if (!response?.ok) return;
        const json = await response.json();
        const content = safelyParseJson(json.choices?.[0]?.message?.content);
        const validatedAssistantResponse = cvParsingResultSchema.safeParse(content);
        return validatedAssistantResponse.success ? validatedAssistantResponse.data : undefined;
    },

    getSheepPhrase: async () => {
        const { apiUrl, model } = getConfigValues();
        const token = await getToken();
        if (!token) return;

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

        if (assistant && assistant.options.length) {
            const { systemPrompt, userPrompt } = assistant;

            // Group options by their type key
            const optionsByTypeKey = assistant.options.reduce((acc, option) => {
                const { key } = option.optionType;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(option);
                return acc;
            }, {} as Record<string, typeof assistant.options>);

            // Replace all placeholders in userPrompt
            let prompt = userPrompt;
            for (const [key, options] of Object.entries(optionsByTypeKey)) {
                if (options.length > 0) {
                    const randomOption = options[Math.floor(Math.random() * options.length)];
                    const placeholder = `{${key}}`;
                    prompt = prompt.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), randomOption.value);
                }
            }

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
                        messages: [
                            {
                                role: 'system',
                                content: systemPrompt,
                            },
                            {
                                role: 'user',
                                content: prompt,
                            },
                        ],
                        temperature: 0.8,
                        repetition_penalty: 0.8,
                    }),
                }).catch((error) => {
                    throw error;
                }),
            );
            if (!response?.ok) return;
            const json = await response.json();
            const rawResponse = json.choices?.[0]?.message?.content?.trim();

            return rawResponse?.replace(/^['"«"']|['"»"']$/g, '');
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
};
