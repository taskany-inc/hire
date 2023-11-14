import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { HireStream } from '@prisma/client';

import { pageHrefs } from '../../utils/paths';
import { InterviewWithRelations, UpdateInterview } from '../../modules/interviewTypes';
import { useInterviewUpdateMutation } from '../../modules/interviewHooks';
import { Option } from '../../utils/types';
import { useProductFinalSectionDropdownOptions } from '../../modules/candidateSelectedSectionHooks';
import { FormContainer } from '../FormContainer';
import { CodeEditorField } from '../CodeEditorField/CodeEditorField';
import { CandidateNameSubtitle } from '../CandidateNameSubtitle';
import { Stack } from '../Stack';
import { DropdownFieldOption } from '../DropdownField';
import { Select } from '../Select';

import { tr } from './CandidateInterviewUpdateForm.i18n';

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
                submitButtonText={tr('Save interview')}
                onSubmitButton={handleSubmit(updateInterview)}
                submitButtonDisabled={isSubmitting}
            >
                <Stack direction="column" gap={20}>
                    <CodeEditorField
                        disableAttaches
                        name="description"
                        label={tr('Comment')}
                        control={control}
                        placeholder={tr('Think carefully and write a couple of notes about this interview.')}
                        height={130}
                    />

                    <Select
                        value={watch('hireStreamId')}
                        text={tr('Hire stream')}
                        options={hireStreamOptions}
                        onChange={onHireStreamIdChange}
                    />

                    <Select
                        value={watch('candidateSelectedSectionId')}
                        text={tr("Candidate's Chosen Product Final")}
                        options={productFinalSectionOptions}
                        onChange={onProductFinalSectionChange}
                    />
                </Stack>
            </FormContainer>
        </Stack>
    );
}
