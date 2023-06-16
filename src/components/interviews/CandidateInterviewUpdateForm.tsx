import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { HireStream } from '@prisma/client';

import { FormContainer } from '../FormContainer/FormContainer';
import { pageHrefs } from '../../utils/paths';
import { InterviewWithRelations, UpdateInterview } from '../../backend/modules/interview/interview-types';
import { useInterviewUpdateMutation } from '../../hooks/interview-hooks';
import { CodeEditorField } from '../inputs/CodeEditorField';
import { CandidateNameSubtitle } from '../candidates/CandidateNameSubtitle';
import { Stack } from '../layout/Stack';
import { DropdownFieldOption } from '../inputs/DropdownField';
import { Option } from '../../types';
import { Select } from '../Select';

import { useProductFinalSectionDropdownOptions } from './utils/candidate-selected-section-hooks';

type InterviewUpdateFormData = Omit<UpdateInterview, 'candidateId' | 'candidateSelectedSectionId' | 'hireStreamId'> & {
    candidate: Option;
    candidateSelectedSectionId: number | -1;
    hireStreamId: number | -1;
};

interface Props {
    interview: InterviewWithRelations;
    hireStreams: HireStream[];
}

// TODO: disable return value linting
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function CandidateInterviewUpdateForm({ interview, hireStreams }: Props) {
    const router = useRouter();
    const interviewUpdateMutation = useInterviewUpdateMutation();

    const hireStreamOptions = useMemo<DropdownFieldOption<number>[]>(
        () =>
            hireStreams.map(({ id, name }) => ({
                text: name,
                value: id,
            })),
        [hireStreams],
    );

    const { candidate } = interview;

    const updateInterview: SubmitHandler<InterviewUpdateFormData> = useCallback(
        async ({ description, candidateSelectedSectionId, hireStreamId }) => {
            await interviewUpdateMutation.mutateAsync({
                data: {
                    interviewId: interview.id,
                    description,
                    candidateSelectedSectionId: candidateSelectedSectionId < 0 ? null : candidateSelectedSectionId,
                    hireStreamId,
                },
            });

            router.push(pageHrefs.interview(interview.id));
        },
        [interview.id, interviewUpdateMutation, router],
    );

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { isSubmitting },
    } = useForm<InterviewUpdateFormData>({
        defaultValues: {
            description: interview.description ?? '',
            candidateSelectedSectionId: interview.candidateSelectedSection?.id ?? -1,
            hireStreamId: interview.hireStreamId ?? undefined,
        },
    });

    const productFinalSectionOptions = useProductFinalSectionDropdownOptions(interview.sections);

    const onHireStreamIdChange = (hireStreamId: number) => setValue('hireStreamId', hireStreamId);
    const onProductFinalSectionChange = (sectionId: number) => setValue('candidateSelectedSectionId', sectionId);

    return (
        <Stack direction="column" gap={14}>
            <CandidateNameSubtitle name={candidate.name} id={candidate.id} />

            <FormContainer
                submitButtonText="Save interview"
                onSubmitButton={handleSubmit(updateInterview)}
                submitButtonDisabled={isSubmitting}
            >
                <Stack direction="column" gap={20}>
                    <CodeEditorField
                        name="description"
                        label="Comment"
                        control={control}
                        placeholder="Think carefully and write a couple of notes about this interview."
                        height={130}
                    />

                    <Select
                        value={watch('hireStreamId')}
                        text="Hire strieam"
                        options={hireStreamOptions}
                        onChange={onHireStreamIdChange}
                    />

                    <Select
                        value={watch('candidateSelectedSectionId')}
                        text="Candidate's Chosen Product Final"
                        options={productFinalSectionOptions}
                        onChange={onProductFinalSectionChange}
                    />
                </Stack>
            </FormContainer>
        </Stack>
    );
}
