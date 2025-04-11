import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { nullable } from '@taskany/bricks';
import { Text, Button } from '@taskany/bricks/harmony';
import { Attach } from '@prisma/client';
import {
    IconPhonecallOutline,
    IconSendOutline,
    IconEditOutline,
    IconXCircleOutline,
    IconPlusCircleOutline,
    IconCodeOutline,
} from '@taskany/icons';

import { usePreviewContext } from '../../contexts/previewContext';
import { useSectionCodeSessionCreate, useSectionUpdateMutation } from '../../modules/sectionHooks';
import { SectionWithRelationsAndResults, UpdateSection } from '../../modules/sectionTypes';
import { generatePath, pageHrefs, Paths } from '../../utils/paths';
import { accessChecks } from '../../modules/accessChecks';
import { LocalStorageManager, useSectionFeedbackPersisting } from '../../utils/localStorageManager';
import { useSession } from '../../contexts/appSettingsContext';
import { Confirmation, useConfirmation } from '../Confirmation/Confirmation';
import { CodeEditorField } from '../CodeEditorField/CodeEditorField';
import { HireButtons } from '../HireButtons/HireButtons';
import { SectionFeedbackHireBadge } from '../SectionFeedbackHireBadge/SectionFeedbackHireBadge';
import { SectionAttach } from '../SectionAttach/SectionAttach';
import { Link } from '../Link';
import { useUploadNotifications } from '../../modules/attachHooks';
import Md from '../Md';

import { tr } from './SectionFeedback.i18n';
import s from './SectionFeedback.module.css';

interface SectionFeedbackProps {
    section: SectionWithRelationsAndResults;
    isEditable: boolean;
    candidateId: number;
    hasTasks: boolean;
    showAddProblemButton?: boolean;
}

const schema = z.object({
    hire: z.boolean({
        invalid_type_error: tr('Decide on a candidate'),
        required_error: tr('Decide on a candidate'),
    }),
    grade: z.string().nullish(),
    feedback: z.string().min(1, { message: tr("Mandatory field, fill in the candidate's impressions") }),
});

