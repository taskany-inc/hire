import { RegisterOptions } from 'react-hook-form';

import { tr } from './utils.i18n';

const inferKeys = <O extends { [name: string]: RegisterOptions }>(obj: O) => obj;

export const validationRules = inferKeys({
    nonEmptyString: {
        required: { value: true, message: tr('Required field') },
    },
});
