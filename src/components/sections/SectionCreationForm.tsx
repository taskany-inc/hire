import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { Candidate, Interview, SectionType, User } from '@prisma/client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { danger0 } from '@taskany/colors';
import { Button, Text } from '@taskany/bricks';
import styled from 'styled-components';
import { useDebounce } from 'use-debounce';

import { CreateSection } from '../../backend/modules/section/section-types';
import { useSectionCreateMutation } from '../../hooks/section-hooks';
import { pageHrefs } from '../../utils/paths';
import { CandidateNameSubtitle } from '../candidates/CandidateNameSubtitle';
import { Stack } from '../layout/Stack';
import { FormInput } from '../FormInput/FormInput';
import { validationRules } from '../../utils/validation-rules';
import { SectionScheduleCalendar, CalendarEventDetails } from '../calendar/SectionScheduleCalendar';
import { UserComboBox } from '../UserComboBox';
import { trpc } from '../../utils/trpc-front';
import { FormContainer } from '../FormContainer/FormContainer';

import { tr } from './sections.i18n';

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

const StyledButton = styled(Button)`
    width: fit-content;
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

    const newOrScheduleDescription = schedulable ? tr('To the choice of interviewees') : tr('To calendar');

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
    const onSchedulableToggle = () => {
        setSchedulable(!schedulable);
        setSearch('');
    };

    return (
        <Stack direction="column" gap={14}>
            <CandidateNameSubtitle name={candidate.name} id={candidate.id} />

            <StyledButton outline onClick={onSchedulableToggle} text={newOrScheduleDescription} />

            {schedulable && (
                <SectionScheduleCalendar
                    isSectionSubmitting={isSubmitting}
                    interviewerIds={interviewerIds}
                    selectedSlot={watch('calendarSlot')}
                    onSlotSelected={setCalendarSlotAndSubmit}
                />
            )}
            <FormContainer
                submitButtonText={tr('Save the section')}
                onSubmitButton={submit}
                submitButtonDisabled={isSubmitting}
            >
                {!schedulable && (
                    <>
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
                    </>
                )}

                {sectionType.userSelect && (
                    <FormInput
                        label={tr('Description')}
                        helperText={errors.description?.message}
                        placeholder={tr('Which team is held the product final?')}
                        forwardRef={refDescription}
                        {...restDescription}
                    />
                )}
            </FormContainer>
        </Stack>
    );
}
