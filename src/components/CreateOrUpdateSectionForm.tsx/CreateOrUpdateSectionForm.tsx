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
    Button,
    FormCard,
    FormInput,
} from '@taskany/bricks';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useDebounce } from 'use-debounce';
import { SubmitHandler, useForm } from 'react-hook-form';
import { danger0 } from '@taskany/colors';
import { zodResolver } from '@hookform/resolvers/zod';

import { useSectionCreateMutation, useSectionUpdateMutation } from '../../modules/sectionHooks';
import { SectionWithRelationsAndResults, CreateOrUpdateSection } from '../../modules/sectionTypes';
import { trpc } from '../../trpc/trpcClient';
import { Stack } from '../Stack';
import { CandidateNameSubtitle } from '../CandidateNameSubtitle';
import { SectionScheduleCalendar, CalendarEventDetails } from '../SectionScheduleCalendar/SectionScheduleCalendar';
import { UserComboBox } from '../UserComboBox';
import { pageHrefs } from '../../utils/paths';

import { tr } from './CreateOrUpdateSectionForm.tsx.i18n';

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
    interviewId: z.number(),
    calendarSlot: z
        .object({
            exceptionId: z.string().optional(),
            eventId: z.string(),
            originalDate: z.date(),
        })
        .optional(),
});

const StyledFormCard = styled(FormCard)`
    width: 500px;
`;

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
        async ({ interviewerId, description, calendarSlot }) => {
            const result = await sectionCreateMutation.mutateAsync({
                sectionTypeId: sectionType.id,
                description,
                interviewId,
                interviewerId,
                calendarSlot: schedulable ? calendarSlot : undefined,
            });

            const sectionId = result.id;

            if (sectionId) {
                router.push(pageHrefs.interviewSectionView(interviewId, sectionId));
            }
        },
        [interviewId, router, sectionCreateMutation, sectionType.id],
    );

    const updateSection: SubmitHandler<CreateOrUpdateSection> = useCallback(
        async (data) => {
            if (!section) {
                return;
            }
            await sectionUpdateMutation.mutateAsync({ data });

            await router.push(pageHrefs.interviewSectionView(interviewId, section.id));
        },
        [interviewId, router, schedulable, sectionUpdateMutation, sectionType.id, section],
    );

    const {
        handleSubmit,
        register,
        watch,
        setValue,
        formState: { isSubmitting, errors },
    } = useForm<CreateOrUpdateSection>({
        defaultValues: {
            interviewerId: section?.interviewer.id,
            description: section?.description ?? '',
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
                    isSectionSubmitting={isSubmitting}
                    interviewerIds={interviewerIds}
                    selectedSlot={watch('calendarSlot')}
                    onSlotSelected={setCalendarSlotAndSubmit}
                />
            )}

            {!schedulable && (
                <StyledFormCard>
                    <Form onSubmit={onSubmit}>
                        <Fieldset>
                            <UserComboBox
                                value={interviewer}
                                items={interviewersQuery.data}
                                onChange={onInterviewerSelect}
                                setInputValue={setSearch}
                                placeholder={tr('Choose an interviewer')}
                            />
                            {errors.interviewerId && !watch('interviewerId') && (
                                <Text size="xs" color={danger0}>
                                    {errors.interviewerId.message}
                                </Text>
                            )}
                            {sectionType.userSelect && (
                                <FormInput
                                    {...register('description')}
                                    label={tr('Description')}
                                    error={errors.description}
                                    placeholder={tr('In which team is the product final held?')}
                                    autoComplete="off"
                                    flat="bottom"
                                />
                            )}
                        </Fieldset>
                        <FormActions flat="top">
                            <FormAction left inline></FormAction>
                            <FormAction right inline>
                                <Button size="m" view="primary" type="submit" text={tr('Save the section')} />
                            </FormAction>
                        </FormActions>
                    </Form>
                </StyledFormCard>
            )}
        </Stack>
    );
};
