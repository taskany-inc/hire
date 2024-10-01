import { useState, useCallback, useMemo, Dispatch, SetStateAction } from 'react';
import { View } from 'react-big-calendar';
import { User } from '@prisma/client';
import { nullable } from '@taskany/bricks';
import {
    Text,
    FormControl,
    Modal,
    ModalHeader,
    ModalContent,
    Button,
    FormControlInput,
    FormControlLabel,
} from '@taskany/bricks/harmony';

import { DateRange, firstVisibleDay, lastVisibleDay } from '../../utils/date';
import { SlotCalendar } from '../SlotCalendar/SlotCalendar';
import {
    CalendarEventLinkedSection,
    CalendarEventLinkedSectionProps,
} from '../CalendarEventLinkedSection/CalendarEventLinkedSection';
import { BigCalendarEvent } from '../../utils/calendar';
import { FormActions } from '../FormActions/FormActions';
import { UserComboBox } from '../UserComboBox';

import { tr } from './SectionScheduleCalendar.i18n';
import s from './SectionScheduleCalendar.module.css';

export interface CalendarEventDetails extends CalendarEventLinkedSectionProps {
    eventId: string;
    exceptionId: string | undefined;
    interviewer: User | null;
    additionalInterviewers: User[];
    title: string;
    originalDate: Date;
}
interface SectionScheduleCalendarProps {
    videoCallLink?: string;
    interviewerIds: number[];
    onSlotSelected: (eventDetails: CalendarEventDetails) => void;
    isSectionSubmitting: boolean;
    setVideoCallLink: (arg: string) => void;
    setSearch?: Dispatch<SetStateAction<string>>;
    allInterviewers?: User[];
}

export function SectionScheduleCalendar({
    interviewerIds,
    onSlotSelected,
    isSectionSubmitting,
    setVideoCallLink,
    videoCallLink,
    allInterviewers,
    setSearch,
}: SectionScheduleCalendarProps) {
    const [eventDetails, setEventDetails] = useState<CalendarEventDetails | null>(null);
    const closeEventFormModal = useCallback(() => {
        setEventDetails(null);
    }, []);
    const [calendarDate, setCalendarDate] = useState(() => new Date());
    const [calendarView, setCalendarView] = useState<View>('work_week');
    const [interviewers, setInterviewer] = useState<User[] | undefined>();
    const range = useMemo<DateRange>(() => {
        const nextRange = {
            startDate: firstVisibleDay(calendarDate, calendarView),
            endDate: lastVisibleDay(calendarDate, calendarView),
        };

        return nextRange;
    }, [calendarDate, calendarView]);

    const openEventDetails = useCallback(
        ({ eventId, exceptionId, title, interviewSection, creator, start }: BigCalendarEvent) => {
            setEventDetails({
                interviewer: creator,
                additionalInterviewers: [],
                title,
                eventId,
                exceptionId,
                interviewSection,
                originalDate: start,
            });
        },
        [],
    );

    const handleSlotSelectClicked = useCallback(() => {
        if (!eventDetails) {
            return;
        }

        onSlotSelected({ ...eventDetails, additionalInterviewers: interviewers ?? [] });
        closeEventFormModal();
    }, [closeEventFormModal, eventDetails, interviewers, onSlotSelected]);

    return (
        <>
            <SlotCalendar
                isLoading={isSectionSubmitting}
                creatorIds={interviewerIds}
                onSelectEvent={openEventDetails}
                calendarDate={calendarDate}
                setCalendarDate={setCalendarDate}
                setCalendarView={setCalendarView}
                calendarView={calendarView}
                range={range}
            />

            <Modal width={500} visible={!!eventDetails} onClose={closeEventFormModal}>
                <ModalHeader>
                    <CalendarEventLinkedSection interviewSection={eventDetails?.interviewSection} />
                </ModalHeader>
                <ModalContent className={s.SectionScheduleCalendar}>
                    {nullable(eventDetails?.interviewer?.name, (n) => (
                        <Text size="m">
                            {tr('Interviewer')}: {n}
                        </Text>
                    ))}

                    <UserComboBox
                        value={interviewers}
                        items={allInterviewers}
                        onChange={setInterviewer}
                        setInputValue={setSearch}
                        placeholder={tr('Add another interviewers')}
                    />

                    {nullable(eventDetails?.title, (t) => (
                        <Text as="span" size="s">
                            {t}
                        </Text>
                    ))}

                    <FormControl>
                        <FormControlLabel>{tr('Meeting link')}</FormControlLabel>
                        <FormControlInput
                            defaultValue={videoCallLink}
                            onChange={(e) => setVideoCallLink(e.target.value)}
                            autoComplete="off"
                        />
                    </FormControl>

                    <FormActions>
                        <Button onClick={closeEventFormModal} text={tr('Cancel')} />

                        {!eventDetails?.interviewSection && eventDetails?.eventId && (
                            <Button onClick={handleSlotSelectClicked} view="primary" text={tr('Choose')} />
                        )}
                    </FormActions>
                </ModalContent>
            </Modal>
        </>
    );
}
