import { isSameMinute, differenceInMinutes } from 'date-fns';
import { useMemo, useState } from 'react';
import { View } from 'react-big-calendar';
import { Button, Modal, ModalContent, ModalCross, ModalHeader, Text } from '@taskany/bricks/harmony';

import {
    useCalendarEventCreateMutation,
    useCalendarEventUpdateMutation,
    useCalendarRemoveEventMutation,
} from '../../modules/calendarEventsHooks';
import { usePromiseResolver } from '../../hooks/usePromiseResolver';
import { useSession } from '../../contexts/appSettingsContext';
import { CalendarSerialEventPart, UpdateCalendarException, UpdateCalendarSeries } from '../../modules/calendarTypes';
import { DateRange, firstVisibleDay, lastVisibleDay } from '../../utils/date';
import { Stack } from '../Stack';
import { toDate, getEventDuration, defaultEventLengthInMinutes, BigCalendarEvent } from '../../utils/calendar';
import {
    CalendarEventFormInitialValues,
    CalendarEventForm,
    CalendarEventFormValues,
} from '../CalendarEventForm/CalendarEventForm';
import { SlotCalendar, EventDropHandler, SlotInfo, stringOrDate } from '../SlotCalendar/SlotCalendar';
import {
    CalendarEventLinkedSection,
    CalendarEventLinkedSectionProps,
} from '../CalendarEventLinkedSection/CalendarEventLinkedSection';

import { tr } from './InterviewSectionSlotCalendar.i18n';
import s from './InterviewSectionSlotCalendar.module.css';

interface SerialEventUpdateParams extends Partial<CalendarEventFormValues> {
    operation: 'update';
    eventId: string;
    originalDate: Date;
}

interface SerialEventRemoveParams {
    operation: 'remove';
    eventId: string;
    originalDate: Date;
}

type SerialEventParams = SerialEventUpdateParams | SerialEventRemoveParams;

interface EventFormParams extends CalendarEventLinkedSectionProps {
    initialValues: CalendarEventFormInitialValues;
    eventId?: string;
    exceptionId?: string;
    isRecurrent?: boolean;
    creatorId?: number;
}

interface InterviewSectionSlotCalendarProps {
    interviewerIds?: number[];
    my?: boolean;
}

