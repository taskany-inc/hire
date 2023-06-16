import React, { useCallback, useEffect, useState } from 'react';
import { HireStream } from '@prisma/client';
import { Dropdown } from '@taskany/bricks';

import { ColorizedMenuItem } from './ColorizedMenuItem';
import { FiltersMenuItem } from './FiltersMenuItem';

interface HireStreamFilterDropdownProps {
    text: React.ComponentProps<typeof Dropdown>['text'];
    value?: HireStream[];
    disabled?: React.ComponentProps<typeof Dropdown>['disabled'];
    streams: HireStream[];

    onChange?: (selected: HireStream[]) => void;
}

export const HireStreamFilterDropdown = React.forwardRef<HTMLDivElement, HireStreamFilterDropdownProps>(
    ({ text, value, streams, disabled, onChange }, ref) => {
        const [selected, setSelected] = useState<Set<HireStream>>(new Set(value));
        useEffect(() => setSelected(new Set(value)), [value]);

        const onStateClick = useCallback(
            (s: HireStream) => {
                selected.has(s) ? selected.delete(s) : selected.add(s);
                const newSelected = new Set(selected);
                setSelected(newSelected);

                onChange?.(Array.from(newSelected));
            },
            [onChange, selected],
        );

        return (
            <Dropdown
                ref={ref}
                text={text}
                value={value}
                onChange={onStateClick}
                items={streams}
                disabled={disabled}
                renderTrigger={(props) => (
                    <FiltersMenuItem
                        ref={props.ref}
                        active={Boolean(Array.from(selected).length)}
                        disabled={props.disabled}
                        onClick={props.onClick}
                    >
                        {props.text}
                    </FiltersMenuItem>
                )}
                renderItem={(props) => (
                    <ColorizedMenuItem
                        key={props.item.name}
                        title={props.item.name}
                        hoverColor="#565589"
                        checked={selected?.has(props.item)}
                        onClick={props.onClick}
                    />
                )}
            />
        );
    },
);
