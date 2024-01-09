import { InterviewStatus, Prisma, Section, Attach } from '@prisma/client';
import { ICalCalendarMethod } from 'ical-generator';
import { RRule } from 'rrule';

import { prisma } from '../utils/prisma';
import { ErrorWithStatus, idsToIdObjs } from '../utils';
import { calendarEvents, createIcalEventData } from '../utils/ical';
import config from '../config';
import { Paths, generatePath } from '../utils/paths';

import {
    CreateSection,
    UpdateSection,
    GetInterviewSections,
    SectionCalendarSlotBooking,
    SectionWithSectionType,
    SectionWithRelationsAndResults,
    DeleteSection,
    CancelSection,
} from './sectionTypes';
import { SectionWithInterviewRelation } from './interviewTypes';
import { calendarMethods } from './calendarMethods';
import { cancelSectionEmail, notifyHR } from './emaiMethods';
import { AccessOptions } from './accessChecks';
import { tr } from './modules.i18n';
import { sendMail } from './nodemailer';

async function getCalendarSlotData(
    params: SectionCalendarSlotBooking | undefined,
): Promise<Prisma.CalendarEventExceptionCreateNestedOneWithoutInterviewSectionInput | undefined> {
    if (!params) {
        return undefined;
    }

    const { eventId, exceptionId, originalDate } = params;
    await calendarMethods.isEventExceptionUnique(originalDate, eventId);

    if (!exceptionId) {
        const event = await calendarMethods.getEventById(eventId);
        const { eventDetails } = event;
        const { title, description, duration } = eventDetails;

        return {
            create: {
                event: { connect: { id: eventId } },
                eventDetails: {
                    create: {
                        title,
                        description,
                        duration,
                    },
                },
                originalDate,
                date: originalDate,
            },
        };
    }
}

const create = async (data: CreateSection): Promise<Section> => {
    const { interviewId, interviewerId, sectionTypeId, calendarSlot, ...restData } = data;

    const interview = await prisma.interview.findFirstOrThrow({
        where: { id: interviewId },
        include: { candidate: true },
    });

    if (interview && interview.status === InterviewStatus.NEW) {
        await prisma.interview.update({
            data: { status: InterviewStatus.IN_PROGRESS },
            where: { id: interviewId },
        });
    }
    let slot;

    if (calendarSlot) {
        slot = await getCalendarSlotData(calendarSlot);

        if (calendarSlot && slot === undefined) {
            throw new ErrorWithStatus(tr('Calendar slot did not link to section'), 500);
        }
    }

    const createData: Prisma.SectionCreateInput = {
        ...restData,
        sectionType: { connect: { id: sectionTypeId } },
        interview: { connect: { id: interviewId } },
        interviewer: { connect: { id: interviewerId } },
        calendarSlot: slot,
    };

    const newSection = await prisma.section.create({ data: createData });

    if (newSection.calendarSlotId && calendarSlot) {
        const exception = await prisma.calendarEventException.findFirstOrThrow({
            where: { id: newSection.calendarSlotId },
            include: { eventDetails: true },
        });

        const interviewer = await prisma.user.findFirstOrThrow({ where: { id: interviewerId } });

        const icalEventDataException = createIcalEventData({
            id: newSection.calendarSlotId,
            users: [{ email: interviewer.email, name: interviewer.name || undefined }],
            start: exception.date,
            description: restData.description || exception.eventDetails.description,
            duration: exception.eventDetails.duration,
            summary: `Interview with ${interview.candidate.name}`,
            url: `${config.defaultPageURL}/${generatePath(Paths.SECTION, {
                interviewId,
                sectionId: newSection.id,
            })}`,
        });
        const { eventDetails, creator, ...series } = await calendarMethods.getEventById(exception.eventId);

        const rRule = RRule.fromString(series.rule);
        const exclude = [
            ...series.exceptions.map((exception) => exception.originalDate),
            ...series.cancellations.map((cancelletion) => cancelletion.originalDate),
            calendarSlot?.originalDate,
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
            from: 'Hire',
            to: interviewer.email,
            subject: `Interview with ${interview.candidate.name}`,
            text: `${config.defaultPageURL}/${generatePath(Paths.SECTION, {
                interviewId,
                sectionId: newSection.id,
            })}`,
            icalEvent: calendarEvents({
                method: ICalCalendarMethod.REQUEST,
                events: [icalEventDataException],
            }),
        });

        await sendMail({
            from: 'Hire',
            to: interviewer.email,
            subject: eventDetails.title,
            text: '',
            icalEvent: calendarEvents({
                method: ICalCalendarMethod.REQUEST,
                events: [icalEventDataUpdateEvent],
            }),
        });
    }

    return newSection;
};

