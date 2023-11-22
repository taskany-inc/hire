import { SyntheticEvent } from 'react';
import { useRifm } from 'rifm';
import { Control, FieldPath, FieldValues, RegisterOptions, useController } from 'react-hook-form';
import { FormInput, Input } from '@taskany/bricks';

import { tr } from './PhoneField.i18n';

type InputProps = JSX.LibraryManagedAttributes<typeof Input, React.ComponentProps<typeof Input>>;

const stripPhone = (str: string) => str.slice(3).replace(/[^\d]/g, '');

const phoneRifmArgs = {
    accept: /[\d]/g,

    format: (str: string) => {
        const digits = stripPhone(str);
        const chars = digits.split('');
        const result = `+7 ${chars.reduce(
            (prev, curr, i) => (i === 3 || i === 6 || i === 8 || i === 10 ? `${prev} ${curr}` : `${prev}${curr}`),
            '',
        )}`;

        return result;
    },

    replace: (str: string) => {
        const digits = stripPhone(str);
        const triplet1 = digits.slice(0, 3).padEnd(3, '_');
        const triplet2 = digits.slice(3, 6).padEnd(3, '_');
        const pair1 = digits.slice(6, 8).padEnd(2, '_');
        const pair2 = digits.slice(8, 10).padEnd(2, '_');
        const result = `+7 ${triplet1} ${triplet2} ${pair1} ${pair2}`;

        return result;
    },

    mask: true,
};

const tweakSelection = (e: SyntheticEvent<HTMLInputElement>) => {
    const start = Math.max(3, e.currentTarget.selectionStart ?? 0);
    const end = Math.max(3, e.currentTarget.selectionEnd ?? start);
    e.currentTarget.setSelectionRange(start, end, e.currentTarget.selectionDirection ?? undefined);
};

export type PhoneFieldProps<T extends FieldValues> = InputProps & {
    name: FieldPath<T>;
    control: Control<T>;
    options?: RegisterOptions<T>;
};

export const PhoneField = <T extends FieldValues>({
    name,
    control,
    options,
    defaultValue,
    ...restProps
}: PhoneFieldProps<T>): JSX.Element => {
    const { field } = useController({
        name,
        control,
        rules: {
            ...options,
            pattern: {
                value: /\+7 \d{3} \d{3} \d{2} \d{2}/,
                message: tr('Invalid phone format'),
            },
        },
    });

    const rifm = useRifm<HTMLInputElement>({
        value: String(field.value),
        onChange: field.onChange,
        ...phoneRifmArgs,
    });

    return (
        <FormInput
            label={tr('Phone number')}
            {...restProps}
            {...rifm}
            defaultValue={String(defaultValue)}
            onFocus={tweakSelection}
            onClick={tweakSelection}
            onKeyUp={tweakSelection}
        />
    );
};
