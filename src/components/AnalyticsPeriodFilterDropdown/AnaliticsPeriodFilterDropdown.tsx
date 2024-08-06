import React, { useCallback, useState } from 'react';
import { Dropdown } from '@taskany/bricks';

import { ColorizedMenuItem } from '../ColorizedMenuItem/ColorizedMenuItem';
import { FiltersMenuItem } from '../FiltersMenuItem/FiltersMenuItem';

import { tr } from './AnalyticsPeriodFilterDropdown.i18n';

interface AnaliticsPeriodFilterDropdownProps {
    value?: string;
    disabled?: React.ComponentProps<typeof Dropdown>['disabled'];
    onChange?: (selected: string) => void;
}

export const AnaliticsPeriodFilterDropdown = React.forwardRef<HTMLDivElement, AnaliticsPeriodFilterDropdownProps>(
    ({ value, disabled, onChange }, ref) => {
        const [selected, setSelected] = useState<string | undefined>(value);

        const periods = [
            { title: tr('Week'), value: 'Week' },
            { title: tr('Month'), value: 'Month' },
            { title: tr('Quarter'), value: 'Quarter' },
            { title: tr('Year'), value: 'Year' },
            { title: tr('Custom'), value: 'Custom' },
        ];

        const onStateClick = useCallback(
            (item: { title: string; value: string }) => {
                setSelected(item.value);
                onChange?.(item.value);
            },
            [onChange],
        );

        return (
            <Dropdown
                ref={ref}
                text={value}
                value={value}
                onChange={onStateClick}
                items={periods}
                disabled={disabled}
                renderTrigger={(props) => (
                    <FiltersMenuItem
                        ref={props.ref}
                        active={value !== 'Year'}
                        disabled={props.disabled}
                        onClick={props.onClick}
                    >
                        {periods.find((period) => period.value === props.value)?.title || value}
                    </FiltersMenuItem>
                )}
                renderItem={(props) => (
                    <ColorizedMenuItem
                        key={props.item.value}
                        title={props.item.title}
                        hoverColor
                        checked={selected === props.item.value}
                        onClick={props.onClick}
                    />
                )}
            />
        );
    },
);
