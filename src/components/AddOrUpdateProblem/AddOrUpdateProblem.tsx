import { useCallback } from 'react';
import { useForm, DefaultValues } from 'react-hook-form';
import { useRouter } from 'next/router';
import { Tag, ProblemDifficulty } from '@prisma/client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { danger0, gapS } from '@taskany/colors';
import styled from 'styled-components';
import { Button, FormInput, Text, Form, FormCard, FormActions, FormAction } from '@taskany/bricks';

import { useProblemCreateMutation, useProblemUpdateMutation } from '../../modules/problemHooks';
import { pageHrefs } from '../../utils/paths';
import { useTagCreateMutation, useTags } from '../../modules/tagHooks';
import { entitiesToOptions, difficultyOption } from '../../utils';
import { Option } from '../../utils/types';
import { useWarnIfUnsavedChanges } from '../../hooks/useWarnIfUnsavedChanges';
import { CreateProblem } from '../../modules/problemTypes';
import { validationRules } from '../../utils/validationRules';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { CodeEditorField } from '../CodeEditorField/CodeEditorField';
import { Stack } from '../Stack';
import { Select } from '../Select';
import { Autocomplete } from '../Autocomplete/Autocomplete';

import { tr } from './AddOrUpdateProblem.i18n';

type FormData = Omit<CreateProblem, 'tagIds'> & {
    tags: { name: string; value: number }[];
};

export type AddOrUpdateProblemInitialValues = DefaultValues<FormData> & {
    id: number;
    tags: Tag[];
};

const StyledFormCard = styled(FormCard)`
    max-width: 1200px;
`;

const StyledErrorText = styled(Text)`
    margin-left: ${gapS};
`;

type AddOrUpdateProblemProps = {
    variant: 'new' | 'update';
    initialValues?: AddOrUpdateProblemInitialValues;
};

const schema = z.object({
    description: z.string({ required_error: tr('Obligatory field') }),
    solution: z.string({ required_error: tr('Obligatory field') }),
    name: z.string().min(3, tr('Name cannot be less than 3 characters')),
    difficulty: z.nativeEnum(ProblemDifficulty, {
        invalid_type_error: tr('Obligatory field'),
        required_error: tr('Select difficulty'),
    }),
    tags: z.array(z.object({ name: z.string(), value: z.number() })).optional(),
});

const descriptionPlaceholder = tr(
    'Think carefully and describe the essence of the problem in as much detail as possible. It will not be superfluous to add snippets with code. Interviewers will thank you. Maybe ;)',
);

const solutionPlaceholder = tr(
    'Think a little more and write a solution to the problem. Perhaps not even one, but several for different levels of candidates.',
);

export const AddOrUpdateProblem = ({ variant, initialValues }: AddOrUpdateProblemProps): JSX.Element => {
    const router = useRouter();

    const problemCreateMutation = useProblemCreateMutation();
    const problemUpdateMutation = useProblemUpdateMutation();

    const tagQuery = useTags();

    const tageCreateMutation = useTagCreateMutation();

    const newTag = useCallback(
        async (name: string) => {
            const result = await tageCreateMutation.mutateAsync({
                name,
            });

            return result;
        },
        [tageCreateMutation],
    );

    const {
        handleSubmit,
        control,
        register,
        watch,
        setValue,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<FormData>({
        defaultValues: {
            name: initialValues?.name ?? '',
            description: initialValues?.description,
            solution: initialValues?.solution,
            difficulty: initialValues?.difficulty,
            tags:
                initialValues?.tags?.map((tag: Tag) => ({
                    name: tag.name,
                    value: tag.id,
                })) || [],
        },
        resolver: zodResolver(schema),
    });

    const onSubmit =
        variant === 'new'
            ? handleSubmit(async ({ name, tags, description, solution, difficulty }) => {
                  const result = await problemCreateMutation.mutateAsync({
                      name,
                      description,
                      solution,
                      tagIds: tags.map((tag) => tag.value),
                      difficulty,
                  });
                  router.push(pageHrefs.problem(result.id));
              })
            : handleSubmit(async ({ name, tags, description, solution, difficulty }) => {
                  if (!initialValues) return;
                  const result = await problemUpdateMutation.mutateAsync({
                      problemId: initialValues.id,
                      name,
                      description,
                      solution,
                      tagIds: tags.map((tag) => tag.value),
                      difficulty,
                  });
                  router.push(pageHrefs.problem(result.id));
              });

    useWarnIfUnsavedChanges(isDirty && !isSubmitting);

    const onDifficultyChange = (difficulty: ProblemDifficulty) => setValue('difficulty', difficulty);

    return (
        <StyledFormCard>
            <Form onSubmit={onSubmit}>
                <Stack direction="column" gap="12px" justifyItems="flex-start">
                    <FormInput
                        {...register('name')}
                        label={tr('Name')}
                        autoComplete="off"
                        flat="bottom"
                        error={errors.name}
                    />

                    <QueryResolver queries={[tagQuery]}>
                        {([tags]) => (
                            <Autocomplete
                                label={tr('Tags')}
                                options={entitiesToOptions(tags)}
                                multiple
                                value={entitiesToOptions(initialValues?.tags)}
                                createNewOption={newTag}
                                onChange={(data: Option[]) =>
                                    setValue(
                                        'tags',
                                        data.map((item) => ({ value: item.value, name: item.text })),
                                    )
                                }
                                placeholder={tr('Tags')}
                            />
                        )}
                    </QueryResolver>
                    <CodeEditorField
                        disableAttaches
                        name="description"
                        label={tr('Description')}
                        control={control}
                        options={validationRules.nonEmptyString}
                        placeholder={descriptionPlaceholder}
                    />
                    <CodeEditorField
                        disableAttaches
                        name="solution"
                        label={tr('Solution')}
                        control={control}
                        options={validationRules.nonEmptyString}
                        placeholder={solutionPlaceholder}
                    />
                    <Select
                        options={difficultyOption}
                        value={watch('difficulty')}
                        onChange={onDifficultyChange}
                        text={tr('Problem difficulty')}
                    />
                    {errors.difficulty && !watch('difficulty') && (
                        <StyledErrorText size="xs" color={danger0}>
                            {errors.difficulty.message}
                        </StyledErrorText>
                    )}
                </Stack>
                <FormActions flat="top">
                    <FormAction left inline></FormAction>
                    <FormAction right inline>
                        <Button type="submit" outline view="primary" disabled={isSubmitting} text={tr('Save')} />
                    </FormAction>
                </FormActions>
            </Form>
        </StyledFormCard>
    );
};
