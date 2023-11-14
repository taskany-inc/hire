import { useState, useCallback, useMemo } from 'react';
import { View } from 'react-big-calendar';
import { User } from '@prisma/client';
import { Text, Button, Modal, ModalHeader, ModalContent } from '@taskany/bricks';

import { InlineDot } from '../InlineDot';
import { DateRange, firstVisibleDay, lastVisibleDay } from '../../utils/date';
import { SectionCalendarSlotBooking } from '../../modules/sectionTypes';
import { SlotCalendar } from '../SlotCalendar';
import {
    CalendarEventLinkedSection,
    CalendarEventLinkedSectionProps,
} from '../CalendarEventLinkedSection/CalendarEventLinkedSection';
import { BigCalendarEvent } from '../../utils/calendar';

import { tr } from './SectionScheduleCalendar.i18n';

export interface CalendarEventDetails extends CalendarEventLinkedSectionProps {
    eventId: string;
    exceptionId: string | undefined;
    interviewer: User | null;
    title: string;
    originalDate: Date;
}

interface Props {
    interviewerIds: number[];
    onSlotSelected: (eventDetails: CalendarEventDetails) => void;
    selectedSlot: SectionCalendarSlotBooking | undefined;
    isSectionSubmitting: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function SectionScheduleCalendar({ interviewerIds, onSlotSelected, isSectionSubmitting }: Props) {
    const [eventDetails, setEventDetails] = useState<CalendarEventDetails | null>(null);
    const closeEventFormModal = useCallback(() => {
        setEventDetails(null);
    }, []);
    const [calendarDate, setCalendarDate] = useState(() => new Date());
    const [calendarView, setCalendarView] = useState<View>('work_week');
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

        onSlotSelected(eventDetails);
        closeEventFormModal();
    }, [closeEventFormModal, eventDetails, onSlotSelected]);

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

            <Modal width={200} visible={!!eventDetails} onClose={closeEventFormModal}>
                <ModalHeader>
                    <CalendarEventLinkedSection interviewSection={eventDetails?.interviewSection} />
                </ModalHeader>
                <ModalContent>
                    <>
                        <Text size="s">{eventDetails?.interviewer?.name}</Text>
                        <InlineDot />
                        <Text size="s">{eventDetails?.title}</Text>
                    </>
                    <Button onClick={closeEventFormModal} text={tr('Cancel')} />

                    {!eventDetails?.interviewSection && eventDetails?.eventId && (
                        <Button onClick={handleSlotSelectClicked} text={tr('Choose')} />
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
