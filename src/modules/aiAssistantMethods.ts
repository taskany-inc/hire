import { v4 as uuidv4 } from 'uuid';
import pdfParse from 'pdf-parse';

import config from '../config';
import { tryGetAsyncValue } from '../utils/tryGetAsyncValue';

import { CvParsingResult, cvParsingResultSchema } from './aiAssistantTypes';

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
            }),
        );
        if (!response?.ok) return;
        const json = await response.json();
        const content = JSON.parse(json.choices?.[0]?.message?.content);
        const validatedAssistantResponse = cvParsingResultSchema.safeParse(content);
        return validatedAssistantResponse.success ? validatedAssistantResponse.data : undefined;
    },
};
