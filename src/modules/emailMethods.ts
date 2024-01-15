import { ICalCalendarMethod } from 'ical-generator';
import { RRule } from 'rrule';

import config from '../config';
import { prisma } from '../utils/prisma';
import { formatDateToLocaleString } from '../utils/date';
import { Paths, generatePath } from '../utils/paths';
import { calendarEvents, createIcalEventData } from '../utils/ical';
import { userOfEvent } from '../utils/calendar';

import { UpdateSection } from './sectionTypes';
import { tr } from './modules.i18n';
import { sendMail } from './nodemailer';
import { calendarMethods } from './calendarMethods';

export const notifyHR = async (id: number, data: UpdateSection) => {
    if (!data.feedback) {
        return;
    }

    const section = await prisma.section.findFirst({
        where: { id },
        include: {
            interview: { include: { creator: true, candidate: true } },
            interviewer: true,
            sectionType: true,
        },
    });
    if (section?.interview?.creator?.email) {
        // TODO: add localization after https://github.com/taskany-inc/hire/issues/191
        return sendMail({
            to: section?.interview?.creator?.email,
            subject: `Interviewer ${section.interviewer.name || ''} left feedback for the section with ${
                section.interview.candidate.name
            }`,
            text: `Interviewer ${section.interviewer.name} recommends' ${
                data.hire ? `hire per ${data.grade} level/grade` : 'do not hire'
            } candidate ${section.interview.candidate.name}\n
            ${data.feedback}\n
            ${config.defaultPageURL}/${generatePath(Paths.SECTION, {
                interviewId: section.interviewId,
                sectionId: section.id,
            })}`,
        });
    }
};

export const cancelSectionEmail = async (sectionId: number) => {
    const section = await prisma.section.findFirstOrThrow({
        where: { id: sectionId },
        include: {
            interview: { include: { candidate: true } },
            calendarSlot: true,
            interviewer: true,
            sectionType: true,
        },
    });

    const date = section.calendarSlot?.date ? formatDateToLocaleString(section.calendarSlot?.date) : '';

    let cancelIcalEvent;
    if (section.calendarSlotId) {
        const { originalDate, ...restException } = await calendarMethods.getEventExceptionById(section.calendarSlotId);
        const icalEventDataCancelException = createIcalEventData({
            id: section.calendarSlotId,
            users: [userOfEvent(section.interviewer, null)],
            start: restException.date,
            description: restException.eventDetails.description,
            duration: restException.eventDetails.duration,
            summary: restException.eventDetails.title,
        });

        cancelIcalEvent = calendarEvents({
            method: ICalCalendarMethod.CANCEL,
            events: [icalEventDataCancelException],
        });

        const { eventDetails, ...series } = await calendarMethods.getEventById(restException.eventId);

        const exclude = [
            ...series.exceptions
                .map((exception) => exception.originalDate)
                .filter((date) => date.toTimeString() !== originalDate.toTimeString()),
            ...series.cancellations.map((cancelletion) => cancelletion.originalDate),
        ];

        const rRule = RRule.fromString(series.rule);

        const icalEventDataUpdateEvent = createIcalEventData({
            id: series.id,
            users: [userOfEvent(section.interviewer, null)],
            start: rRule.options.dtstart,
            duration: eventDetails.duration,
            description: eventDetails.description,
            summary: eventDetails.title,
            rule: rRule.options.freq,
            exclude: exclude.length ? exclude : undefined,
        });

        await sendMail({
            to: section.interviewer.email,
            subject: eventDetails.title,
            text: '',
            icalEvent: calendarEvents({
                method: ICalCalendarMethod.REQUEST,
                events: [icalEventDataUpdateEvent],
            }),
        });
    }

    return sendMail({
        to: section.interviewer.email,
        subject: tr('Cancel section'),
        text: `${tr('Canceled section with')} ${section.interview.candidate.name} ${date}
            ${config.defaultPageURL}/${generatePath(Paths.SECTION, {
            interviewId: section.interviewId,
            sectionId: section.id,
        })}`,
        icalEvent: cancelIcalEvent,
    });
};

export const assignSectionEmail = async (
    calendarSlotId: string,
    interviewerId: number,
    interviewId: number,
    sectionId: number,
    candidateName: string,
    description?: string | null,
) => {
    const interviewer = await prisma.user.findFirstOrThrow({ where: { id: interviewerId } });
    const exception = await prisma.calendarEventException.findFirstOrThrow({
        where: { id: calendarSlotId },
        include: { eventDetails: true },
    });
    const icalEventDataException = createIcalEventData({
        id: calendarSlotId,
        users: [{ email: interviewer.email, name: interviewer.name || undefined }],
        start: exception.date,
        description: description || exception.eventDetails.description,
        duration: exception.eventDetails.duration,
        summary: `Interview with ${candidateName}`,
        url: `${config.defaultPageURL}/${generatePath(Paths.SECTION, {
            interviewId,
            sectionId,
        })}`,
    });
    const { eventDetails, creator, ...series } = await calendarMethods.getEventById(exception.eventId);

    const rRule = RRule.fromString(series.rule);
    const exclude = [
        ...series.exceptions.map((exception) => exception.originalDate),
        ...series.cancellations.map((cancelletion) => cancelletion.originalDate),
    ];

    const icalEventDataUpdateEvent = createIcalEventData({
        id: series.id,
        users: [{ email: interviewer.email, name: interviewer.name || undefined }],
        start: rRule.options.dtstart,
        duration: eventDetails.duration,
        description: eventDetails.description,
        summary: eventDetails.title,
        rule: rRule.options.freq,
        exclude,
    });

    await sendMail({
        to: interviewer.email,
        subject: `Interview with ${candidateName}`,
        text: `${config.defaultPageURL}/${generatePath(Paths.SECTION, {
            interviewId,
            sectionId,
        })}`,
        icalEvent: calendarEvents({
            method: ICalCalendarMethod.REQUEST,
            events: [icalEventDataException],
        }),
    });

    await sendMail({
        to: interviewer.email,
        subject: eventDetails.title,
        text: '',
        icalEvent: calendarEvents({
            method: ICalCalendarMethod.REQUEST,
            events: [icalEventDataUpdateEvent],
        }),
    });
};
