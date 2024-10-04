import { useCallback, useState } from 'react';
import { Candidate, Interview, SectionType, User } from '@prisma/client';
import { z } from 'zod';
import { nullable } from '@taskany/bricks';
import { useRouter } from 'next/router';
import { useDebounce } from 'use-debounce';
import { SubmitHandler, useForm } from 'react-hook-form';
import { danger0 } from '@taskany/colors';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Button,
    Card,
    CardContent,
    FormControl,
    FormControlError,
    FormControlInput,
    FormControlLabel,
    Textarea,
    Text,
    Switch,
    SwitchControl,
} from '@taskany/bricks/harmony';

import { useSectionCreateMutation, useSectionUpdateMutation } from '../../modules/sectionHooks';
import { SectionWithRelationsAndResults, CreateOrUpdateSection } from '../../modules/sectionTypes';
import { trpc } from '../../trpc/trpcClient';
import { CandidateNameSubtitle } from '../CandidateNameSubtitle/CandidateNameSubtitle';
import { SectionScheduleCalendar, CalendarEventDetails } from '../SectionScheduleCalendar/SectionScheduleCalendar';
import { UserComboBox } from '../UserComboBox';
import { pageHrefs } from '../../utils/paths';
import { FormActions } from '../FormActions/FormActions';

import { tr } from './CreateOrUpdateSectionForm.i18n';
import s from './CreateOrUpdateSectionForm.module.css';

interface CreateOrUpdateSectionFormProps {
    interviewId: number;
    hireStreamId: number;
    sectionType: SectionType;
    candidate: Candidate;
    interview?: Interview;
    section?: SectionWithRelationsAndResults;
    variant: 'new' | 'update';
}

const schema = z.object({
    interviewerIds: z
        .number({
            invalid_type_error: tr('Choose an interviewer'),
            required_error: tr('Choose an interviewer'),
        })
        .array()
        .nonempty(tr('Choose an interviewer')),
    description: z.string().nullish(),
    sectionId: z.number().optional(),
    videoCallLink: z.string().nullish(),
    interviewId: z.number(),
    calendarSlot: z
        .object({
            exceptionId: z.string().optional(),
            eventId: z.string(),
            originalDate: z.date(),
        })
        .optional(),
    calendarSlotId: z.string().nullish(),
});

