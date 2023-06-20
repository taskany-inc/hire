import React, { useCallback, useEffect, useState } from 'react';
import { InterviewStatus } from '@prisma/client';
import { Dropdown } from '@taskany/bricks';

import { interviewStatusLabels } from '../utils/dictionaries';

import { ColorizedMenuItem } from './ColorizedMenuItem';
import { FiltersMenuItem } from './FiltersMenuItem';

interface InterviewStatusFilterDropdownProps {
    text: React.ComponentProps<typeof Dropdown>['text'];
    value?: InterviewStatus[];
    disabled?: React.ComponentProps<typeof Dropdown>['disabled'];
    statuses: InterviewStatus[];

    onChange?: (selected: InterviewStatus[]) => void;
}

export const InterviewStatusFilterDropdown = React.forwardRef<HTMLDivElement, InterviewStatusFilterDropdownProps>(
    ({ text, value, statuses, disabled, onChange }, ref) => {
        const [selected, setSelected] = useState<Set<InterviewStatus>>(new Set(value));
        useEffect(() => setSelected(new Set(value)), [value]);

        const onStateClick = useCallback(
            (s: InterviewStatus) => {
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
                items={statuses}
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
                        key={interviewStatusLabels[props.item as InterviewStatus]}
                        title={interviewStatusLabels[props.item as InterviewStatus]}
                        hoverColor="#565589"
                        checked={selected?.has(props.item)}
                        onClick={props.onClick}
                    />
                )}
            />
        );
    },
);
