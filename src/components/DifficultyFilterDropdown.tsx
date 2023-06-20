import React, { useCallback, useState } from 'react';
import { ProblemDifficulty } from '@prisma/client';
import { Dropdown } from '@taskany/bricks';

import { problemDifficultyLabels } from '../utils/dictionaries';

import { ColorizedMenuItem } from './ColorizedMenuItem';
import { FiltersMenuItem } from './FiltersMenuItem';

interface DifficultyFilterDropdownProps {
    text: React.ComponentProps<typeof Dropdown>['text'];
    value?: ProblemDifficulty;
    disabled?: React.ComponentProps<typeof Dropdown>['disabled'];
    difficulties?: Array<ProblemDifficulty>;

    onChange?: (selected?: ProblemDifficulty) => void;
}

export const DifficultyFilterDropdown = React.forwardRef<HTMLDivElement, DifficultyFilterDropdownProps>(
    ({ text, value, disabled, onChange, difficulties }, ref) => {
        const [selected, setSelected] = useState<ProblemDifficulty | undefined>(value);

        const onStateClick = useCallback(
            (d: ProblemDifficulty) => {
                selected === d ? setSelected(undefined) : setSelected(d);

                onChange?.(value === d ? undefined : d);
            },
            [onChange, selected, value],
        );

        return (
            <Dropdown
                ref={ref}
                text={text}
                value={value}
                onChange={onStateClick}
                items={difficulties}
                disabled={disabled}
                renderTrigger={(props) => (
                    <FiltersMenuItem ref={props.ref} active={!!value} disabled={props.disabled} onClick={props.onClick}>
                        {props.text}
                    </FiltersMenuItem>
                )}
                renderItem={(props) => (
                    <ColorizedMenuItem
                        key={problemDifficultyLabels[props.item as ProblemDifficulty]}
                        title={problemDifficultyLabels[props.item as ProblemDifficulty]}
                        hoverColor="#565589"
                        checked={selected === props.item}
                        onClick={props.onClick}
                    />
                )}
            />
        );
    },
);
