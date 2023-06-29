import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { Candidate, Interview, SectionType } from '@prisma/client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { danger0 } from '@taskany/colors';
import { Text, Link } from '@taskany/bricks';

import { FormContainer } from '../FormContainer/FormContainer';
import { CreateSection } from '../../backend/modules/section/section-types';
import { useSectionCreateMutation } from '../../hooks/section-hooks';
import { pageHrefs } from '../../utils/paths';
import { CandidateNameSubtitle } from '../candidates/CandidateNameSubtitle';
import { Stack } from '../layout/Stack';
import { FormInput } from '../FormInput/FormInput';
import { validationRules } from '../../utils/validation-rules';
import { SectionScheduleCalendar, CalendarEventDetails } from '../calendar/SectionScheduleCalendar';
import { Option } from '../../types';
import { Select } from '../Select';

import { tr } from './sections.i18n';

interface Props {
    interviewId: number;
    sectionType: SectionType;
    interviewers: Option[];
    candidate: Candidate;
    interview: Interview;
}

const schema = z.object({
    interviewerId: z.number({
        invalid_type_error: tr('Choose an interviewer'),
        required_error: tr('Choose an interviewer'),
    }),
    name: z.string().nullish(),
    calendarSlot: z
        .object({
            exceptionId: z.string().optional(),
            eventId: z.string(),
            originalDate: z.date(),
        })
        .optional(),
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function SectionCreationForm({ interviewers, candidate, interviewId, sectionType }: Props) {
    const [schedulable, setSchedulable] = useState<boolean>(sectionType.schedulable);

    const router = useRouter();
    const sectionCreateMutation = useSectionCreateMutation();

    const createSection: SubmitHandler<CreateSection> = useCallback(
        async ({ interviewerId, name, calendarSlot }) => {
            const result = await sectionCreateMutation.mutateAsync({
                sectionTypeId: sectionType.id,
                name,
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
        formState: { isSubmitting, isSubmitSuccessful, errors },
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
    const onInterviewerIdChange = (interviewerId: number) => setValue('interviewerId', interviewerId);
    const { ref: refName, ...restName } = register('name', validationRules.nonEmptyString);

    return (
        <Stack direction="column" gap={14}>
            <CandidateNameSubtitle name={candidate.name} id={candidate.id} />

            <Text onClick={() => setSchedulable(!schedulable)}>{newOrScheduleDescription}</Text>

            {schedulable && (
                <SectionScheduleCalendar
                    isSectionSubmitting={isSubmitting}
                    interviewerIds={interviewers
                        .map((i) => i.value)
                        .filter<number>((id): id is number => typeof id === 'number')}
                    selectedSlot={watch('calendarSlot')}
                    onSlotSelected={setCalendarSlotAndSubmit}
                />
            )}
            <FormContainer
                submitButtonText={tr('Assign section')}
                onSubmitButton={submit}
                submitButtonDisabled={isSubmitting || isSubmitSuccessful}
            >
                <Stack direction="column" gap={20}>
                    {!schedulable && (
                        <>
                            <Select
                                options={interviewers}
                                value={watch('interviewerId')}
                                onChange={onInterviewerIdChange}
                                text={tr('Interviewer')}
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
                            helperText={errors.name?.message}
                            placeholder={tr('Which team is held the product final?')}
                            forwardRef={refName}
                            {...restName}
                        />
                    )}
                </Stack>
            </FormContainer>
        </Stack>
    );
}
