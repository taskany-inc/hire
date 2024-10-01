import { Input, User as HarmonyUser, Select, SelectPanel, SelectTrigger, UserGroup } from '@taskany/bricks/harmony';
import React, { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import { User } from '@prisma/client';
import { nullable } from '@taskany/bricks';
import { IconSearchOutline } from '@taskany/icons';

import { AddInlineTrigger } from './AddInlineTrigger/AddInlineTrigger';

interface UserComboBoxProps {
    placeholder?: string;
    onChange?: (users: User[]) => void;
    disabled?: boolean;
    setInputValue?: Dispatch<SetStateAction<string>>;
    items?: User[];
    value?: User[];
}

export const UserComboBox = ({ disabled, placeholder, onChange, setInputValue, items, value }: UserComboBoxProps) => {
    const [interviewrsVisibility, setInterviewrsVisibility] = useState(false);

    const onUserChange = (users: User[]) => {
        onChange?.(users);
    };

    return (
        <Select
            items={items}
            mode="multiple"
            onChange={onUserChange}
            selectable
            value={value}
            renderItem={(props) => <HarmonyUser name={props.item.name} email={props.item.email} />}
            isOpen={interviewrsVisibility}
            onClose={() => {
                setInterviewrsVisibility(false);
            }}
        >
            <SelectTrigger
                renderTrigger={(props) => (
                    <div ref={props.ref}>
                        {nullable(
                            value,
                            (users) =>
                                nullable(
                                    users.length > 1,
                                    () => (
                                        <div onClick={() => !disabled && setInterviewrsVisibility(true)}>
                                            <UserGroup users={users} />
                                        </div>
                                    ),
                                    <HarmonyUser
                                        name={users[0].name}
                                        email={users[0].email}
                                        onClick={() => !disabled && setInterviewrsVisibility(true)}
                                    />,
                                ),
                            <AddInlineTrigger
                                text={placeholder || ''}
                                onClick={() => !disabled && setInterviewrsVisibility(true)}
                            />,
                        )}
                    </div>
                )}
            />
            <SelectPanel placement="bottom-start">
                <Input
                    placeholder={placeholder}
                    outline
                    autoFocus
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setInputValue?.(e.currentTarget.value);
                        setInterviewrsVisibility(true);
                    }}
                    iconLeft={<IconSearchOutline size="s" />}
                />
            </SelectPanel>
        </Select>
    );
};
