import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { ComponentProps, useCallback, useMemo, useState } from 'react';
import { HireStream } from '@prisma/client';
import { Fieldset, Form, FormAction, FormActions, FormCard } from '@taskany/bricks';
import { Button } from '@taskany/bricks/harmony';

import { pageHrefs } from '../../utils/paths';
import { InterviewWithRelations, UpdateInterview } from '../../modules/interviewTypes';
import { useInterviewUpdateMutation } from '../../modules/interviewHooks';
import { Option } from '../../utils/types';
import { useProductFinalSectionDropdownOptions } from '../../modules/candidateSelectedSectionHooks';
import { CodeEditorField } from '../CodeEditorField/CodeEditorField';
import { CandidateNameSubtitle } from '../CandidateNameSubtitle/CandidateNameSubtitle';
import { Stack } from '../Stack';
import { DropdownFieldOption } from '../DropdownField';
import { Select } from '../Select';
import { AddVacancyToInterview } from '../AddVacancyToInterview/AddVacancyToInterview';
import { CvAttach } from '../CvAttach/CvAttach';
import { cvParsingResultToDescription } from '../../utils/aiAssistantUtils';

import { tr } from './CandidateInterviewUpdateForm.i18n';
import s from './CandidateInterviewUpdateForm.module.css';

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

    const [cvAttachId, setCvAttachId] = useState<string>();
    const [vacancyId, setVacancyId] = useState(interview.crewVacancyId);

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
                    cvAttachId,
                    hireStreamId,
                    crewVacancyId: vacancyId,
                },
            });

            router.push(pageHrefs.interview(interview.id));
        },
        [interview.id, interviewUpdateMutation, router, vacancyId, cvAttachId],
    );

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        getValues,
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

    const onCvParse = useCallback<ComponentProps<typeof CvAttach>['onParse']>(
        (attach, parsedData) => {
            setCvAttachId(attach.id);
            const oldDescription = getValues('description');
            setValue('description', `${oldDescription}${cvParsingResultToDescription(parsedData)}`);
        },
        [getValues, setValue],
    );

    return (
        <Stack direction="column" gap={14}>
            <CandidateNameSubtitle name={candidate.name} id={candidate.id} />

            <FormCard className={s.CandidateInterviewUpdateFormFormCard}>
                <Form onSubmit={handleSubmit(updateInterview)}>
                    <Fieldset>
                        <CodeEditorField
                            className={s.CodeEditorField}
                            disableAttaches
                            name="description"
                            label={tr('Comment')}
                            control={control}
                            placeholder={tr('Think carefully and write a couple of notes about this interview.')}
                            height={130}
                        />

                        <CvAttach candidateId={candidate.id} onParse={onCvParse} />

                        <Select
                            value={watch('hireStreamId')}
                            text={tr('Hire stream')}
                            options={hireStreamOptions}
                            onChange={onHireStreamIdChange}
                        />

                        <div className={s.CandidateInterviewUpdateFormVacancyWrapper}>
                            <AddVacancyToInterview
                                vacancyId={vacancyId}
                                onSelect={(vacancy) => setVacancyId(vacancy?.id ?? null)}
                            />
                        </div>

                        <Select
                            value={watch('candidateSelectedSectionId')}
                            text={tr("Candidate's Chosen Product Final")}
                            options={productFinalSectionOptions}
                            onChange={onProductFinalSectionChange}
                        />
                    </Fieldset>
                    <FormActions flat="top">
                        <FormAction left inline></FormAction>
                        <FormAction right inline>
                            <Button
                                disabled={isSubmitting}
                                size="m"
                                view="primary"
                                type="submit"
                                text={tr('Save interview')}
                            />
                        </FormAction>
                    </FormActions>
                </Form>
            </FormCard>
        </Stack>
    );
}
