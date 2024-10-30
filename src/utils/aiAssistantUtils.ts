import { CvParsingResult } from '../modules/aiAssistantTypes';

import { tr } from './utils.i18n';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const castKeyToOobj = <T extends Record<string, any>, K = unknown>(k: K, o: T): k is Extract<K, keyof T> => {
    if (typeof k !== 'string') {
        return false;
    }

    if (typeof o === 'object' && o != null) {
        return k in o;
    }

    return false;
};

const parseTechnologies = (technologies: CvParsingResult['technologies']): string[] => {
    let values: string[] = [];

    if (Array.isArray(technologies)) {
        values = technologies;
    }

    if (typeof technologies === 'object') {
        values = [];
        for (const key in technologies) {
            if (castKeyToOobj(key, technologies)) {
                values.push(...parseTechnologies(technologies[key]));
            }
        }
    }

    return values;
};

export const cvParsingResultToDescription = (cvParsingResult?: CvParsingResult): string => {
    if (!cvParsingResult) return '';
    let description = '';
    const { email, phone, technologies } = cvParsingResult;

    if (email) {
        description += `\n\nEmail: ${email}`;
    }
    if (phone) {
        description += `\n\n${tr('Phone')}: ${phone}`;
    }

    const values = parseTechnologies(technologies);
    if (values.length) {
        description += `\n\n${tr('Techologies')}: ${values.join(', ')}`;
    }

    return description;
};
