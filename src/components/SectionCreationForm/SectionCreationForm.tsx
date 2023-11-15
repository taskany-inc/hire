import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { Candidate, Interview, SectionType, User } from '@prisma/client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { danger0 } from '@taskany/colors';
import { TabsMenu, TabsMenuItem, Text } from '@taskany/bricks';
import { useDebounce } from 'use-debounce';
import styled from 'styled-components';

import { CreateSection } from '../../modules/sectionTypes';
import { useSectionCreateMutation } from '../../modules/sectionHooks';
import { pageHrefs } from '../../utils/paths';
import { validationRules } from '../../utils/validationRules';
import { trpc } from '../../trpc/trpcClient';
import { CandidateNameSubtitle } from '../CandidateNameSubtitle';
import { Stack } from '../Stack';
import { FormInput } from '../FormInput';
import { SectionScheduleCalendar, CalendarEventDetails } from '../SectionScheduleCalendar/SectionScheduleCalendar';
import { UserComboBox } from '../UserComboBox';
import { FormContainer } from '../FormContainer';

import { tr } from './SectionCreationForm.i18n';

interface Props {
    interviewId: number;
    sectionType: SectionType;
    candidate: Candidate;
    interview: Interview;
}

const schema = z.object({
    interviewerId: z.number({
        invalid_type_error: tr('Choose an interviewer'),
        required_error: tr('Choose an interviewer'),
    }),
    description: z.string().nullish(),
    calendarSlot: z
        .object({
            exceptionId: z.string().optional(),
            eventId: z.string(),
            originalDate: z.date(),
        })
        .optional(),
});

const StyledFormInput = styled(FormInput)`
    max-width: 430px;
`;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function SectionCreationForm({ candidate, interviewId, sectionType }: Props) {
    const [schedulable, setSchedulable] = useState<boolean>(sectionType.schedulable);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 300);
    const [interviewer, setInterviewer] = useState<User | undefined>(undefined);

    const interviewersQuery = trpc.users.getUserList.useQuery(
        { sectionTypeId: sectionType.id, search: debouncedSearch, limit: schedulable ? undefined : 20 },
        {
            cacheTime: 0,
            staleTime: 0,
        },
    );

    const interviewerIds = (interviewersQuery.data || []).map(({ id }) => id);

    const router = useRouter();
    const sectionCreateMutation = useSectionCreateMutation();

    const createSection: SubmitHandler<CreateSection> = useCallback(
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
        [interviewId, router, schedulable, sectionCreateMutation, sectionType.id],
    );

    const {
        handleSubmit,
        formState: { isSubmitting, errors },
        register,
        setValue,
        watch,
    } = useForm<CreateSection>({
        resolver: zodResolver(schema),
    });

    const submit = handleSubmit(createSection);

    const setCalendarSlotAndSubmit = useCallback(
        (eventDetails: CalendarEventDetails) => {
            const { eventId, exceptionId, interviewer, originalDate } = eventDetails;
            setValue('calendarSlot', { eventId, exceptionId, originalDate });

            if (interviewer?.email) {
                setValue('interviewerId', interviewer.id);
            }

            submit();
        },
        [setValue, submit],
    );

    const { ref: refDescription, ...restDescription } = register('description', validationRules.nonEmptyString);

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
                <FormContainer
                    maxWidth="570px"
                    submitButtonText={tr('Save the section')}
                    onSubmitButton={submit}
                    submitButtonDisabled={isSubmitting}
                    borderNone
                >
                    <UserComboBox
                        items={interviewersQuery.data}
                        onChange={onInterviewerSelect}
                        setInputValue={setSearch}
                        value={interviewer}
                        placeholder={tr('Choose an interviewer')}
                    />

                    {errors.interviewerId && !watch('interviewerId') && (
                        <Text size="xs" color={danger0}>
                            {errors.interviewerId.message}
                        </Text>
                    )}
                    {sectionType.userSelect && (
                        <StyledFormInput
                            label={tr('Description')}
                            helperText={errors.description?.message}
                            placeholder={tr('Which team is held the product final?')}
                            forwardRef={refDescription}
                            {...restDescription}
                        />
                    )}
                </FormContainer>
            )}
        </Stack>
    );
}
