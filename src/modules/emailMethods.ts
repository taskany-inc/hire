import { ICalCalendarMethod } from 'ical-generator';
import { RRule } from 'rrule';
import { User } from '@prisma/client';

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

export interface AssignSectionEmailData {
    calendarSlotId: string;
    interviewerId: number;
    interviewId: number;
    sectionId: number;
    candidateName: string;
    sectionTypeTitle: string;
    isSlotException?: boolean;
    location?: string;
    description?: string;
    creator: User;
}

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
            ${config.defaultPageURL}${generatePath(Paths.SECTION, {
                interviewId: section.interviewId,
                sectionId: section.id,
            })}`,
        });
    }
};

export const cancelSectionEmail = async (sectionId: number, cancelComment: string) => {
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

    let cancelEmailSubject = tr('Cancel section');
    let cancelIcalEvent;
    if (section.calendarSlotId) {
        const { originalDate, sequence, ...restException } = await prisma.calendarEventException.update({
            where: { id: section.calendarSlotId },
            data: { sequence: { increment: 1 } },
            include: { event: true, eventDetails: true },
        });

        const rRule = RRule.fromString(restException.event.rule);

        const icalId = rRule.options.freq ? section.calendarSlotId : restException.event.id;

        const icalSequence = rRule.options.freq ? sequence : restException.event.sequence;

        const icalEventDataCancelException = createIcalEventData({
            id: icalId,
            users: [userOfEvent(section.interviewer, null)],
            start: restException.date,
            description: restException.eventDetails.description,
            duration: restException.eventDetails.duration,
            summary: restException.eventDetails.title,
            sequence: icalSequence,
        });

        cancelIcalEvent = calendarEvents({
            method: ICalCalendarMethod.REQUEST,
            events: [icalEventDataCancelException],
        });
        cancelEmailSubject = restException.eventDetails.title;
    }

    return sendMail({
        to: section.interviewer.email,
        subject: cancelEmailSubject,
        text: `${tr('Canceled section with')}
${section.interview.candidate.name} ${date}
${cancelComment}
${config.defaultPageURL}${generatePath(Paths.SECTION, {
            interviewId: section.interviewId,
            sectionId: section.id,
        })}`,
        icalEvent: cancelIcalEvent,
    });
};

export const assignSectionEmail = async (data: AssignSectionEmailData) => {
    const interviewer = await prisma.user.findFirstOrThrow({ where: { id: data.interviewerId } });
    const exception = await prisma.calendarEventException.findFirstOrThrow({
        where: { id: data.calendarSlotId },
        include: { eventDetails: true, event: true },
    });
    const rRule = RRule.fromString(exception.event.rule);

    const icalId = rRule.options.freq ? data.calendarSlotId : exception.event.id;

    const icalSequence = rRule.options.freq ? exception.sequence : exception.event.sequence;

    const icalEventDataException = createIcalEventData({
        id: icalId,
        users: [{ email: interviewer.email, name: interviewer.name || undefined }],
        start: exception.date,
        description: data.description || exception.eventDetails.description,
        duration: exception.eventDetails.duration,
        summary: `${data.sectionTypeTitle} ${tr('with')} ${data.candidateName}`,
        url: `${config.defaultPageURL}${generatePath(Paths.SECTION, {
            interviewId: data.interviewId,
            sectionId: data.sectionId,
        })}`,
        location: data.location,
        sequence: icalSequence + 1,
    });

    rRule.options.freq
        ? await calendarMethods.updateEventException(data.calendarSlotId, { sequence: { increment: 1 } })
        : await calendarMethods.updateEvent(exception.event.id, { sequence: { increment: 1 } });

    if (!data.isSlotException && rRule.options.freq) {
        const { eventDetails, creator, sequence, ...series } = await calendarMethods.updateEvent(exception.eventId, {
            sequence: { increment: 1 },
        });
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
            sequence,
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
    }

    await sendMail({
        to: interviewer.email,
        subject: `${data.sectionTypeTitle} ${tr('with')} ${data.candidateName}`,
        text: `${config.defaultPageURL}${generatePath(Paths.SECTION, {
            interviewId: data.interviewId,
            sectionId: data.sectionId,
        })}

${data.creator.name || ''} ${config.sourceUsers.userByEmailLink}/${encodeURIComponent(data.creator.email)}
        
${data.location || ''}`,
        icalEvent: calendarEvents({
            method: ICalCalendarMethod.REQUEST,
            events: [icalEventDataException],
        }),
    });
};
