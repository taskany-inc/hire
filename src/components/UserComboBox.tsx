import { ComboBox, FiltersMenuItem, Input, UserMenuItem } from '@taskany/bricks';
import React, { ChangeEvent, Dispatch, SetStateAction, useCallback, useState } from 'react';
import { User } from '@prisma/client';
import styled from 'styled-components';

interface UserComboBoxProps {
    placeholder?: string;
    onChange?: (user: User) => void;
    disabled?: boolean;
    setInputValue?: Dispatch<SetStateAction<string>>;
    items?: User[];
    value?: User;
}

const StyledComboBox = styled(ComboBox)`
    width: fit-content;
`;

export const UserComboBox = React.forwardRef<HTMLDivElement, UserComboBoxProps>(
    ({ disabled, placeholder, onChange, setInputValue, items, value }, ref) => {
        const [interviewrsVisibility, setInterviewrsVisibility] = useState(false);

        const onClickOutside = useCallback((cb: () => void) => {
            cb();
        }, []);

        return (
            <StyledComboBox
                text={placeholder}
                ref={ref}
                onClickOutside={onClickOutside}
                renderInput={(props) => (
                    <Input
                        autoFocus
                        placeholder={placeholder}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            setInputValue && setInputValue(e.currentTarget.value);
                            setInterviewrsVisibility(true);
                        }}
                        {...props}
                    />
                )}
                visible={interviewrsVisibility}
                onChange={onChange}
                renderItem={(props) => (
                    <UserMenuItem
                        key={props.item.id}
                        name={props.item.name}
                        email={props.item.email}
                        onClick={props.onClick}
                    />
                )}
                renderTrigger={(props) => {
                    return value ? (
                        <UserMenuItem name={value.name || value.email} email={value.email} onClick={props.onClick} />
                    ) : (
                        <FiltersMenuItem {...props}>{props.text}</FiltersMenuItem>
                    );
                }}
                items={items}
                disabled={disabled}
            />
        );
    },
);
