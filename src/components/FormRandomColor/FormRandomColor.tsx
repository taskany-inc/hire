import { Control, FieldPath, FieldValues, useController } from 'react-hook-form';
import { ErrorPopup, Text } from '@taskany/bricks';
import { gray8 } from '@taskany/colors';

import { generateColor } from '../../utils/color';

import s from './FormRandomColor.module.css';

type FormRandomColorProps<T extends FieldValues> = {
    label: string;
    name: FieldPath<T>;
    control: Control<T>;
};

export const FormRandomColor = <T extends FieldValues>(props: FormRandomColorProps<T>) => {
    const { name, control, label } = props;
    const { field, fieldState } = useController({ name, control });

    return (
        <div onClick={() => field.onChange(generateColor())} className={s.FormRandomColorContainer}>
            <Text as="label" size="m" color={gray8} weight="bold">
                {label}
            </Text>
            <div className={s.FormRandomColorColorExample} style={{ backgroundColor: field.value }} />
            {fieldState.error && <ErrorPopup>{fieldState.error.message}</ErrorPopup>}
        </div>
    );
};
