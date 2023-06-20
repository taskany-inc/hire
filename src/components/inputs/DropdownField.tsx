// TODO: disable return type https://github.com/typescript-eslint/typescript-eslint/blob/v4.32.0/packages/eslint-plugin/docs/rules/explicit-module-boundary-types.md
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { useMemo, useCallback, CSSProperties } from 'react';

export type SelectValue = string | ReadonlyArray<string> | number;

export interface DropdownFieldOption<TValue extends SelectValue = SelectValue> {
    text: string;
    value: TValue;
}

export interface DropdownFieldProps<TFieldValues extends FieldValues, TValue extends SelectValue = SelectValue> {
    name: FieldPath<TFieldValues>;
    control: Control<TFieldValues>;
    rules?: { required: string };
    formControlClassName?: string;
    formControlStyle?: CSSProperties;
    label?: string;
    className?: string;
    options: DropdownFieldOption<TValue>[];
    fullWidth?: boolean;
    displayEmpty?: boolean;
}

function encodeDropdownFieldNullValue<TValue extends SelectValue>(nullOptionValue: TValue) {
    return ({ text, value }: DropdownFieldOption<TValue>): DropdownFieldOption<TValue> => ({
        text,
        value: value === null ? nullOptionValue : value,
    });
}

export function useNullableDropdownFieldOptions<
    TValue extends SelectValue = SelectValue,
    TDataItem = DropdownFieldOption<TValue>,
    TNullValue extends SelectValue = TValue,
>(
    data: TDataItem[],
    {
        dataItemToOption = (item: unknown) => item as DropdownFieldOption<TValue | TNullValue>,
        nullOptionValue = 'null' as unknown as TNullValue,
        additionalNullOptionTitle,
    }: {
        dataItemToOption?: (item: TDataItem) => DropdownFieldOption<TValue | TNullValue>;
        nullOptionValue?: TNullValue;
        additionalNullOptionTitle?: string;
    } = {},
): {
    options: DropdownFieldOption<TValue | TNullValue>[];
    encodeInitialValue: (value: TValue | null) => TValue | TNullValue;
    prepareValueForSubmit: (value: TValue | TNullValue) => TValue | null;
} {
    const dataMapper = useCallback(
        (item: TDataItem) => encodeDropdownFieldNullValue<TValue | TNullValue>(nullOptionValue)(dataItemToOption(item)),
        /*
         * TODO: fix requirement to include in deps TValue
         * Bug (https://github.com/facebook/react/issues/20395) is marked as fixed, but updating doesn't help         */
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [nullOptionValue, dataItemToOption],
    );

    const options = useMemo<DropdownFieldOption<TValue | TNullValue>[]>(() => {
        const dataOptions = data.map(dataMapper);

        return typeof additionalNullOptionTitle !== 'undefined'
            ? [{ value: nullOptionValue, text: additionalNullOptionTitle }, ...dataOptions]
            : dataOptions;
    }, [additionalNullOptionTitle, data, dataMapper, nullOptionValue]);

    const encodeInitialValue = useCallback(
        (value: TValue | null): TValue | TNullValue => (value === null ? nullOptionValue : value),
        /*
         * TODO: fix requirement to include in deps TValue
         *  Bug (https://github.com/facebook/react/issues/20395) is marked as fixed, but updating does not help
         */
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [nullOptionValue],
    );

    const prepareValueForSubmit = useCallback(
        (value: TValue | TNullValue): TValue | null => (value !== nullOptionValue ? (value as TValue) : null),
        /*
         * TODO: fix requirement to include in deps TValue
         *  Bug (https://github.com/facebook/react/issues/20395) is marked as fixed, but updating does not help
         */
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [nullOptionValue],
    );

    return { options, encodeInitialValue, prepareValueForSubmit };
}
