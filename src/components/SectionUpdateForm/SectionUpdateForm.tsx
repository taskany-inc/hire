import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { Candidate, SectionType, User } from '@prisma/client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { danger0 } from '@taskany/colors';
import { TabsMenu, TabsMenuItem, Text } from '@taskany/bricks';
import styled from 'styled-components';
import { useDebounce } from 'use-debounce';

import { SectionWithRelationsAndResults, UpdateSection } from '../../modules/sectionTypes';
import { useSectionUpdateMutation } from '../../modules/sectionHooks';
import { pageHrefs } from '../../utils/paths';
import { validationRules } from '../../utils/validationRules';
import { trpc } from '../../trpc/trpcClient';
import { FormContainer } from '../FormContainer';
import { FormInput } from '../FormInput';
import { Stack } from '../Stack';
import { CandidateNameSubtitle } from '../CandidateNameSubtitle';
import { CalendarEventDetails, SectionScheduleCalendar } from '../SectionScheduleCalendar/SectionScheduleCalendar';
import { UserComboBox } from '../UserComboBox';

import { tr } from './SectionUpdateForm.i18n';

type SectionUpdateFormProps = {
    section: SectionWithRelationsAndResults;
    sectionType: SectionType;
    candidate: Candidate;
};

const schema = z.object({
    interviewerId: z.number({
        invalid_type_error: tr('Choose an interviewer'),
        required_error: tr('Choose an interviewer'),
    }),
    description: z.string().nullish(),
    sectionId: z.number(),
    interviewId: z.number(),
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

export const SectionUpdateForm = ({ section, sectionType, candidate }: SectionUpdateFormProps) => {
    const router = useRouter();
    const sectionUpdateMutation = useSectionUpdateMutation();

    const { interviewId } = section;

    const [schedulable, setSchedulable] = useState<boolean>(sectionType.schedulable);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 300);
    const [interviewer, setInterviewer] = useState<User | undefined>(section.interviewer);

    const interviewersQuery = trpc.users.getUserList.useQuery(
        { sectionTypeId: sectionType.id, search: debouncedSearch, limit: schedulable ? undefined : 20 },
        {
            cacheTime: 0,
            staleTime: 0,
        },
    );
    const interviewerIds = (interviewersQuery.data || []).map(({ id }) => id);

    const {
        handleSubmit,
        register,
        watch,
        setValue,
        formState: { isSubmitting, errors },
    } = useForm<UpdateSection>({
        defaultValues: {
            interviewerId: section.interviewer.id,
            description: section.description ?? '',
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

            <Stack direction="column" gap={20}>
                {!schedulable && (
                    <FormContainer
                        maxWidth="570px"
                        borderNone
                        submitButtonText={tr('Save the section')}
                        onSubmitButton={submit}
                        onCancelButton={() => router.push(pageHrefs.interviewSectionView(interviewId, section.id))}
                        submitButtonDisabled={isSubmitting}
                    >
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
                            <StyledFormInput
                                label={tr('Description')}
                                helperText={(errors.description as any)?.description}
                                placeholder={tr('In which team is the product final held?')}
                                forwardRef={refDescription}
                                {...restDescription}
                            />
                        )}
                    </FormContainer>
                )}
            </Stack>
        </Stack>
    );
};
