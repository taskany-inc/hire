import { useState, useCallback, useMemo } from 'react';
import { View } from 'react-big-calendar';
import { User } from '@prisma/client';
import { Text, Button, Modal, ModalHeader, ModalContent, FormInput } from '@taskany/bricks';
import styled from 'styled-components';
import { gapL, gapM, gapS } from '@taskany/colors';

import { InlineDot } from '../InlineDot';
import { DateRange, firstVisibleDay, lastVisibleDay } from '../../utils/date';
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
interface SectionScheduleCalendarProps {
    interviewerIds: number[];
    onSlotSelected: (eventDetails: CalendarEventDetails) => void;
    isSectionSubmitting: boolean;
    setVideoCallLink: (arg: string) => void;
}

const StyledButtonWrapper = styled.div`
    display: flex;
    gap: ${gapS};
    float: right;
    margin: ${gapL} 0 ${gapM} 0;
`;

const StyledTextWrapper = styled.div`
    margin-top: ${gapS};
`;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function SectionScheduleCalendar({
    interviewerIds,
    onSlotSelected,
    isSectionSubmitting,
    setVideoCallLink,
}: SectionScheduleCalendarProps) {
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

            <Modal width={500} visible={!!eventDetails} onClose={closeEventFormModal}>
                <ModalHeader>
                    <CalendarEventLinkedSection interviewSection={eventDetails?.interviewSection} />
                </ModalHeader>
                <ModalContent>
                    <Text size="m">{eventDetails?.interviewer?.name}</Text>

                    <StyledTextWrapper>
                        {' '}
                        <InlineDot />
                        <Text as="span" size="s">
                            {eventDetails?.title}
                        </Text>
                        <FormInput
                            label={tr('Meeting link')}
                            onChange={(e) => setVideoCallLink(e.target.value)}
                            autoComplete="off"
                            flat="bottom"
                        />
                    </StyledTextWrapper>
                    <StyledButtonWrapper>
                        <Button onClick={closeEventFormModal} text={tr('Cancel')} />

                        {!eventDetails?.interviewSection && eventDetails?.eventId && (
                            <Button onClick={handleSlotSelectClicked} view="primary" outline text={tr('Choose')} />
                        )}
                    </StyledButtonWrapper>
                </ModalContent>
            </Modal>
        </>
    );
}
