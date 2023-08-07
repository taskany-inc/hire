import { Control, FieldPath, FieldValues, useController } from 'react-hook-form';

import { useGradeOptions } from '../../hooks/grades-hooks';

import { Container, Label } from './StyledComponents';

type FormGradeOptionsProps<T extends FieldValues> = {
    name: FieldPath<T>;
    control: Control<T>;
};

const separator = ', ';

// TODO: use taskany Select
export const FormGradeOptions = <T extends FieldValues>({ name, control }: FormGradeOptionsProps<T>) => {
    const gradeOptions = useGradeOptions().data ?? [];

    const { field, fieldState } = useController({ name, control });

    return (
        <Container>
            <Label>Section grades</Label>
            <select
                defaultValue={gradeOptions[0]?.join(separator)}
                onChange={(e) => {
                    field.onChange(e.target.value.split(separator));
                }}
            >
                {gradeOptions.map((options) => {
                    const joined = options.join(separator);
                    return (
                        <option key={joined} value={joined}>
                            {joined}
                        </option>
                    );
                })}
            </select>
            {fieldState.error && <div>{fieldState.error.message}</div>}
        </Container>
    );
};
