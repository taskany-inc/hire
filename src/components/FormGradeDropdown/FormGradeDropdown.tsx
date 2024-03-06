import React from 'react';
import { Dropdown, FiltersMenuItem, MenuItem } from '@taskany/bricks';
import { Grades } from '@prisma/client';

import { useGradeOptions } from '../../modules/gradesHooks';

import { tr } from './FormGradeDropdown.i18n';

interface FormGradeDropdownProps {
    text: React.ComponentProps<typeof Dropdown>['text'];
    value?: string[] | null;
    disabled?: React.ComponentProps<typeof Dropdown>['disabled'];
    error?: React.ComponentProps<typeof Dropdown>['error'];
    className?: string;

    onChange?: (priority: Grades) => void;
}

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
                    <FiltersMenuItem ref={props.ref} onClick={props.onClick} disabled={props.disabled}>
                        {props.value}
                    </FiltersMenuItem>
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
