import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Dropdown } from '@taskany/bricks';

import { ColorizedMenuItem } from './ColorizedMenuItem';
import { FiltersMenuItem } from './FiltersMenuItem';

type DropdownOption = {
    value: string | number;
    text: string;
};

const Container = styled.div`
    width: 100%;
    max-width: 500px;
    padding-top: 10px;
    padding-bottom: 10px;
`;

export const Label = styled.div`
    font-style: normal;
    font-weight: normal;
    font-size: 16px;
    line-height: 20px;
    margin-bottom: 5px;

    color: rgba(255, 255, 255);
`;

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
            <Container>
                {label && <Label>{label}</Label>}
                <Dropdown
                    ref={ref}
                    text={selected?.text || text}
                    value={value}
                    onChange={onStateClick}
                    items={options}
                    disabled={disabled}
                    renderTrigger={(props) => (
                        <FiltersMenuItem
                            ref={props.ref}
                            active={!!value}
                            disabled={props.disabled}
                            onClick={props.onClick}
                        >
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
                        />
                    )}
                />
            </Container>
        );
    },
);
