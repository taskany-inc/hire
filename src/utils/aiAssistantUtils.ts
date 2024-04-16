import { CvParsingResult } from '../modules/aiAssistantTypes';

import { tr } from './utils.i18n';

export const cvParsingResultToDescription = (cvParsingResult?: CvParsingResult): string => {
    if (!cvParsingResult) return '';
    let description = '';
    if (cvParsingResult.email) {
        description += `\n\nEmail: ${cvParsingResult.email}`;
    }
    if (cvParsingResult.phone) {
        description += `\n\n${tr('Phone')}: ${cvParsingResult.phone}`;
    }
    if (cvParsingResult.technologies) {
        description += `\n\n${tr('Techologies')}: ${cvParsingResult.technologies.join(', ')}`;
    }
    return description;
};
