import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { ComponentProps, useCallback, useState } from 'react';
import { Candidate } from '@prisma/client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { danger0, gray9 } from '@taskany/colors';
import { Fieldset, Form, FormAction, FormActions, FormCard, nullable, Text } from '@taskany/bricks';
import { Badge, Button } from '@taskany/bricks/harmony';

import { generatePath, Paths } from '../../utils/paths';
import { CreateInterview } from '../../modules/interviewTypes';
import { useInterviewCreateMutation } from '../../modules/interviewHooks';
import { CodeEditorField } from '../CodeEditorField/CodeEditorField';
import { CandidateNameSubtitle } from '../CandidateNameSubtitle/CandidateNameSubtitle';
import { Stack } from '../Stack';
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
        <Stack direction="column" gap={14}>
            <CandidateNameSubtitle name={candidate.name} />

            <FormCard className={s.CandidateInterviewCreationFormFormCard}>
                <Form onSubmit={handleSubmit(createInterview)}>
                    <Fieldset>
                        <CodeEditorField
                            className={s.CodeEditorField}
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

                        <CvAttach candidateId={candidate.id} preparedCvAttach={preparedCvAttach} onParse={onCvParse} />

                        <div className={s.SelectWrapper}>
                            <Text weight="bold" color={gray9} as="label">
                                {tr('Hire stream')}
                            </Text>

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
                                        hireStreamsQuery.data?.find(({ id }) => Number(id) === watch('hireStreamId'))
                                            ?.name,
                                        (title) => <Badge onClick={onClick} ref={ref} text={title} />,
                                        <AddInlineTrigger onClick={onClick} ref={ref} text="Choose hire stream" />,
                                    )
                                }
                            />
                        </div>
                        {errors.hireStreamId && !watch('hireStreamId') && (
                            <Text size="xs" color={danger0}>
                                {errors.hireStreamId.message}
                            </Text>
                        )}
                        <div className={s.CandidateInterviewCreationFormVacancyWrapper}>
                            <AddVacancyToInterview vacancyId={vacancy?.id} onSelect={setVacancy} />
                        </div>
                    </Fieldset>
                    <FormActions flat="top">
                        <FormAction left inline></FormAction>
                        <FormAction right inline>
                            <Button
                                view="primary"
                                type="submit"
                                text={tr('Add interview')}
                                disabled={isSubmitting || isSubmitSuccessful}
                            />
                        </FormAction>
                    </FormActions>
                </Form>
            </FormCard>
        </Stack>
    );
}