export const SectionFeedback = ({
    section,
    isEditable,
    hasTasks,
    showAddProblemButton,
}: SectionFeedbackProps): JSX.Element => {
    const [editMode, setEditMode] = useState<boolean>(section.hire === null);
    const { onUploadSuccess, onUploadFail } = useUploadNotifications();
    const { showAddProblemToSectionPreview } = usePreviewContext();

    const router = useRouter();
    const { interviewId } = section;

    const session = useSession();
    const sectionUpdateMutation = useSectionUpdateMutation();
    const createCodeSessionMutation = useSectionCodeSessionCreate();

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
        const localStorageFeedback = LocalStorageManager.getPersistedSectionFeedback(section.id);

        if (localStorageFeedback) {
            setValue('feedback', localStorageFeedback);
        } else {
            setValue('feedback', section.feedback);
        }

        setEditMode(section.hire === null);
    }, [section.feedback, section.hire, section.id, setValue]);

    const onSubmit = handleSubmit(async (values) => {
        const interviewerIds = section.interviewers.map(({ id }) => id);
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
                    interviewerIds,
                    feedback,
                    grade,
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
    const solutionsWithoutResultWarn = section.solutions.reduce((acc: string[], rec) => {
        rec.result === 'UNKNOWN' && acc.push(rec.problem.name);
        return acc;
    }, []);

    const sendFeedbackConfirmation = useConfirmation({
        message: tr('Send feedback?'),
        description: (
            <>
                {nullable(solutionsWithoutResultWarn.length, () => (
                    <>
                        <Text>{tr('Ouch! You probably forgot to add these solutions:')}</Text>
                        <ul>
                            {solutionsWithoutResultWarn.map((title) => (
                                <li key={title}>{title}</li>
                            ))}
                        </ul>
                    </>
                ))}
                {nullable(!section.feedback, () => (
                    <Text>{tr('HR will receive a notification about the completed feedback')}</Text>
                ))}
            </>
        ),
        onAgree: onSubmit,
    });

    const createSessionHandler = useCallback(async () => {
        await createCodeSessionMutation.mutateAsync({ sectionId: section.id });
    }, [section, createCodeSessionMutation]);

    const setHire = (value: boolean | null) => {
        setValue('hire', value);
    };

    const setGrade = (value: string | null) => {
        setValue('grade', value);
    };

    const editButtonTitle = editMode ? tr('Cancel') : tr('Edit');

    const isProblemCreationAvailable = isEditable && hasTasks;
    return (
        <>
            <form className={s.SectionFeedbackForm}>
                <div>
                    {nullable(
                        isEditable && editMode,
                        () => (
                            <>
                                <div>
                                    <HireButtons section={section} setHire={setHire} setGrade={setGrade} />
                                    {errors.hire && watch('hire') === null && (
                                        <Text className={s.ErrorText}>{errors.hire.message}</Text>
                                    )}
                                </div>
                                <CodeEditorField
                                    className={s.CodeEditorField}
                                    passedError={
                                        errors.feedback && !watch('feedback')
                                            ? { message: tr("Mandatory field, fill in the candidate's impressions") }
                                            : undefined
                                    }
                                    onUploadSuccess={onUploadSuccess}
                                    onUploadFail={onUploadFail}
                                    name="feedback"
                                    control={control}
                                    uploadLink={pageHrefs.attachSection(section.id)}
                                    placeholder={tr('Describe your impressions of the candidate')}
                                />
                            </>
                        ),
                        <div className={s.SectionFeedback}>
                            <div className={s.SectionFeedbackHireBadge}>
                                <SectionFeedbackHireBadge hire={section.hire} />
                                {section.grade && (
                                    <>
                                        {tr('Grade:')} <Text>{section.grade}</Text>
                                    </>
                                )}
                            </div>
                            {nullable(watch('feedback'), (f) => (
                                <Md className={s.Md}>{f}</Md>
                            ))}
                        </div>,
                    )}

                    <div className={s.Button}>
                        {nullable(isEditable && editMode, () => (
                            <Button
                                iconRight={<IconSendOutline size="s" />}
                                type="button"
                                view="primary"
                                disabled={isSubmitting || isSubmitSuccessful}
                                onClick={section.hire === null ? sendFeedbackConfirmation.show : onSubmit}
                                text={section.feedback ? tr('Save') : tr('Send feedback')}
                            />
                        ))}

                        {nullable(editMode && isProblemCreationAvailable && showAddProblemButton, () => (
                            <Button
                                iconRight={<IconPlusCircleOutline size="s" />}
                                view="default"
                                type="button"
                                text={tr('Add problem')}
                                onClick={() => showAddProblemToSectionPreview({ interviewId, sectionId: section.id })}
                            />
                        ))}
                        {nullable(editMode && section.videoCallLink, (videoCallLink) => (
                            <Link href={videoCallLink} target="_blank">
                                <Button
                                    iconRight={<IconPhonecallOutline size="s" />}
                                    type="button"
                                    onClick={() => {}}
                                    view="default"
                                    text={tr('Meeting')}
                                />
                            </Link>
                        ))}
                        {nullable(
                            section.codeSessionLink,
                            (link) => (
                                <Link href={link} target="_blank">
                                    <Button
                                        iconRight={<IconCodeOutline size="s" />}
                                        text={tr('Go to session')}
                                        type="button"
                                    />
                                </Link>
                            ),
                            nullable(editMode && section.codeSessionLink == null, () => (
                                <Button
                                    iconRight={<IconCodeOutline size="s" />}
                                    text={tr('Create session')}
                                    type="button"
                                    onClick={createSessionHandler}
                                />
                            )),
                        )}

                        {nullable(isEditable && section.hire !== null, () => (
                            <Button
                                type="button"
                                iconRight={editMode ? <IconXCircleOutline size="s" /> : <IconEditOutline size="s" />}
                                view={editMode ? 'default' : 'primary'}
                                onClick={() => {
                                    if (editMode) {
                                        setValue('feedback', section.feedback);
                                    }
                                    setEditMode(!editMode);
                                }}
                                text={editButtonTitle}
                            />
                        ))}
                    </div>
                </div>
            </form>

            {nullable(section.attaches.length > 0, () => (
                <>
                    <Text size="l">Attaches:</Text>
                    {section.attaches.map((attach: Attach) => (
                        <SectionAttach
                            fileId={attach.id}
                            filename={attach.filename}
                            canEditAttach={!!canEditAttach}
                            key={attach.id}
                        />
                    ))}
                </>
            ))}
            <Confirmation {...sendFeedbackConfirmation.props} />
        </>
    );
};
