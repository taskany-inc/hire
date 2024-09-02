import {
    Dropdown,
    DropdownTrigger,
    Input,
    DropdownPanel,
    ListView,
    ListViewItem,
    User as HarmonyUser,
} from '@taskany/bricks/harmony';
import React, { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import { User } from '@prisma/client';
import { nullable } from '@taskany/bricks';
import { IconSearchOutline } from '@taskany/icons';

import s from './UserComboBox.module.css';
import { AddInlineTrigger } from './AddInlineTrigger/AddInlineTrigger';

interface UserComboBoxProps {
    placeholder?: string;
    onChange?: (user: User) => void;
    disabled?: boolean;
    setInputValue?: Dispatch<SetStateAction<string>>;
    items?: User[];
    value?: User;
}

export const UserComboBox = ({ disabled, placeholder, onChange, setInputValue, items, value }: UserComboBoxProps) => {
    const [interviewrsVisibility, setInterviewrsVisibility] = useState(false);

    const onUserChange = (user: User) => {
        onChange && onChange(user);
        setInterviewrsVisibility(false);
    };

    return (
        <Dropdown
            isOpen={interviewrsVisibility}
            onClose={() => {
                setInterviewrsVisibility(false);
            }}
        >
            <DropdownTrigger
                renderTrigger={(props) => (
                    <div ref={props.ref}>
                        {nullable(
                            value,
                            (user) => (
                                <HarmonyUser
                                    name={user.name}
                                    email={user.email}
                                    onClick={() => !disabled && setInterviewrsVisibility(true)}
                                />
                            ),
                            <AddInlineTrigger
                                text={placeholder || ''}
                                onClick={() => !disabled && setInterviewrsVisibility(true)}
                                ref={props.ref}
                            />,
                        )}
                    </div>
                )}
            />
            <DropdownPanel placement="bottom-start">
                <Input
                    placeholder={placeholder}
                    outline
                    autoFocus
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setInputValue && setInputValue(e.currentTarget.value);
                        setInterviewrsVisibility(true);
                    }}
                    iconLeft={<IconSearchOutline size="s" />}
                />
                <ListView>
                    {items?.map((user) => (
                        <ListViewItem
                            key={user.id}
                            renderItem={(props) => (
                                <HarmonyUser
                                    className={s.ListItem}
                                    onClick={() => onUserChange(user)}
                                    name={user.name}
                                    email={user.email}
                                    {...props}
                                />
                            )}
                        />
                    ))}
                </ListView>
            </DropdownPanel>
        </Dropdown>
    );
};
