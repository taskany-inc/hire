import React, { useCallback, useState } from 'react';
import { Dropdown } from '@taskany/bricks';

import { ColorizedMenuItem } from './ColorizedMenuItem';
import { FiltersMenuItem } from './FiltersMenuItem';

interface AnaliticsPeriodFilterDropdownProps {
    value?: string;
    disabled?: React.ComponentProps<typeof Dropdown>['disabled'];
    periods?: Array<string>;

    onChange?: (selected: string) => void;
}

export const AnaliticsPeriodFilterDropdown = React.forwardRef<HTMLDivElement, AnaliticsPeriodFilterDropdownProps>(
    ({ value, disabled, onChange, periods }, ref) => {
        const [selected, setSelected] = useState<string | undefined>(value);

        const onStateClick = useCallback(
            (item: string) => {
                setSelected(item);
                onChange?.(item);
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
                        {props.value}
                    </FiltersMenuItem>
                )}
                renderItem={(props) => (
                    <ColorizedMenuItem
                        key={props.item}
                        title={props.item}
                        hoverColor="#565589"
                        checked={selected === props.item}
                        onClick={props.onClick}
                    />
                )}
            />
        );
    },
);
