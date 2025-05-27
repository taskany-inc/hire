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
                        options: true,
                    },
                },
            },
        });

        const assistant = appConfig?.aiAssistant;

        if (assistant && assistant.options.length) {
            const topics = assistant.options.filter((option) => option.type === AiAssistantOptionType.Topic);
            const formats = assistant.options.filter((option) => option.type === AiAssistantOptionType.Format);

            if (topics.length && formats.length) {
                const randomTopic = topics[Math.floor(Math.random() * topics.length)].value;
                const randomFormat = formats[Math.floor(Math.random() * formats.length)].value;

                const { systemPrompt, userPrompt } = assistant;

                const prompt = `${userPrompt.replace(/\{topic\}/g, randomTopic).replace(/\{format\}/g, randomFormat)}`;

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
        }

        return null;
    },

    optionSuggestion: async (params: AiAssistantOptionSuggestionParams): Promise<AiAssistantOption[]> => {
        const where: Prisma.AiAssistantOptionWhereInput = {
            type: params.type,
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
        });
        return options as AiAssistantOption[];
    },

    getAllAiAssistants: async (): Promise<AiAssistant[]> => {
        const assistants = await prisma.aiAssistant.findMany({
            include: {
                options: true,
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
                type: data.type,
            },
        });
    },
};
