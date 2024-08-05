import { useCallback, useState } from 'react';
import { Candidate, Interview, SectionType, User } from '@prisma/client';
import { z } from 'zod';
import {
    Form,
    TabsMenu,
    TabsMenuItem,
    Text,
    Fieldset,
    FormActions,
    FormAction,
    FormCard,
    FormTextarea,
    FormInput,
} from '@taskany/bricks';
import { useRouter } from 'next/router';
import { useDebounce } from 'use-debounce';
import { SubmitHandler, useForm } from 'react-hook-form';
import { danger0 } from '@taskany/colors';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@taskany/bricks/harmony';

import { useSectionCreateMutation, useSectionUpdateMutation } from '../../modules/sectionHooks';
import { SectionWithRelationsAndResults, CreateOrUpdateSection } from '../../modules/sectionTypes';
import { trpc } from '../../trpc/trpcClient';
import { Stack } from '../Stack';
import { CandidateNameSubtitle } from '../CandidateNameSubtitle/CandidateNameSubtitle';
import { SectionScheduleCalendar, CalendarEventDetails } from '../SectionScheduleCalendar/SectionScheduleCalendar';
import { UserComboBox } from '../UserComboBox';
import { pageHrefs } from '../../utils/paths';

import { tr } from './CreateOrUpdateSectionForm.i18n';
import s from './CreateOrUpdateSectionForm.module.css';

interface CreateOrUpdateSectionFormProps {
    interviewId: number;
    sectionType: SectionType;
    candidate: Candidate;
    interview?: Interview;
    section?: SectionWithRelationsAndResults;
    variant: 'new' | 'update';
}

const schema = z.object({
    interviewerId: z.number({
        invalid_type_error: tr('Choose an interviewer'),
        required_error: tr('Choose an interviewer'),
    }),
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
});

export const CreateOrUpdateSectionForm = ({
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
    const [interviewer, setInterviewer] = useState<User | undefined>(
        variant === 'new' ? undefined : section?.interviewer,
    );

    const interviewersQuery = trpc.users.getUserList.useQuery(
        { sectionTypeId: sectionType.id, search: debouncedSearch, limit: schedulable ? undefined : 20 },
        {
            cacheTime: 0,
            staleTime: 0,
        },
    );

    const interviewerIds = (interviewersQuery.data || []).map(({ id }) => id);

    const createSection: SubmitHandler<CreateOrUpdateSection> = useCallback(
        async ({ interviewerId, description, calendarSlot, videoCallLink }) => {
            const result = await sectionCreateMutation.mutateAsync({
                sectionTypeId: sectionType.id,
                description,
                interviewId,
                interviewerId,
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
            interviewerId: section?.interviewer.id,
            description: section?.description ?? '',
            videoCallLink: section?.videoCallLink ?? '',
            sectionId: section?.id,
            interviewId,
        },
        resolver: zodResolver(schema),
    });

    const onSubmit = variant === 'new' ? handleSubmit(createSection) : handleSubmit(updateSection);

    const setCalendarSlotAndSubmit = useCallback(
        (eventDetails: CalendarEventDetails) => {
            const { eventId, exceptionId, interviewer, originalDate } = eventDetails;

            setValue('calendarSlot', { eventId, exceptionId, originalDate });

            if (interviewer?.email) {
                setValue('interviewerId', interviewer.id);
            }

            onSubmit();
        },
        [setValue, onSubmit],
    );

    const onInterviewerSelect = (interviewer: User) => {
        setValue('interviewerId', interviewer.id);
        setInterviewer(interviewer);
        setSearch('');
    };

    const onSchedulableToggle = (arg: boolean) => {
        setSchedulable(arg);
        setSearch('');
    };
    const setVideoCallLink = (link: string) => setValue('videoCallLink', link);
    const { videoCallLink } = getValues();

    return (
        <Stack direction="column" gap={14}>
            <CandidateNameSubtitle name={candidate.name} id={candidate.id} />
            <TabsMenu>
                <TabsMenuItem active={!schedulable} onClick={() => onSchedulableToggle(false)}>
                    {tr('Choice of interviewers')}
                </TabsMenuItem>
                <TabsMenuItem active={schedulable} onClick={() => onSchedulableToggle(true)}>
                    {tr('Calendar')}
                </TabsMenuItem>
            </TabsMenu>

            {schedulable && (
                <SectionScheduleCalendar
                    videoCallLink={videoCallLink ?? ''}
                    isSectionSubmitting={isSubmitting}
                    interviewerIds={interviewerIds}
                    onSlotSelected={setCalendarSlotAndSubmit}
                    setVideoCallLink={setVideoCallLink}
                />
            )}

            {!schedulable && (
                <FormCard className={s.CreateOrUpdateSectionFormCard}>
                    <Form onSubmit={onSubmit}>
                        <Fieldset>
                            <div className={s.CreateOrUpdateSectionFormWrapperCombobox}>
                                <UserComboBox
                                    value={interviewer}
                                    items={interviewersQuery.data}
                                    onChange={onInterviewerSelect}
                                    setInputValue={setSearch}
                                    placeholder={tr('Choose an interviewer')}
                                />
                            </div>
                            {errors.interviewerId && !watch('interviewerId') && (
                                <Text size="xs" color={danger0}>
                                    {errors.interviewerId.message}
                                </Text>
                            )}
                            <FormTextarea
                                {...register('description')}
                                error={errors.description}
                                placeholder={
                                    sectionType.userSelect
                                        ? tr('In which team is the product final held?')
                                        : tr('Write a couple of notes')
                                }
                                autoComplete="off"
                                flat="bottom"
                            />
                            <FormInput
                                label={tr('Meeting link')}
                                error={errors.videoCallLink}
                                {...register('videoCallLink')}
                                autoComplete="off"
                                flat="bottom"
                            />
                        </Fieldset>
                        <FormActions flat="top">
                            <FormAction left inline></FormAction>
                            <FormAction right inline>
                                <Button view="primary" type="submit" text={tr('Save the section')} />
                            </FormAction>
                        </FormActions>
                    </Form>
                </FormCard>
            )}
        </Stack>
    );
};
