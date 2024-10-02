import { ComponentProps, ReactNode } from 'react';
import { FormControl as FormControlBricks, FormControlLabel, FormControlError } from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

import s from './FormControl.module.css';

interface FormControlProps {
    label: ReactNode;
    error: ComponentProps<typeof FormControlError>['error'];
    children: ReactNode;
}

export const FormControl = ({ label, error, children }: FormControlProps) => {
    return (
        <FormControlBricks>
            <FormControlLabel className={s.FormControlLabel}>{label}</FormControlLabel>
            {children}
            {nullable(error, (e) => (
                <FormControlError error={e} />
            ))}
        </FormControlBricks>
    );
};
