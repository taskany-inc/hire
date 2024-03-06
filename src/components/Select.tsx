import React, { useCallback, useState } from 'react';
import { gray8 } from '@taskany/colors';
import { Dropdown, FiltersMenuItem, Text } from '@taskany/bricks';

import { ColorizedMenuItem } from './ColorizedMenuItem';
import { Stack } from './Stack';

interface DropdownOption {
    value: string | number;
    text: string;
    stateDotColor?: string;
}

interface SelectProps {
    text: React.ComponentProps<typeof Dropdown>['text'];
    value?: string | number | null;
    disabled?: React.ComponentProps<typeof Dropdown>['disabled'];
    options?: Array<DropdownOption>;
    label?: string;

    onChange?: (selected?: any) => void;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
    ({ text, value, disabled, onChange, options, label }, ref) => {
        const [selected, setSelected] = useState<DropdownOption | undefined>(
            options?.find((option) => option.value === value),
        );

        const onStateClick = useCallback(
            (option: DropdownOption) => {
                selected === option ? setSelected(undefined) : setSelected(option);

                onChange?.(option.value);
            },
            [onChange, selected],
        );

        return (
            <Stack direction="column">
                {label && (
                    <Text as="label" size="m" color={gray8} weight="bold">
                        {label}
                    </Text>
                )}
                <Dropdown
                    ref={ref}
                    text={selected?.text || text}
                    value={value}
                    onChange={onStateClick}
                    items={options}
                    disabled={disabled}
                    maxHeight={300}
                    renderTrigger={(props) => (
                        <FiltersMenuItem ref={props.ref} disabled={props.disabled} onClick={props.onClick}>
                            {props.text}
                        </FiltersMenuItem>
                    )}
                    renderItem={(props) => (
                        <ColorizedMenuItem
                            key={props.item.value}
                            title={props.item.text}
                            hoverColor="#565589"
                            checked={selected === props.item}
                            onClick={props.onClick}
                            stateDotColor={props.item.stateDotColor}
                        />
                    )}
                />
            </Stack>
        );
    },
);