const getById = async (id: number, accessOptions: AccessOptions = {}): Promise<SectionWithRelationsAndResults> => {
    const { hideSectionGradesBySectionIds } = accessOptions;
    const section = await prisma.section.findFirst({
        where: { id },
        orderBy: {
            createdAt: 'asc',
        },
        include: {
            interview: { include: { candidate: true, sections: true } },
            interviewer: true,
            solutions: true,
            sectionType: true,
            attaches: true,
        },
    });
    let passedSections: SectionWithSectionType[] = [];

    if (section === null) {
        throw new ErrorWithStatus(tr('Section not found'), 404);
    }

    if (section.sectionType.showOtherGrades) {
        passedSections = await prisma.section.findMany({
            where: {
                AND: [
                    {
                        interviewId: section.interviewId,
                    },
                    {
                        NOT: {
                            id: section.id,
                        },
                    },
                    {
                        isCanceled: false,
                    },
                ],
            },
            orderBy: {
                createdAt: 'asc',
            },
            include: { sectionType: true, interviewer: true },
        });
        passedSections.forEach((s) => {
            if (hideSectionGradesBySectionIds?.includes(s.id)) {
                s.grade = null;
            }
        });
    }

    if (hideSectionGradesBySectionIds?.includes(id)) {
        section.grade = null;
    }

    section.attaches = section.attaches.filter((attach: Attach) => !attach.deletedAt);

    return { ...section, passedSections };
};

const getInterviewSections = (data: GetInterviewSections) => {
    return prisma.section.findMany({
        where: { interviewId: data.interviewId, isCanceled: false },
        include: { solutions: true, sectionType: true },
    });
};

const findAllInterviewerSections = async (
    interviewerId: number,
    completed: boolean,
): Promise<SectionWithInterviewRelation[]> => {
    const feedback = completed ? { not: null } : null;

    const interview = completed ? undefined : { status: { notIn: [InterviewStatus.HIRED, InterviewStatus.REJECTED] } };

    return prisma.section.findMany({
        where: {
            interviewerId,
            feedback,
            isCanceled: false,
            interview,
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            interview: {
                include: {
                    candidate: true,
                },
            },
            sectionType: true,
        },
    });
};

const update = async (data: UpdateSection): Promise<Section> => {
    const { sectionId, solutionIds, interviewerId, interviewId, sendHrMail, calendarSlot, attachIds, ...restData } =
        data;
    let slot;

    if (calendarSlot) {
        slot = await getCalendarSlotData(calendarSlot);

        if (calendarSlot && slot === undefined) {
            throw new ErrorWithStatus(tr('Calendar slot did not link to section'), 500);
        }
        const currentSection = await getById(sectionId);
        currentSection.calendarSlotId &&
            (await prisma.calendarEventException.delete({ where: { id: currentSection.calendarSlotId } }));
    }

    const updateData = {
        ...restData,
        solutions: solutionIds && { connect: idsToIdObjs(solutionIds) },
        interview: { connect: { id: interviewId } },
        interviewer: { connect: { id: interviewerId } },
        calendarSlot: slot,
        attaches: attachIds ? { connect: idsToIdObjs(attachIds) } : undefined,
    };

    sendHrMail && notifyHR(sectionId, data);

    return prisma.section.update({ data: updateData, where: { id: sectionId } });
};

const cancelSection = async (data: CancelSection): Promise<Section> => {
    const { sectionId, cancelComment, calendarSlotId } = data;
    cancelSectionEmail(sectionId);

    if (calendarSlotId) {
        await prisma.calendarEventException.delete({ where: { id: calendarSlotId } });
    }

    return prisma.section.update({
        data: { isCanceled: true, canceledAt: new Date(), cancelComment, calendarSlotId: null },
        where: { id: sectionId },
    });
};

const deleteSection = async ({ sectionId }: DeleteSection): Promise<Section> => {
    return prisma.section.delete({ where: { id: sectionId } });
};

export const sectionMethods = {
    create,
    getById,
    getInterviewSections,
    update,
    findAllInterviewerSections,
    delete: deleteSection,
    cancel: cancelSection,
};
