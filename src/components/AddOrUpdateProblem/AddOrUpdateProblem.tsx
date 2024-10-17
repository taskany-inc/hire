import { useCallback, useState } from 'react';
import { useForm, DefaultValues } from 'react-hook-form';
import { useRouter } from 'next/router';
import { Tag, ProblemDifficulty } from '@prisma/client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { danger0, gray8 } from '@taskany/colors';
import {
    Button,
    Badge,
    Text,
    FormControl,
    FormControlInput,
    FormControlLabel,
    FormControlError,
    Card,
    CardContent,
} from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

import { useProblemCreateMutation, useProblemUpdateMutation } from '../../modules/problemHooks';
import { pageHrefs, Paths } from '../../utils/paths';
import { useTagCreateMutation, useTags } from '../../modules/tagHooks';
import { entitiesToOptions, difficultyOption } from '../../utils';
import { Option } from '../../utils/types';
import { useWarnIfUnsavedChanges } from '../../hooks/useWarnIfUnsavedChanges';
import { CreateProblem } from '../../modules/problemTypes';
import { validationRules } from '../../utils/validationRules';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { CodeEditorField } from '../CodeEditorField/CodeEditorField';
import { Select } from '../Select';
import { Autocomplete } from '../Autocomplete/Autocomplete';
import { FormActions } from '../FormActions/FormActions';
import { useUploadNotifications } from '../../modules/attachHooks';
import { getFileIdFromPath } from '../../utils/fileUpload';
import { defaultAttachFormatter, File } from '../../utils/attachFormatter';

import s from './AddOrUpdateProblem.module.css';
import { tr } from './AddOrUpdateProblem.i18n';

type FormData = Omit<CreateProblem, 'tagIds'> & {
    tags: { name: string; value: number }[];
};

export type AddOrUpdateProblemInitialValues = DefaultValues<FormData> & {
    id: number;
    tags: Tag[];
};

interface AddOrUpdateProblemProps {
    variant: 'new' | 'update';
    initialValues?: AddOrUpdateProblemInitialValues;
}

const schema = z.object({
    description: z.string({ required_error: tr('Obligatory field') }),
    solution: z.string({ required_error: tr('Obligatory field') }),
    name: z.string().min(3, tr('Name cannot be less than 3 characters')),
    difficulty: z.nativeEnum(ProblemDifficulty, {
        invalid_type_error: tr('Obligatory field'),
        required_error: tr('Select difficulty'),
    }),
    attachIds: z.string().array(),
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
    const { onUploadSuccess, onUploadFail } = useUploadNotifications();

    const [attachIds, setAttachIds] = useState<string[]>((initialValues?.attachIds ?? []) as string[]);

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
            attachIds,
            tags:
                initialValues?.tags?.map((tag: Tag) => ({
                    name: tag.name,
                    value: tag.id,
                })) || [],
        },
        resolver: zodResolver(schema),
    });
    const attachFormatter = useCallback((files: File[]) => {
        const ids = files.map((file) => getFileIdFromPath(file.filePath));
        setAttachIds((prev) => {
            setValue('attachIds', [...prev, ...ids]);
            return [...prev, ...ids];
        });

        return defaultAttachFormatter(files);
    }, []);

    const onSubmit =
        variant === 'new'
            ? handleSubmit(async ({ name, tags, description, solution, difficulty, attachIds }) => {
                  const result = await problemCreateMutation.mutateAsync({
                      name,
                      description,
                      solution,
                      tagIds: tags.map((tag) => tag.value),
                      difficulty,
                      attachIds,
                  });
                  router.push(pageHrefs.problem(result.id));
              })
            : handleSubmit(async ({ name, tags, description, solution, difficulty, attachIds }) => {
                  if (!initialValues) return;
                  const result = await problemUpdateMutation.mutateAsync({
                      problemId: initialValues.id,
                      name,
                      description,
                      solution,
                      tagIds: tags.map((tag) => tag.value),
                      difficulty,
                      archived: initialValues.archived,
                      attachIds,
                  });
                  router.push(pageHrefs.problem(result.id));
              });

    useWarnIfUnsavedChanges(isDirty && !isSubmitting);

    const onDifficultyChange = (difficulty: ProblemDifficulty) => setValue('difficulty', difficulty);

    return (
        <form onSubmit={onSubmit}>
            <Card>
                <CardContent className={s.AddOrUpdateProblemFormCard}>
                    <FormControl style={{ width: '100%' }}>
                        <FormControlLabel>{tr('Name')}</FormControlLabel>
                        <FormControlInput {...register('name')} autoComplete="off" />
                        {nullable(errors.name, (e) => (
                            <FormControlError error={e} />
                        ))}
                    </FormControl>

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
                        passedError={errors.description}
                        name="description"
                        label={tr('Description')}
                        control={control}
                        options={validationRules.nonEmptyString}
                        placeholder={descriptionPlaceholder}
                        onUploadSuccess={onUploadSuccess}
                        onUploadFail={onUploadFail}
                        uploadLink={Paths.ATTACH}
                        attachFormatter={attachFormatter}
                    />
                    <CodeEditorField
                        passedError={errors.solution}
                        name="solution"
                        label={tr('Solution')}
                        control={control}
                        options={validationRules.nonEmptyString}
                        placeholder={solutionPlaceholder}
                        onUploadSuccess={onUploadSuccess}
                        onUploadFail={onUploadFail}
                        uploadLink={Paths.ATTACH}
                        attachFormatter={attachFormatter}
                    />
                    <Text as="label" weight="semiBold">
                        <Select
                            items={difficultyOption}
                            onChange={(id) => onDifficultyChange(id as ProblemDifficulty)}
                            renderTrigger={({ ref, onClick }) => (
                                <Badge
                                    color={gray8}
                                    onClick={() => onClick()}
                                    size="m"
                                    ref={ref}
                                    text={tr('Problem difficulty')}
                                />
                            )}
                        />
                        {watch('difficulty')}
                    </Text>
                    {errors.difficulty && !watch('difficulty') && (
                        <Text size="xs" color={danger0} className={s.AddOrUpdateProblemErrorText}>
                            {errors.difficulty.message}
                        </Text>
                    )}

                    <FormActions>
                        <Button type="submit" view="primary" disabled={isSubmitting} text={tr('Save')} />
                    </FormActions>
                </CardContent>
            </Card>
        </form>
    );
};
