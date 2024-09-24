import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { ComponentProps, useCallback, useState } from 'react';
import { Candidate } from '@prisma/client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { nullable } from '@taskany/bricks';
import { Button, Card, CardContent, FormControl, FormControlLabel, FormControlError } from '@taskany/bricks/harmony';

import { generatePath, Paths } from '../../utils/paths';
import { CreateInterview } from '../../modules/interviewTypes';
import { useInterviewCreateMutation } from '../../modules/interviewHooks';
import { CodeEditorField } from '../CodeEditorField/CodeEditorField';
import { CandidateNameSubtitle } from '../CandidateNameSubtitle/CandidateNameSubtitle';
import { AddInlineTrigger } from '../AddInlineTrigger/AddInlineTrigger';
import { useUploadNotifications } from '../../modules/attachHooks';
import { defaultAttachFormatter, File } from '../../utils/attachFormatter';
import { getFileIdFromPath } from '../../utils/fileUpload';
import { AddVacancyToInterview } from '../AddVacancyToInterview/AddVacancyToInterview';
import { Vacancy } from '../../modules/crewTypes';
import { CvAttach } from '../CvAttach/CvAttach';
import { cvParsingResultToDescription } from '../../utils/aiAssistantUtils';
import { useAllowedHireStreams } from '../../modules/hireStreamsHooks';
import { Select } from '../Select';
import { FormActions } from '../FormActions/FormActions';

import { tr } from './CandidateInterviewCreationForm.i18n';
import s from './CandidateInterviewCreationForm.module.css';

type InterviewCreationFormData = Omit<CreateInterview, 'candidateId'>;

interface Props {
    candidate: Candidate;
    preparedCvAttach?: { id: string; filename: string };
}

const schema = z.object({
    hireStreamId: z.number({
        invalid_type_error: tr('Select hire stream'),
        required_error: tr('Select hire stream'),
    }),
    description: z.string().nullish(),
});

export function CandidateInterviewCreationForm({ candidate, preparedCvAttach }: Props) {
    const router = useRouter();
    const interviewCreateMutation = useInterviewCreateMutation();
    const [attachIds, setAttachIds] = useState<string[]>([]);
    const [cvAttachId, setCvAttachId] = useState(preparedCvAttach?.id);
    const [vacancy, setVacancy] = useState<Vacancy>();

    const { onUploadSuccess, onUploadFail } = useUploadNotifications();

    const hireStreamsQuery = useAllowedHireStreams();

    const createInterview: SubmitHandler<InterviewCreationFormData> = useCallback(
        async ({ description, hireStreamId }) => {
            const interview = await interviewCreateMutation.mutateAsync({
                description,
                hireStreamId,
                candidateId: candidate.id,
                attachIds,
                cvAttachId,
                crewVacancyId: vacancy?.id,
            });
            router.push(generatePath(Paths.INTERVIEW, { interviewId: interview.id }));
        },
        [candidate.id, interviewCreateMutation, router, attachIds, cvAttachId, vacancy?.id],
    );

    const {
        control,
        watch,
        getValues,
        setValue,
        handleSubmit,
        formState: { isSubmitting, isSubmitSuccessful, errors },
    } = useForm<InterviewCreationFormData>({
        resolver: zodResolver(schema),
    });

    const onHireStreamIdChange = (hireStreamId: number) => setValue('hireStreamId', hireStreamId);

    const attachFormatter = useCallback((files: File[]) => {
        const ids = files.map((file) => getFileIdFromPath(file.filePath));
        setAttachIds((prev) => [...prev, ...ids]);
        return defaultAttachFormatter(files);
    }, []);

    const onCvParse = useCallback<ComponentProps<typeof CvAttach>['onParse']>(
        (attach, parsedData) => {
            setCvAttachId(attach.id);
            const oldDescription = getValues('description') || '';
            setValue('description', `${oldDescription}${cvParsingResultToDescription(parsedData)}`);
        },
        [getValues, setValue],
    );

    return (
        <form onSubmit={handleSubmit(createInterview)}>
            <Card className={s.CandidateInterviewCreationForm}>
                <CardContent className={s.CandidateInterviewCreationFormCardContent}>
                    <CandidateNameSubtitle name={candidate.name} />

                    <CodeEditorField
                        name="description"
                        label={tr('Comment')}
                        control={control}
                        placeholder={tr('Think carefully and write a couple of notes about this interview.')}
                        height={130}
                        uploadLink={Paths.ATTACH}
                        onUploadSuccess={onUploadSuccess}
                        onUploadFail={onUploadFail}
                        attachFormatter={attachFormatter}
                    />

                    <FormControl>
                        <FormControlLabel>{tr('Hire stream')}</FormControlLabel>
                        <Select
                            items={
                                hireStreamsQuery.data?.map((stream) => ({
                                    text: stream.name,
                                    id: String(stream.id),
                                })) || []
                            }
                            onChange={(id) => onHireStreamIdChange(Number(id))}
                            renderTrigger={({ ref, onClick }) =>
                                nullable(
                                    hireStreamsQuery.data?.find(({ id }) => Number(id) === watch('hireStreamId'))?.name,
                                    (title) => <Button onClick={onClick} ref={ref} text={title} />,
                                    <AddInlineTrigger onClick={onClick} ref={ref} text={tr('Choose hire stream')} />,
                                )
                            }
                        />
                        {nullable(errors.hireStreamId, (e) => (
                            <FormControlError error={e} />
                        ))}
                    </FormControl>

                    <AddVacancyToInterview onSelect={setVacancy} />

                    <CvAttach candidateId={candidate.id} preparedCvAttach={preparedCvAttach} onParse={onCvParse} />

                    <FormActions>
                        <Button
                            view="primary"
                            type="submit"
                            text={tr('Add interview')}
                            disabled={isSubmitting || isSubmitSuccessful}
                        />
                    </FormActions>
                </CardContent>
            </Card>
        </form>
    );
}
