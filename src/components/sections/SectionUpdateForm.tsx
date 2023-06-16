import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/router';
import { VFC, useCallback } from 'react';
import { Candidate, SectionType } from '@prisma/client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { danger0 } from '@taskany/colors';
import { Text } from '@taskany/bricks';

import { SectionWithRelationsAndResults, UpdateSection } from '../../backend/modules/section/section-types';
import { useSectionUpdateMutation } from '../../hooks/section-hooks';
import { FormContainer } from '../FormContainer/FormContainer';
import { pageHrefs } from '../../utils/paths';
import { FormInput } from '../FormInput/FormInput';
import { validationRules } from '../../utils/validation-rules';
import { Stack } from '../layout/Stack';
import { CandidateNameSubtitle } from '../candidates/CandidateNameSubtitle';
import { Option } from '../../types';
import { CalendarEventDetails, SectionScheduleCalendar } from '../calendar/SectionScheduleCalendar';
import { Select } from '../Select';

type SectionUpdateFormProps = {
    section: SectionWithRelationsAndResults;
    sectionType: SectionType;
    interviewers: Option[];
    candidate: Candidate;
};

const schema = z.object({
    interviewerId: z.number({
        invalid_type_error: 'Choose the interviewer',
        required_error: 'Choose the interviewer',
    }),
    name: z.string().nullish(),
    sectionId: z.number(),
    interviewId: z.number(),
    calendarSlot: z
        .object({ exceptionId: z.string().optional(), eventId: z.string(), originalDate: z.date() })
        .optional(),
});

export const SectionUpdateForm: VFC<SectionUpdateFormProps> = ({ section, interviewers, sectionType, candidate }) => {
    const router = useRouter();
    const sectionUpdateMutation = useSectionUpdateMutation();

    const interviewId = Number(router.query.interviewId);

    const { schedulable } = section.sectionType;

    const {
        handleSubmit,
        register,
        watch,
        setValue,
        formState: { isSubmitting, errors },
    } = useForm<UpdateSection>({
        defaultValues: {
            interviewerId: section.interviewer.id,
            name: section.description ?? '',
            sectionId: section.id,
            interviewId,
        },
        resolver: zodResolver(schema),
    });

    const update: SubmitHandler<UpdateSection> = async (data) => {
        await sectionUpdateMutation.mutateAsync({ data });

        await router.push(pageHrefs.interviewSectionView(interviewId, section.id));
    };

    const submit = handleSubmit(update);

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
                submitButtonText="Save the section"
                onSubmitButton={submit}
                submitButtonDisabled={isSubmitting}
            >
                <Stack direction="column" gap={20}>
                    {!schedulable && (
                        <>
                            <Select
                                options={interviewers}
                                value={watch('interviewerId') || section.interviewer.id}
                                onChange={onInterviewerIdChange}
                                text="Interviewer"
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
                            label="Description"
                            helperText={(errors.name as any)?.name}
                            placeholder="In which team is the product final held?"
                            forwardRef={refName}
                            {...restName}
                        />
                    )}
                </Stack>
            </FormContainer>
        </Stack>
    );
};