export const CreateOrUpdateSectionForm = ({
    hireStreamId,
    section,
    sectionType,
    candidate,
    variant,
    interviewId,
}: CreateOrUpdateSectionFormProps) => {
    const router = useRouter();
    const sectionCreateMutation = useSectionCreateMutation();
    const sectionUpdateMutation = useSectionUpdateMutation();

    const [schedulable, setSchedulable] = useState<boolean>(sectionType.schedulable);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 300);
    const [interviewers, setInterviewers] = useState<User[] | undefined>(
        variant === 'new' ? undefined : section?.interviewers,
    );

    const interviewersQuery = trpc.users.getUserList.useQuery(
        { sectionTypeId: sectionType.id, search: debouncedSearch, limit: schedulable ? undefined : 20, active: true },
        {
            cacheTime: 0,
            staleTime: 0,
        },
    );

    const interviewerIds = (interviewersQuery.data || []).map(({ id }) => id);

    const createSection: SubmitHandler<CreateOrUpdateSection> = useCallback(
        async ({ interviewerIds, description, calendarSlot, videoCallLink }) => {
            const result = await sectionCreateMutation.mutateAsync({
                sectionTypeId: sectionType.id,
                description,
                interviewId,
                interviewerIds,
                calendarSlot: schedulable ? calendarSlot : undefined,
                videoCallLink,
            });

            const sectionId = result.id;

            if (sectionId) {
                router.push(pageHrefs.interviewSectionView(interviewId, sectionId));
            }
        },
        [interviewId, router, sectionCreateMutation, sectionType.id, schedulable],
    );

    const updateSection: SubmitHandler<CreateOrUpdateSection> = useCallback(
        async (data) => {
            if (!section) {
                return;
            }
            await sectionUpdateMutation.mutateAsync({ data });

            await router.push(pageHrefs.interviewSectionView(interviewId, section.id));
        },
        [interviewId, router, sectionUpdateMutation, section],
    );

    const {
        handleSubmit,
        register,
        watch,
        setValue,
        getValues,
        formState: { isSubmitting, errors },
    } = useForm<CreateOrUpdateSection>({
        defaultValues: {
            interviewerIds: section?.interviewers?.map(({ id }) => id) ?? [],
            description: section?.description ?? '',
            videoCallLink: section?.videoCallLink ?? '',
            sectionId: section?.id,
            interviewId,
            calendarSlotId: section?.calendarSlotId,
        },
        resolver: zodResolver(schema),
    });

    const onSubmit = variant === 'new' ? handleSubmit(createSection) : handleSubmit(updateSection);

    const setCalendarSlotAndSubmit = useCallback(
        (eventDetails: CalendarEventDetails) => {
            const { eventId, exceptionId, interviewer, originalDate, additionalInterviewers, calendarSlotId } =
                eventDetails;

            setValue('calendarSlot', { eventId, exceptionId, originalDate });
            setValue('calendarSlotId', calendarSlotId);

            if (interviewer?.email) {
                setValue('interviewerIds', [interviewer.id, ...additionalInterviewers.map(({ id }) => id)]);
            }

            onSubmit();
        },
        [setValue, onSubmit],
    );

    const onInterviewerSelect = (interviewers: User[]) => {
        setValue(
            'interviewerIds',
            interviewers.map(({ id }) => id),
        );
        setInterviewers(interviewers);
        setSearch('');
    };

    const onSchedulableToggle = (arg: boolean) => {
        setSchedulable(arg);
        setSearch('');
    };
    const setVideoCallLink = (link: string) => setValue('videoCallLink', link);
    const { videoCallLink } = getValues();

    return (
        <div className={s.CreateOrUpdateSectionForm}>
            <CandidateNameSubtitle name={candidate.name} id={candidate.id} />

            <Switch value={schedulable ? 'calendar' : 'manual'} className={s.CreateOrUpdateSectionFormSwitch}>
                <SwitchControl
                    text={tr('Choice of interviewers')}
                    value="manual"
                    onClick={() => onSchedulableToggle(false)}
                />
                <SwitchControl text={tr('Calendar')} value="calendar" onClick={() => onSchedulableToggle(true)} />
            </Switch>

            {schedulable && (
                <SectionScheduleCalendar
                    hireStreamId={hireStreamId}
                    videoCallLink={videoCallLink ?? ''}
                    isSectionSubmitting={isSubmitting}
                    interviewerIds={interviewerIds}
                    onSlotSelected={setCalendarSlotAndSubmit}
                    setVideoCallLink={setVideoCallLink}
                    calendarSlotId={section?.calendarSlotId}
                    allInterviewers={interviewersQuery.data}
                    initialInterviewers={section?.interviewers}
                    setSearch={setSearch}
                />
            )}

            {!schedulable && (
                <form onSubmit={onSubmit}>
                    <Card className={s.CreateOrUpdateSectionFormCard}>
                        <CardContent className={s.CreateOrUpdateSectionFormCardContent}>
                            <UserComboBox
                                value={interviewers}
                                items={interviewersQuery.data}
                                onChange={onInterviewerSelect}
                                setInputValue={setSearch}
                                placeholder={tr('Choose an interviewer')}
                            />
                            {errors.interviewerIds && !watch('interviewerIds') && (
                                <Text size="xs" color={danger0}>
                                    {errors.interviewerIds.message}
                                </Text>
                            )}

                            <Textarea
                                {...register('description')}
                                className={s.CreateOrUpdateSectionFormTextArea}
                                placeholder={
                                    sectionType.userSelect
                                        ? tr('In which team is the product final held?')
                                        : tr('Write a couple of notes')
                                }
                                autoComplete="off"
                            />
                            {nullable(errors.description, (e) => (
                                <FormControlError error={e} />
                            ))}

                            <FormControl>
                                <FormControlLabel>{tr('Meeting link')}</FormControlLabel>
                                <FormControlInput {...register('videoCallLink')} autoComplete="off" />
                                {nullable(errors.videoCallLink, (e) => (
                                    <FormControlError error={e} />
                                ))}
                            </FormControl>

                            <FormActions>
                                <Button view="primary" type="submit" text={tr('Save the section')} />
                            </FormActions>
                        </CardContent>
                    </Card>
                </form>
            )}
        </div>
    );
};
