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
    AiAssistantSuggestionParams,
    AiAssistantUpdateResult,
    AiAssistantItem,
    AiAssistant,
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
                        topics: true,
                        formats: true,
                    },
                },
            },
        });

        const assistant = appConfig?.aiAssistant;

        if (assistant && assistant.topics.length && assistant.formats.length) {
            const randomTopic = assistant.topics[Math.floor(Math.random() * assistant.topics.length)].value;
            const randomFormat = assistant.formats[Math.floor(Math.random() * assistant.formats.length)].value;

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
                        temperature: 0.9,
                        presence_penalty: 0.8,
                        frequency_penalty: 0.8,
                    }),
                }).catch((error) => {
                    throw error;
                }),
            );
            if (!response?.ok) return;
            const json = await response.json();
            const rawResponse = json.choices?.[0]?.message?.content?.trim();

            console.log(rawResponse);

            return rawResponse?.replace(/^['"«"']|['"»"']$/g, '');
        }

        return null;
    },

    topicSuggestion: async (params: AiAssistantSuggestionParams): Promise<AiAssistantItem[]> => {
        const where: Prisma.AiAssistantTopicWhereInput = {};

        if (params.query) {
            where.value = { contains: params.query, mode: Prisma.QueryMode.insensitive };
        }

        if (params.exclude && params.exclude.length > 0) {
            where.id = { notIn: params.exclude };
        }

        const topics = await prisma.aiAssistantTopic.findMany({
            where,
            take: 20,
        });
        return topics as AiAssistantItem[];
    },

    formatSuggestion: async (params: AiAssistantSuggestionParams): Promise<AiAssistantItem[]> => {
        const where: Prisma.AiAssistantFormatWhereInput = {};

        if (params.query) {
            where.value = { contains: params.query, mode: Prisma.QueryMode.insensitive };
        }

        if (params.exclude && params.exclude.length > 0) {
            where.id = { notIn: params.exclude };
        }

        const formats = await prisma.aiAssistantFormat.findMany({
            where,
            take: 20,
        });
        return formats as AiAssistantItem[];
    },

    getAllAiAssistants: async (): Promise<AiAssistant[]> => {
        const assistants = await prisma.aiAssistant.findMany({
            include: {
                topics: true,
                formats: true,
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
            const assistant = await prisma.aiAssistant.findUnique({
                where: { id: data.id },
                include: {
                    topics: true,
                    formats: true,
                },
            });

            if (!assistant) {
                throw new Error('AI assistant not found');
            }

            const currentTopicIds = assistant.topics.map((t) => t.id);
            const newTopicIds = data.topics.map((t) => t.id);

            const topicIdsToConnect = newTopicIds.filter((id) => !currentTopicIds.includes(id));
            const topicIdsToDisconnect = currentTopicIds.filter((id) => !newTopicIds.includes(id));

            const currentFormatIds = assistant.formats.map((f) => f.id);
            const newFormatIds = data.formats.map((f) => f.id);

            const formatIdsToConnect = newFormatIds.filter((id) => !currentFormatIds.includes(id));
            const formatIdsToDisconnect = currentFormatIds.filter((id) => !newFormatIds.includes(id));

            return prisma.aiAssistant.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    systemPrompt: data.systemPrompt,
                    userPrompt: data.userPrompt,
                    topics: {
                        connect: topicIdsToConnect.map((id) => ({ id })),
                        disconnect: topicIdsToDisconnect.map((id) => ({ id })),
                    },
                    formats: {
                        connect: formatIdsToConnect.map((id) => ({ id })),
                        disconnect: formatIdsToDisconnect.map((id) => ({ id })),
                    },
                },
                include: {
                    topics: true,
                    formats: true,
                },
            });
        }
        const newAssistant = await prisma.aiAssistant.create({
            data: {
                name: data.name,
                systemPrompt: data.systemPrompt,
                userPrompt: data.userPrompt,
                topics: {
                    connect: data.topics.map((t) => ({ id: t.id })),
                },
                formats: {
                    connect: data.formats.map((f) => ({ id: f.id })),
                },
            },
            include: {
                topics: true,
                formats: true,
            },
        });

        await prisma.appConfig.update({
            where: { id: config.id },
            data: {
                aiAssistantId: newAssistant.id,
            },
        });

        return newAssistant;
    },

    createTopic: async (value: string): Promise<AiAssistantItem> => {
        const topic = await prisma.aiAssistantTopic.create({
            data: { value },
        });
        return topic;
    },

    createFormat: async (value: string): Promise<AiAssistantItem> => {
        const format = await prisma.aiAssistantFormat.create({
            data: { value },
        });
        return format;
    },
};