export function InterviewSectionSlotCalendar(props: InterviewSectionSlotCalendarProps) {
    const [calendarDate, setCalendarDate] = useState(() => new Date());
    const [calendarView, setCalendarView] = useState<View>('work_week');
    const range = useMemo<DateRange>(() => {
        const nextRange = {
            startDate: firstVisibleDay(calendarDate, calendarView),
            endDate: lastVisibleDay(calendarDate, calendarView),
        };

        return nextRange;
    }, [calendarDate, calendarView]);

    const { interviewerIds } = props;

    const { user, userRoles } = useSession() ?? {};

    const eventCreateMutation = useCalendarEventCreateMutation();
    const eventUpdateMutation = useCalendarEventUpdateMutation();
    const eventRemoveEventMutation = useCalendarRemoveEventMutation();

    const [eventForm, setEventForm] = useState<EventFormParams | null>(null);
    const [startEventFormSubmit, resolveEventFormSubmit, rejectEventFormSubmit] = usePromiseResolver<void>();

    const canReadEvents = userRoles?.hasInterviewerRoles || userRoles?.hasRecruiterRoles || user?.admin;
    const canCreateEvents = userRoles?.hasInterviewerRoles || user?.admin;

    const canOpenEventForm = eventForm?.eventId ? canReadEvents : canCreateEvents;

    const closeEventFormModal = () => {
        setEventForm(null);
    };

    const [seriesUpdatePartDialog, setSeriesUpdatePartDialog] = useState<SerialEventParams | null>(null);

    const closeUpdatePartDialog = () => {
        setSeriesUpdatePartDialog(null);
    };

    const finishEventFormSubmit = () => {
        closeEventFormModal();
        closeUpdatePartDialog();
        resolveEventFormSubmit();
    };

    const createSeries = async ({ date, duration, title, description, recurrence }: CalendarEventFormValues) => {
        await eventCreateMutation.mutateAsync({
            date,
            duration,
            title,
            description,
            recurrence,
        });

        finishEventFormSubmit();
    };

    const handleSeriesPartSelected = (part: CalendarSerialEventPart) => async (): Promise<void> => {
        if (!seriesUpdatePartDialog) {
            return;
        }

        const { operation, eventId, originalDate } = seriesUpdatePartDialog;

        if (operation === 'remove') {
            await eventRemoveEventMutation.mutateAsync({
                part,
                eventId,
                originalDate,
                exceptionId: undefined,
                creatorIds: interviewerIds ?? (user?.id ? [user.id] : []),
                startDate: range.startDate,
                endDate: range.endDate,
            });
        } else {
            await eventUpdateMutation.mutateAsync({
                ...seriesUpdatePartDialog,
                part,
                exceptionId: undefined,
                creatorIds: interviewerIds ?? (user?.id ? [user.id] : []),
                startDate: range.startDate,
                endDate: range.endDate,
            });
        }

        finishEventFormSubmit();
    };

    const onEventDrop: EventDropHandler = (params) => {
        const { exceptionId, eventId, isRecurrent } = params.event;
        const start = toDate(params.start);
        const originalDate = params.event.start;

        if (exceptionId) {
            const updateParams: UpdateCalendarException = {
                part: 'exception',
                originalDate,
                exceptionId,
                eventId,
                date: start,
                creatorIds: interviewerIds ?? (user?.id ? [user.id] : []),
                startDate: range.startDate,
                endDate: range.endDate,
            };

            eventUpdateMutation.mutateAsync(updateParams);
        } else if (!isRecurrent) {
            const updateParams: UpdateCalendarSeries = {
                part: 'series',
                eventId,
                exceptionId: undefined,
                originalDate,
                date: start,
                creatorIds: interviewerIds ?? (user?.id ? [user.id] : []),
                startDate: range.startDate,
                endDate: range.endDate,
            };

            eventUpdateMutation.mutateAsync(updateParams);
        } else {
            const duration = getEventDuration(start, toDate(params.end));
            const { title, description } = params.event;

            setSeriesUpdatePartDialog({
                operation: 'update',
                eventId,
                date: start,
                originalDate,
                duration,
                title,
                description,
            });
        }
    };

    const createEvent = async ({ action, start, end }: SlotInfo) => {
        const startDate = toDate(start);
        const duration =
            action === 'select' ? differenceInMinutes(toDate(end), startDate) : defaultEventLengthInMinutes;

        setEventForm({
            initialValues: {
                date: startDate,
                duration,
            },
            interviewSection: null,
        });
    };

    const openEventDetails = ({
        eventId,
        exceptionId,
        start,
        end,
        title,
        description,
        isRecurrent,
        interviewSection,
        creator,
    }: BigCalendarEvent) => {
        const startDate = toDate(start);
        setEventForm({
            eventId,
            exceptionId,
            initialValues: {
                date: startDate,
                duration: differenceInMinutes(toDate(end), startDate),
                title,
                description,
            },
            isRecurrent,
            interviewSection,
            creatorId: creator?.id,
        });
    };
    const resizeEvent = (params: {
        event: BigCalendarEvent;
        start: stringOrDate;
        end: stringOrDate;
        isAllDay: boolean;
    }) => {
        const nextStart = toDate(params.start);
        const nextEnd = toDate(params.end);
        const duration = getEventDuration(nextStart, nextEnd);
        const { exceptionId, eventId, start, title, description, isRecurrent } = params.event;

        const changedDate = isSameMinute(toDate(start), nextStart) ? undefined : nextStart;

        if (exceptionId) {
            const updateParams: UpdateCalendarException = {
                part: 'exception',
                eventId,
                exceptionId,
                originalDate: start,

                date: changedDate,
                duration,
                creatorIds: interviewerIds ?? (user?.id ? [user.id] : []),
                startDate: range.startDate,
                endDate: range.endDate,
            };

            eventUpdateMutation.mutateAsync(updateParams);
        } else if (!isRecurrent) {
            eventUpdateMutation.mutateAsync({
                part: 'series',
                eventId,
                exceptionId: undefined,
                originalDate: start,

                date: changedDate,
                duration,
                creatorIds: interviewerIds ?? (user?.id ? [user.id] : []),
                startDate: range.startDate,
                endDate: range.endDate,
            });
        } else {
            setSeriesUpdatePartDialog({
                operation: 'update',
                eventId,
                originalDate: start,

                date: nextStart,
                duration,
                title,
                description,
            });
        }
    };

    const saveEventDetails = async (values: CalendarEventFormValues): Promise<void> => {
        if (!eventForm) {
            return;
        }

        const { eventId, exceptionId, initialValues, isRecurrent } = eventForm;
        const originalDate = initialValues.date;

        if (eventId && !initialValues.date) {
            throw new Error(tr('The updated event must have the original date'));
        }

        try {
            if (!eventId) {
                await createSeries(values);
            } else if (exceptionId) {
                await eventUpdateMutation.mutateAsync({
                    part: 'exception',
                    eventId,
                    originalDate,
                    exceptionId,
                    date: values.date,
                    duration: values.duration,
                    title: values.title,
                    description: values.description,
                    creatorIds: interviewerIds ?? (user?.id ? [user.id] : []),
                    startDate: range.startDate,
                    endDate: range.endDate,
                });

                finishEventFormSubmit();
            } else if (!isRecurrent) {
                await eventUpdateMutation.mutateAsync({
                    part: 'series',
                    eventId,
                    originalDate,
                    exceptionId,
                    date: values.date,
                    duration: values.duration,
                    title: values.title,
                    description: values.description,
                    creatorIds: interviewerIds ?? (user?.id ? [user.id] : []),
                    startDate: range.startDate,
                    endDate: range.endDate,
                });

                finishEventFormSubmit();
            } else {
                setSeriesUpdatePartDialog({
                    operation: 'update',
                    eventId,
                    originalDate: originalDate as Date,
                    date: isSameMinute(values.date, originalDate as Date) ? undefined : values.date,
                    title: values.title,
                    description: values.description,
                    duration: values.duration,
                });

                await startEventFormSubmit();
            }
        } catch (reason) {
            rejectEventFormSubmit(reason);
        }
    };

    const handleRemove = async () => {
        if (!eventForm) {
            return;
        }

        const { eventId, exceptionId, initialValues, isRecurrent } = eventForm;
        const originalDate = initialValues.date;

        if (!eventId) {
            // If an event has not yet been created, it cannot be deleted
            return;
        }

        if (exceptionId) {
            await eventRemoveEventMutation.mutateAsync({
                part: 'exception',
                eventId,
                exceptionId,
                originalDate,
                creatorIds: interviewerIds ?? (user?.id ? [user.id] : []),
                startDate: range.startDate,
                endDate: range.endDate,
            });

            finishEventFormSubmit();
        } else if (!isRecurrent) {
            await eventRemoveEventMutation.mutateAsync({
                part: 'series',
                eventId,
                exceptionId,
                originalDate,
                creatorIds: interviewerIds ?? (user?.id ? [user.id] : []),
                startDate: range.startDate,
                endDate: range.endDate,
            });

            finishEventFormSubmit();
        } else {
            const dialogParams: SerialEventRemoveParams = {
                operation: 'remove',
                eventId,
                originalDate,
            };

            setSeriesUpdatePartDialog(dialogParams);
        }
    };

    const isLoading =
        eventCreateMutation.isLoading || eventUpdateMutation.isLoading || eventRemoveEventMutation.isLoading;

    return (
        <>
            <SlotCalendar
                isLoading={isLoading}
                creatorIds={interviewerIds ?? (user?.id ? [user.id] : [])}
                selectable
                resizable
                onEventResize={resizeEvent}
                onEventDrop={onEventDrop}
                onSelectSlot={createEvent}
                onSelectEvent={openEventDetails}
                calendarDate={calendarDate}
                setCalendarDate={setCalendarDate}
                setCalendarView={setCalendarView}
                calendarView={calendarView}
                range={range}
                my={props.my}
            />

            <Modal
                width={500}
                visible={!!seriesUpdatePartDialog}
                onClose={closeUpdatePartDialog}
                className={s.InterviewSectionSlotCalendarModal}
            >
                <ModalHeader>
                    <Text size="l" weight="bold">
                        {tr('Edit a recurring event')}
                    </Text>
                </ModalHeader>
                <ModalContent>
                    <Text>{tr('What part of the event series do you want to change?')}</Text>
                    <Stack direction="row" gap={10} justifyContent="flex-start" style={{ marginTop: 15 }}>
                        <Button
                            onClick={handleSeriesPartSelected('exception')}
                            text={tr('Just this')}
                            disabled={isLoading}
                        />
                        <Button
                            onClick={handleSeriesPartSelected('future')}
                            text={tr('This and subsequent')}
                            disabled={isLoading}
                        />
                        <Button
                            onClick={handleSeriesPartSelected('series')}
                            text={tr('Whole series')}
                            disabled={isLoading}
                        />
                    </Stack>
                </ModalContent>
            </Modal>

            <Modal width={600} visible={!!eventForm && canOpenEventForm} onClose={closeEventFormModal}>
                <ModalHeader>
                    <ModalCross onClick={closeEventFormModal} />
                    <CalendarEventLinkedSection interviewSection={eventForm?.interviewSection} />
                </ModalHeader>
                <ModalContent>
                    {eventForm && (
                        <CalendarEventForm
                            initialValues={eventForm.initialValues}
                            onSave={saveEventDetails}
                            isNew={!eventForm.eventId}
                            deleteButtonText={eventForm?.eventId && tr('Delete')}
                            onDeleteButton={handleRemove}
                            deleteButtonDisabled={eventRemoveEventMutation.isLoading}
                            creatorId={eventForm.creatorId}
                        />
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
