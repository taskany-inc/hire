import { SectionGrade } from '@prisma/client';
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form';

import { gradeOptionsPackages } from '../../backend/modules/section-type/section-type-types';
import { objKeys } from '../../utils';

import { Container, Label } from './StyledComponents';

type FormGradeOptionsProps<T extends FieldValues> = {
    name: FieldPath<T>;
    control: Control<T>;
};

const getSelectValueFromOptions = (options: SectionGrade[]): string | undefined => {
    return objKeys(gradeOptionsPackages).find((k) => (gradeOptionsPackages[k] as SectionGrade[]).includes(options[0]));
};

// TODO: use taskany Select
export const FormGradeOptions = <T extends FieldValues>({ name, control }: FormGradeOptionsProps<T>) => {
    const { field, fieldState } = useController({ name, control });

    return (
        <Container>
            <Label>Section grades</Label>
            <select
                defaultValue={getSelectValueFromOptions(field.value)}
                onChange={(e) => {
                    field.onChange(gradeOptionsPackages[e.target.value as keyof typeof gradeOptionsPackages]);
                }}
            >
                {Object.entries(gradeOptionsPackages).map(([key, options]) => (
                    <option key={key} value={key}>
                        {options.join(', ')}
                    </option>
                ))}
            </select>
            {fieldState.error && <div>{fieldState.error.message}</div>}
        </Container>
    );
};
