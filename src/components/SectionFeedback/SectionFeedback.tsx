import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import styled from 'styled-components';
import { Text, Button } from '@taskany/bricks';
import { danger0, gapM, gapS } from '@taskany/colors';

import { useSectionUpdateMutation } from '../../modules/sectionHooks';
import { InterviewEventTypes } from '../../modules/interviewEventTypes';
import { SectionWithRelationsAndResults, UpdateSection } from '../../modules/sectionTypes';
import { generatePath, pageHrefs, Paths } from '../../utils/paths';
import { accessChecks } from '../../modules/accessChecks';
import { LocalStorageManager, useSectionFeedbackPersisting } from '../../utils/localStorageManager';
import { useSession } from '../../contexts/appSettingsContext';
import { useUploadNotifications } from '../../modules/attachHooks';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { Confirmation, useConfirmation } from '../Confirmation/Confirmation';
import { Stack } from '../Stack';
import { GradeButton } from '../GradeButton';
import { CodeEditorField } from '../CodeEditorField/CodeEditorField';
import { HireButtons } from '../HireButtons/HireButtons';
import { SectionFeedbackHireBadge } from '../SectionFeedbackHireBadge/SectionFeedbackHireBadge';
import { SectionAttach } from '../SectionAttach/SectionAttach';

import { tr } from './SectionFeedback.i18n';

type SectionFeedbackProps = {
    section: SectionWithRelationsAndResults;
    isEditable: boolean;
    candidateId: number;
};

const StyledErrorText = styled(Text)`
    padding: ${gapS};
`;

const StyledMarkdownRenderer = styled(MarkdownRenderer)`
    margin-top: ${gapM};
    max-width: 900px;
    overflow: auto;
`;

const StyledButton = styled(Button)`
    margin: ${gapM} 0;
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

    const { onUploadSuccess, onUploadFail } = useUploadNotifications();

    const router = useRouter();
    const { interviewId } = section;

    const session = useSession();
    const sectionUpdateMutation = useSectionUpdateMutation();

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
            feedback: section.feedback,
            grade: section.hire ? section.grade : null,
        },
        resolver: zodResolver(schema),
    });

    const { stopPersistingFeedback } = useSectionFeedbackPersisting(
        section,
        useCallback(() => getValues('feedback'), [getValues]),
    );
    const canEditAttach = session && accessChecks.section.attachFile(session, section).allowed;

    useEffect(() => {
        // TODO: use useLocalStorage from bricks after https://github.com/taskany-inc/bricks/issues/553
        const localStorageFeedback = LocalStorageManager.getPersistedSectionFeedback(section.id);
        if (localStorageFeedback) setValue('feedback', localStorageFeedback);
    }, []);

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

    const setHire = (value: boolean | null) => {
        setValue('hire', value);
    };

    const setGrade = (value: string | null) => {
        setValue('grade', value);
    };

    const editButtonTitle = editMode ? tr('Cancel') : tr('Edit');

    return (
        <>
            <form>
                <Stack direction="column" style={{ marginTop: 12 }} justifyItems="flex-start" gap="8px">
                    {isEditable ? (
                        <div>
                            <HireButtons section={section} setHire={setHire} setGrade={setGrade} />
                            {errors.hire && watch('hire') === null && (
                                <StyledErrorText color={danger0}>{errors.hire.message}</StyledErrorText>
                            )}
                        </div>
                    ) : (
                        <div style={{ marginLeft: '-1em' }}>
                            <Stack direction="row" gap="8px" justifyContent="flex-start" align="center">
                                <SectionFeedbackHireBadge hire={section.hire} />
                                {section.grade && (
                                    <>
                                        {tr('Grade:')}{' '}
                                        <GradeButton type="button" matching>
                                            {section.grade}
                                        </GradeButton>
                                    </>
                                )}
                            </Stack>
                        </div>
                    )}

                    {isEditable && editMode ? (
                        <CodeEditorField
                            style={{ width: '900px' }}
                            onUploadSuccess={onUploadSuccess}
                            onUploadFail={onUploadFail}
                            name="feedback"
                            control={control}
                            uploadLink={pageHrefs.attachSection(section.id)}
                            placeholder={tr('Describe your impressions of the candidate')}
                        />
                    ) : (
                        <StyledMarkdownRenderer
                            style={{ width: '900px' }}
                            value={section.feedback || watch('feedback') || ''}
                        />
                    )}

                    {isEditable && editMode && (
                        <StyledButton
                            type="button"
                            outline
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
                </>
            )}
            <Confirmation {...sendFeedbackConfirmation.props} />
        </>
    );
};
