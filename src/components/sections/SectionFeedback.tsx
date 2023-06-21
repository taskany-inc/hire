import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { FileWithPath } from 'react-dropzone';
import styled from 'styled-components';
import { Text, Button } from '@taskany/bricks';

import { useSectionUpdateMutation } from '../../hooks/section-hooks';
import { CodeEditorField } from '../inputs/CodeEditorField';
import { InterviewEventTypes } from '../../backend/modules/interview-event/interview-event-types';
import { SectionWithRelationsAndResults, UpdateSection } from '../../backend/modules/section/section-types';
import { generatePath, Paths } from '../../utils/paths';
import { accessChecks } from '../../backend/access/access-checks';
import { LocalStorageManager, useSectionFeedbackPersisting } from '../../utils/local-storage-manager';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { useSession } from '../../contexts/app-settings-context';
import { Confirmation, useConfirmation } from '../Confirmation';
import { Stack } from '../layout/Stack';
import { GradeButton } from '../GradeButton';
import { useAttachesCreateMutation } from '../../api/attach/attach-hooks';
import { HireButtons } from '../HireButtons';
import { Spinner } from '../Spinner';
import { FormHelperText } from '../FormInput/StyledComponents';

import { SectionFeedbackHireBadge } from './SectionFeedbackHireBadge';
import { DropScreenshot } from './DropScreenshot';
import { SectionAttach } from './SectionAttach';

import { tr } from './sections.i18n';

type SectionFeedbackProps = {
    section: SectionWithRelationsAndResults;
    isEditable: boolean;
    candidateId: number;
};

const StyledMarkdownRenderer = styled(MarkdownRenderer)`
    margin-top: 14px;
    max-width: 900px;
    overflow: auto;
`;

const StyledButton = styled(Button)`
    margin: 12px 0;
`;

const schema = z.object({
    hire: z.boolean({
        invalid_type_error: tr('Decide on a candidate'),
        required_error: tr('Decide on a candidate'),
    }),
    grade: z.string().nullish(),
    feedback: z.string().min(1, {
        message: tr("Mandatory field, fill in the candidate's impressions"),
    }),
});

