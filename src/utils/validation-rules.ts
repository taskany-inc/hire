import { RegisterOptions } from 'react-hook-form';

const inferKeys = <O extends { [name: string]: RegisterOptions }>(obj: O) => obj;

export const validationRules = inferKeys({
    nonEmptyString: {
        required: { value: true, message: 'Required field' },
    },
});
