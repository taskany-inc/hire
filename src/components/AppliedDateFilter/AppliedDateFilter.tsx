import React, { ComponentProps, FC, useCallback, useMemo } from 'react';
import { decodeDateRangeFromString, encodeUrlDateRange, formateEstimate, nullable } from '@taskany/bricks';
import { AppliedFilter, Text, Select, SelectPanel, SelectTrigger, TagCleanButton } from '@taskany/bricks/harmony';

import { useLocale } from '../../hooks/useLocale';
import { DatePickerPanel } from '../DatePickerPanel/DatePickerPanel';

import s from './AppliedDateFilter.module.css';

interface AppliedDateFilterProps {
    title: string;
    onCleanFilter: () => void;
    value: string[] | undefined;
    onChange: (values?: { id: string }[]) => void;
    onClose: () => void;
}

export const AppliedDateFilter: FC<AppliedDateFilterProps> = ({ title, value, onCleanFilter, onChange, onClose }) => {
    const locale = useLocale();
    const dateRange = useMemo(() => decodeDateRangeFromString(value?.[0]), [value]);

    const handleChange = useCallback<NonNullable<ComponentProps<typeof DatePickerPanel>['onChange']>>(
        (value) => {
            if (!value) {
                onChange?.([]);
                return;
            }

            const date = value.alias || encodeUrlDateRange(value.range);

            onChange?.([{ id: date }]);
        },
        [onChange],
    );

    return (
        <AppliedFilter label={title} action={<TagCleanButton size="s" onClick={onCleanFilter} />}>
            <Select arrow onClose={onClose} mode="multiple">
                <SelectTrigger>
                    {nullable(dateRange, (v) => (
                        <Text size="s" as="span">
                            {formateEstimate(new Date(v.range.end), {
                                locale,
                                type: v.type,
                            })}
                        </Text>
                    ))}
                </SelectTrigger>
                <SelectPanel placement="bottom" width={330} className={s.AppliedDateFilterPanel}>
                    <DatePickerPanel value={dateRange} onChange={handleChange} />
                </SelectPanel>
            </Select>
        </AppliedFilter>
    );
};
