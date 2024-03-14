import { v4 as uuidv4 } from 'uuid';
import pdfParse from 'pdf-parse';

import config from '../config';

import { CvParsingResult, cvParsingResultSchema } from './aiAssistantTypes';

const getToken = async () => {
    if (!config.aiAssistant.authUrl || !config.aiAssistant.authHeader || !config.aiAssistant.authScope) return;
    const response = await fetch(config.aiAssistant.authUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
            RqUID: uuidv4(),
            Authorization: `Basic ${config.aiAssistant.authHeader}`,
        },
        body: config.aiAssistant.authScope,
    });
    if (!response.ok) return;
    const json = await response.json();
    if (typeof json.access_token === 'string') {
        return json.access_token;
    }
};

export const aiAssistantMethods = {
    parseCv: async (file: Buffer): Promise<CvParsingResult | undefined> => {
        if (!config.aiAssistant.apiUrl || !config.aiAssistant.model || !config.aiAssistant.cvParsePrompt) return;
        const token = await getToken();
        if (!token) return;
        const parsedPdf = await pdfParse(file);
        const response = await fetch(`${config.aiAssistant.apiUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                model: config.aiAssistant.model,
                messages: [
                    {
                        role: 'user',
                        content: `${config.aiAssistant.cvParsePrompt}\n${parsedPdf.text}`,
                    },
                ],
            }),
        });
        const json = await response.json();
        const content = JSON.parse(json.choices?.[0]?.message?.content);
        const parsedAssistantResponse = cvParsingResultSchema.safeParse(content);
        return parsedAssistantResponse.success ? parsedAssistantResponse.data : undefined;
    },
};
