import { ComponentProps, FC, useMemo } from 'react';
import { DatePicker, DatePickerYear, DatePickerQuarter, DatePickerStrict } from '@taskany/bricks/harmony';

import { useLocale } from '../../hooks/useLocale';

import { tr } from './DatePickerPanel.i18n';

type DatePickerState = NonNullable<ComponentProps<typeof DatePicker>['value']>;

interface DatePickerPanelProps {
    value?: DatePickerState;
    onChange: (values?: DatePickerState) => void;
}

export const DatePickerPanel: FC<DatePickerPanelProps> = ({ value, onChange }) => {
    const locale = useLocale();

    const translates = useMemo(
        () => ({
            year: {
                title: tr('Year'),
                trigger: tr('Choose year'),
            },
            quarter: {
                title: tr('Quarter'),
                trigger: tr('Choose quarter'),
            },
            strict: {
                title: tr('Strict Date'),
                trigger: tr('Set date'),
                advice: tr('or type the strict date'),
            },
            default: {
                reset: tr('Reset'),
            },
        }),
        [],
    );

    const dateFragments: Record<'en' | 'ru', ('month' | 'day' | 'year')[]> = useMemo(
        () => ({
            en: ['month', 'day', 'year'],
            ru: ['day', 'month', 'year'],
        }),
        [],
    );

    return (
        <DatePicker translates={translates.default} value={value} onChange={onChange}>
            <DatePickerYear translates={translates.year} />
            <DatePickerQuarter translates={translates.quarter} withAliases />
            <DatePickerStrict translates={translates.strict} dateFragments={dateFragments[locale]} splitter="/" />
        </DatePicker>
    );
};
