import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { Candidate, HireStream } from '@prisma/client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { danger0 } from '@taskany/colors';
import styled from 'styled-components';
import { Button, Fieldset, Form, FormAction, FormActions, FormCard, Text } from '@taskany/bricks';

import { generatePath, Paths } from '../../utils/paths';
import { CreateInterview } from '../../modules/interviewTypes';
import { useInterviewCreateMutation } from '../../modules/interviewHooks';
import { CodeEditorField } from '../CodeEditorField/CodeEditorField';
import { CandidateNameSubtitle } from '../CandidateNameSubtitle';
import { Stack } from '../Stack';
import { DropdownFieldOption } from '../DropdownField';
import { Select } from '../Select';

import { tr } from './CandidateInterviewCreationForm.i18n';

const StyledFormCard = styled(FormCard)`
    width: 500px;
`;

type InterviewCreationFormData = Omit<CreateInterview, 'candidateId'>;

interface Props {
    candidate: Candidate;
    hireStreams: HireStream[];
}

const schema = z.object({
    hireStreamId: z.number({
        invalid_type_error: tr('Select hire stream'),
        required_error: tr('Select hire stream'),
    }),
    description: z.string().nullish(),
});

// TODO: disable return value linting
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function CandidateInterviewCreationForm({ candidate, hireStreams }: Props) {
    const router = useRouter();
    const interviewCreateMutation = useInterviewCreateMutation();

    const hireStreamOptions = useMemo<DropdownFieldOption<number>[]>(
        () =>
            hireStreams.map(({ id, name }) => ({
                text: name,
                value: id,
            })),
        [hireStreams],
    );

    const createInterview: SubmitHandler<InterviewCreationFormData> = useCallback(
        async ({ description, hireStreamId }) => {
            const result = await interviewCreateMutation.mutateAsync({
                description,
                candidateId: candidate.id,
                hireStreamId,
            });
            const interviewId = result.id;

            router.push(generatePath(Paths.INTERVIEW, { interviewId }));
        },
        [candidate.id, interviewCreateMutation, router],
    );

    const {
        control,
        watch,
        setValue,
        handleSubmit,
        formState: { isSubmitting, isSubmitSuccessful, errors },
    } = useForm<InterviewCreationFormData>({
        resolver: zodResolver(schema),
    });

    const onHireStreamIdChange = (hireStreamId: number) => setValue('hireStreamId', hireStreamId);

    return (
        <Stack direction="column" gap={14}>
            <CandidateNameSubtitle name={candidate.name} />

            <StyledFormCard>
                <Form onSubmit={handleSubmit(createInterview)}>
                    <Fieldset>
                        <CodeEditorField
                            name="description"
                            label={tr('Comment')}
                            control={control}
                            placeholder={tr('Think carefully and write a couple of notes about this interview.')}
                            height={130}
                            disableAttaches
                        />

                        <Select
                            options={hireStreamOptions}
                            value={watch('hireStreamId')}
                            onChange={onHireStreamIdChange}
                            text={tr('Hire stream')}
                        />
                        {errors.hireStreamId && !watch('hireStreamId') && (
                            <Text size="xs" color={danger0}>
                                {errors.hireStreamId.message}
                            </Text>
                        )}
                    </Fieldset>
                    <FormActions flat="top">
                        <FormAction left inline></FormAction>
                        <FormAction right inline>
                            <Button
                                size="m"
                                view="primary"
                                type="submit"
                                text={tr('Add interview')}
                                outline
                                disabled={isSubmitting || isSubmitSuccessful}
                            />
                        </FormAction>
                    </FormActions>
                </Form>
            </StyledFormCard>
        </Stack>
    );
}
