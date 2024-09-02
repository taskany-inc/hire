import React, { useState } from 'react';
import {
    Dropdown,
    DropdownPanel,
    DropdownTrigger,
    ListView,
    ListViewItem,
    MenuItem,
    Badge,
    Text,
} from '@taskany/bricks/harmony';
import { danger0 } from '@taskany/colors';
import { nullable } from '@taskany/bricks';

import { useGradeOptions } from '../../modules/gradesHooks';

import { tr } from './FormGradeDropdown.i18n';

interface FormGradeDropdownProps {
    text: string;
    value?: string[] | null;
    className?: string;
    error?: { message?: string };

    onChange?: (priority: string[]) => void;
}

const separator = ', ';

export const FormGradeDropdown = ({ text, value, onChange, error }: FormGradeDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const gradeOptions = useGradeOptions().data ?? [];
    const dropdownText = gradeOptions.length === 0 ? tr('No grade options in database') : text;

    return (
        <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <DropdownTrigger
                    renderTrigger={(props) => (
                        <div ref={props.ref}>
                            <Badge
                                onClick={() => setIsOpen(!isOpen)}
                                text={value ? value.join(separator) : dropdownText}
                            />
                        </div>
                    )}
                />
                {nullable(error?.message, (m) => (
                    <Text size="s" color={danger0}>
                        {m}
                    </Text>
                ))}
            </div>
            <DropdownPanel placement="bottom-start">
                <ListView>
                    {gradeOptions.map((item, index) => (
                        <ListViewItem
                            key={index}
                            value={item}
                            renderItem={({ active, hovered, ...props }) => (
                                <MenuItem
                                    onClick={() => {
                                        setIsOpen(false);
                                        onChange && onChange(item);
                                    }}
                                    hovered={active || hovered}
                                    key={item.join(separator)}
                                    {...props}
                                >
                                    {item.join(separator)}
                                </MenuItem>
                            )}
                        />
                    ))}
                </ListView>
            </DropdownPanel>
        </Dropdown>
    );
};
