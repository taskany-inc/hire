import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { ComponentProps, useCallback, useState } from 'react';
import { HireStream } from '@prisma/client';
import { nullable } from '@taskany/bricks';
import { Button, Card, CardContent, FormControl, FormControlLabel } from '@taskany/bricks/harmony';

import { pageHrefs } from '../../utils/paths';
import { AddInlineTrigger } from '../AddInlineTrigger/AddInlineTrigger';
import { InterviewWithRelations, UpdateInterview } from '../../modules/interviewTypes';
import { useInterviewUpdateMutation } from '../../modules/interviewHooks';
import { Option } from '../../utils/types';
import { useProductFinalSectionDropdownOptions } from '../../modules/candidateSelectedSectionHooks';
import { CodeEditorField } from '../CodeEditorField/CodeEditorField';
import { CandidateNameSubtitle } from '../CandidateNameSubtitle/CandidateNameSubtitle';
import { Select } from '../Select';
import { AddVacancyToInterview } from '../AddVacancyToInterview/AddVacancyToInterview';
import { CvAttach } from '../CvAttach/CvAttach';
import { cvParsingResultToDescription } from '../../utils/aiAssistantUtils';
import { FormActions } from '../FormActions/FormActions';

import { tr } from './CandidateInterviewUpdateForm.i18n';
import s from './CandidateInterviewUpdateForm.module.css';

type InterviewUpdateFormData = Omit<UpdateInterview, 'candidateId' | 'candidateSelectedSectionId' | 'hireStreamId'> & {
    candidate: Option;
    candidateSelectedSectionId: number | -1;
    hireStreamId: number | -1;
};

interface CandidateInterviewUpdateFormProps {
    interview: InterviewWithRelations;
    hireStreams: HireStream[];
}

export function CandidateInterviewUpdateForm({ interview, hireStreams }: CandidateInterviewUpdateFormProps) {
    const router = useRouter();
    const interviewUpdateMutation = useInterviewUpdateMutation();

    const [cvAttachId, setCvAttachId] = useState<string>();
    const [vacancyId, setVacancyId] = useState(interview.crewVacancyId);

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
        <form onSubmit={handleSubmit(updateInterview)}>
            <Card className={s.CandidateInterviewUpdateForm}>
                <CardContent className={s.CandidateInterviewUpdateFormCardContent}>
                    <CandidateNameSubtitle name={candidate.name} id={candidate.id} />

                    <FormControl>
                        <FormControlLabel>{tr('Hire stream')}</FormControlLabel>
                        <Select
                            items={hireStreams.map((stream) => ({ text: stream.name, id: String(stream.id) }))}
                            onChange={(id) => onHireStreamIdChange(Number(id))}
                            renderTrigger={({ ref, onClick }) =>
                                nullable(
                                    hireStreams?.find(({ id }) => Number(id) === watch('hireStreamId'))?.name,
                                    (title) => <Button onClick={onClick} ref={ref} text={title} />,
                                    <AddInlineTrigger onClick={onClick} ref={ref} text={tr('Choose hire stream')} />,
                                )
                            }
                        />
                    </FormControl>

                    <FormControl>
                        <FormControlLabel>{tr("Candidate's Chosen Product Final")}</FormControlLabel>
                        <Select
                            items={productFinalSectionOptions.map((option) => ({
                                ...option,
                                id: String(option.id),
                            }))}
                            onChange={(id) => onProductFinalSectionChange(Number(id))}
                            renderTrigger={({ ref, onClick }) => (
                                <Button
                                    onClick={onClick}
                                    ref={ref}
                                    text={
                                        productFinalSectionOptions.find(
                                            ({ id }) => Number(id) === watch('candidateSelectedSectionId'),
                                        )?.text
                                    }
                                />
                            )}
                        />
                    </FormControl>

                    <AddVacancyToInterview
                        vacancyId={vacancyId}
                        onSelect={(vacancy) => setVacancyId(vacancy?.id ?? null)}
                    />

                    <CvAttach candidateId={candidate.id} onParse={onCvParse} />

                    <CodeEditorField
                        disableAttaches
                        name="description"
                        control={control}
                        placeholder={tr('Think carefully and write a couple of notes about this interview.')}
                        height={130}
                    />

                    <FormActions>
                        <Button
                            disabled={isSubmitting}
                            size="s"
                            view="primary"
                            type="submit"
                            text={tr('Save interview')}
                        />
                    </FormActions>
                </CardContent>
            </Card>
        </form>
    );
}