export const SectionFeedback = ({ section, isEditable }: SectionFeedbackProps): JSX.Element => {
    const [editMode, setEditMode] = useState<boolean>(section.hire === null);

    const router = useRouter();
    const { interviewId } = router.query;

    const session = useSession();
    const sectionUpdateMutation = useSectionUpdateMutation();
    const attachesCreateMutation = useAttachesCreateMutation();

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        getValues,
        formState: { isSubmitting, isSubmitSuccessful, errors },
    } = useForm<UpdateSection>({
        defaultValues: {
            hire: section.hire,
            feedback: section.feedback ?? LocalStorageManager.getPersistedSectionFeedback(section.id) ?? '',
            grade: section.hire ? section.grade : null,
        },
        resolver: zodResolver(schema),
    });

    const onDrop = useCallback(
        async (acceptedFiles: FileWithPath[]) => {
            const file = acceptedFiles[0];
            const formData = new FormData();
            formData.append('data', file);
            const attach = await attachesCreateMutation.mutateAsync({
                sectionId: section.id,
                formData,
            });
            const feedback = getValues('feedback');
            const newFeedback = `${feedback} \n ![${attach.filename}](/api/attach/${attach.id})`;
            setValue('feedback', newFeedback);
        },
        [attachesCreateMutation, getValues, section.id, setValue],
    );

    const { stopPersistingFeedback } = useSectionFeedbackPersisting(
        section,
        useCallback(() => getValues('feedback'), [getValues]),
    );
    const canEditAttach = session && accessChecks.section.attachFile(session, section).allowed;

    const onSubmit = handleSubmit(async (values) => {
        const interviewerId = section.interviewer.id;
        const sectionId = section.id;

        const feedback = values.feedback ?? section.feedback;
        const hire = !feedback ? null : values.hire ?? section.hire ?? false;
        const grade = values.grade ?? section.grade;

        return sectionUpdateMutation
            .mutateAsync({
                data: {
                    sectionId,
                    interviewId: Number(interviewId),
                    hire,
                    interviewerId,
                    feedback,
                    grade,
                    sendHrMail: section.hire === null,
                },
                metadata: {
                    eventsType: InterviewEventTypes.SET_SECTION_FEEDBACK,
                },
            })
            .then(() => {
                stopPersistingFeedback();

                router.push({
                    pathname: generatePath(Paths.INTERVIEW, {
                        interviewId: Number(interviewId),
                    }),
                });
            });
    });

    const sendFeedbackConfirmation = useConfirmation({
        message: tr('Send feedback?'),
        description: !section.feedback ? tr('HR will receive a notification about the completed feedback') : undefined,
        onAgree: onSubmit,
    });

    const grade = Number(section.grade?.slice(1));

    const setHire = (value: boolean | null) => {
        setValue('hire', value);
    };

    const setGrade = (value: string | null) => {
        setValue('grade', value);
    };

    const editButtonTitle = editMode ? tr('Cancel') : tr('Edit');

    return (
        <>
            <form style={{ width: '90%' }}>
                <Stack direction="column" style={{ marginTop: 12 }} justifyItems="flex-start" gap="8px">
                    {isEditable ? (
                        <div>
                            <HireButtons section={section} setHire={setHire} setGrade={setGrade} />
                            {errors.hire && watch('hire') === null && (
                                <FormHelperText>{errors.hire.message}</FormHelperText>
                            )}
                        </div>
                    ) : (
                        <div style={{ marginLeft: '-1em' }}>
                            <Stack direction="row" gap="8px" justifyContent="flex-start" align="center">
                                <SectionFeedbackHireBadge hire={section.hire} />
                                {!Number.isNaN(grade) && (
                                    <>
                                        {tr('Grade:')}{' '}
                                        <GradeButton type="button" matching>
                                            {grade}
                                        </GradeButton>
                                    </>
                                )}
                            </Stack>
                        </div>
                    )}

                    {isEditable && editMode ? (
                        <CodeEditorField
                            name="feedback"
                            control={control}
                            height={200}
                            placeholder={tr('Describe your impressions of the candidate')}
                        />
                    ) : (
                        <StyledMarkdownRenderer value={section.feedback || watch('feedback') || ''} />
                    )}

                    {isEditable && editMode && (
                        <StyledButton
                            type="button"
                            view="primary"
                            disabled={isSubmitting || isSubmitSuccessful}
                            onClick={section.hire === null ? sendFeedbackConfirmation.show : onSubmit}
                            text={section.feedback ? tr('Save') : tr('Send feedback')}
                        />
                    )}

                    {isEditable && section.hire !== null && (
                        <Button
                            type="button"
                            view={editMode ? 'default' : 'primary'}
                            onClick={() => {
                                if (editMode) {
                                    setValue('feedback', section.feedback);
                                }
                                setEditMode(!editMode);
                            }}
                            text={editButtonTitle}
                        />
                    )}
                </Stack>
            </form>

            {isEditable && canEditAttach && editMode && <DropScreenshot onDrop={onDrop} />}

            {section.attaches.length > 0 && (
                <>
                    <Text size="l">Attaches:</Text>
                    {section.attaches.map((attach: any) => (
                        <SectionAttach
                            fileId={attach.id}
                            filename={attach.filename}
                            canEditAttach={!!canEditAttach}
                            key={attach.id}
                        />
                    ))}
                    {attachesCreateMutation.isLoading && (
                        <div style={{ width: '50%', height: '50%' }}>
                            <Spinner />
                        </div>
                    )}
                </>
            )}
            <Confirmation {...sendFeedbackConfirmation.props} />
        </>
    );
};
