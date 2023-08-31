import React from 'react';
import { Button, Dropdown, MenuItem } from '@taskany/bricks';
import { Grades } from '@prisma/client';

import { useGradeOptions } from '../../hooks/grades-hooks';
import { tr } from '../components.i18n';

type FormGradeDropdownProps = {
    text: React.ComponentProps<typeof Dropdown>['text'];
    value?: string[] | null;
    disabled?: React.ComponentProps<typeof Dropdown>['disabled'];
    error?: React.ComponentProps<typeof Dropdown>['error'];

    onChange?: (priority: Grades) => void;
};

const separator = ', ';

export const FormGradeDropdown = React.forwardRef<HTMLDivElement, FormGradeDropdownProps>(
    ({ text, value, disabled, error, onChange }, ref) => {
        const gradeOptions = useGradeOptions().data ?? [];
        const dropdownText = gradeOptions.length === 0 ? tr('No grade options in database') : text;

        return (
            <Dropdown
                ref={ref}
                error={error}
                text={dropdownText}
                value={value && value.length !== 0 ? value.join(separator) : dropdownText}
                onChange={onChange}
                items={gradeOptions}
                disabled={disabled || gradeOptions.length === 0}
                renderTrigger={(props) => (
                    <Button ref={props.ref} onClick={props.onClick} disabled={props.disabled} text={props.value} />
                )}
                renderItem={(props) => (
                    <MenuItem ghost key={props.item} focused={props.cursor === props.index} onClick={props.onClick}>
                        {props.item.join(separator)}
                    </MenuItem>
                )}
            />
        );
    },
);
