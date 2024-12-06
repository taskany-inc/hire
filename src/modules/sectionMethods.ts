import { InterviewStatus, Prisma, Section, Attach, User } from '@prisma/client';
import { RRule } from 'rrule';

import { prisma } from '../utils/prisma';
import { ErrorWithStatus, idObjsToIds, idsToIdObjs } from '../utils';
import config from '../config';

import {
    CreateSection,
    UpdateSection,
    SectionCalendarSlotBooking,
    SectionWithSectionType,
    SectionWithRelationsAndResults,
    DeleteSection,
    CancelSection,
} from './sectionTypes';
import { SectionWithInterviewRelation } from './interviewTypes';
import { calendarMethods } from './calendarMethods';
import { assignSectionEmail, cancelSectionEmail, notifyHR } from './emailMethods';
import { AccessOptions } from './accessChecks';
import { tr } from './modules.i18n';
import { interviewMethods } from './interviewMethods';
import { sectionTypeMethods } from './sectionTypeMethods';
import { hireStreamMethods } from './hireStreamMethods';
import { commentMethods } from './commentMethods';
import { analyticsEventMethods } from './analyticsEventMethods';
import { userMethods } from './userMethods';
import { crewMethods } from './crewMethods';

async function getCalendarSlotData(
    params: SectionCalendarSlotBooking | undefined,
): Promise<Prisma.CalendarEventExceptionCreateNestedOneWithoutInterviewSectionInput | undefined> {
    if (!params) {
        return undefined;
    }

    const { eventId, exceptionId, originalDate } = params;
    const existingExceptionId = await calendarMethods.isEventExceptionAlreadyExist(originalDate, eventId);

    if (existingExceptionId) return { connect: { id: existingExceptionId } };

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

const giveSectionAchievement = async (interviewerId: number) => {
    if (!config.crew.techUserEmail) return;

    const amountOfInterviewerCompletedSections = await prisma.section.count({
        where: {
            interviewers: { some: { id: interviewerId } },
            feedback: { not: null },
            sectionType: { giveAchievement: true },
        },
    });

    const { email } = await userMethods.find(interviewerId);

    const achievementResult = await crewMethods.giveAchievement({
        targetUserEmail: email,
        actingUserEmail: config.crew.techUserEmail,
        sectionsNumber: amountOfInterviewerCompletedSections,
    });

    console.log(`Crew achievement response: ${achievementResult}`);
};

const create = async (data: CreateSection, user: User): Promise<Section> => {
    const { interviewId, interviewerIds, sectionTypeId, calendarSlot, ...restData } = data;

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
        slot = calendarSlot.exceptionId
            ? { connect: { id: calendarSlot.exceptionId } }
            : await getCalendarSlotData(calendarSlot);

        if (calendarSlot && slot === undefined) {
            throw new ErrorWithStatus(tr('Calendar slot did not link to section'), 500);
        }
    }

    const createData: Prisma.SectionCreateInput = {
        ...restData,
        sectionType: { connect: { id: sectionTypeId } },
        interview: { connect: { id: interviewId } },
        interviewers: { connect: idsToIdObjs(interviewerIds) },
        calendarSlot: slot,
    };

    const newSection = await prisma.section.create({ data: createData, include: { sectionType: true } });

    const sectionTypeTitle = newSection.sectionType.title;

    if (newSection.calendarSlotId && calendarSlot) {
        await assignSectionEmail({
            calendarSlotId: newSection.calendarSlotId,
            interviewerIds,
            interviewId,
            sectionId: newSection.id,
            candidateName: interview.candidate.name,
            sectionTypeTitle,
            isSlotException: !!calendarSlot.exceptionId,
            location: restData.videoCallLink!,
            creator: user,
        });
    }
    return newSection;
};

const getById = async (id: number, accessOptions: AccessOptions = {}): Promise<SectionWithRelationsAndResults> => {
    const { filterSectionGradeByInterviewer } = accessOptions;
    const section = await prisma.section.findFirst({
        where: { id },
        orderBy: {
            createdAt: 'asc',
        },
        include: {
            interview: {
                include: {
                    candidate: true,
                    sections: { include: { interviewers: true } },
                    allowedUsers: true,
                    restrictedUsers: true,
                },
            },
            interviewer: true,
            interviewers: true,
            solutions: { include: { problem: true } },
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
            include: { sectionType: true, interviewers: true, interviewer: true },
        });
        passedSections.forEach((s) => {
            if (
                filterSectionGradeByInterviewer &&
                s.interviewers.some(({ id }) => id !== filterSectionGradeByInterviewer)
            ) {
                s.grade = null;
            }
        });
    }

    if (
        filterSectionGradeByInterviewer &&
        section.interviewers.some(({ id }) => id !== filterSectionGradeByInterviewer)
    ) {
        section.grade = null;
    }

    section.attaches = section.attaches.filter((attach: Attach) => !attach.deletedAt);

    return { ...section, passedSections };
};

const getInterviewSections = (data: { interviewId: number }) => {
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
            interviewers: { some: { id: interviewerId } },
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

const update = async (data: UpdateSection, user: User): Promise<Section & { interviewers: User[] }> => {
    const { sectionId, solutionIds, interviewerIds, interviewId, calendarSlot, attachIds, ...restData } = data;
    let slot: Awaited<ReturnType<typeof getCalendarSlotData>>;

    const currentSection = await getById(sectionId);

    if (calendarSlot) {
        if (
            currentSection.calendarSlotId &&
            calendarSlot.exceptionId &&
            calendarSlot.exceptionId === currentSection.calendarSlotId
        ) {
            await cancelSectionEmail(sectionId, tr('Section re-assigned to another interviewer'));
            await prisma.calendarEventException.delete({ where: { id: calendarSlot.exceptionId } });
            slot = await getCalendarSlotData({ ...calendarSlot, exceptionId: undefined });
        } else {
            slot = await getCalendarSlotData(calendarSlot);
            if (calendarSlot && slot === undefined) {
                throw new ErrorWithStatus(tr('Calendar slot did not link to section'), 500);
            }

            await cancelSectionEmail(sectionId, tr('Section re-assigned to another interviewer'));
            currentSection.calendarSlotId &&
                (await prisma.calendarEventException.delete({ where: { id: currentSection.calendarSlotId } }));
        }
    }

    const updateData = {
        ...restData,
        solutions: solutionIds && { connect: idsToIdObjs(solutionIds) },
        interview: { connect: { id: interviewId } },
        interviewers: { set: idsToIdObjs(interviewerIds) },
        calendarSlot: slot,
        attaches: attachIds ? { connect: idsToIdObjs(attachIds) } : undefined,
    };

    const updatedSection = await prisma.section.update({
        data: updateData,
        where: { id: sectionId },
        include: { sectionType: true, interviewers: true },
    });

    const sectionTypeTitle = updatedSection.sectionType.title;

    if (calendarSlot && updatedSection.calendarSlotId) {
        const interview = await prisma.interview.findFirstOrThrow({
            where: { id: interviewId },
            include: { candidate: true },
        });
        await assignSectionEmail({
            calendarSlotId: updatedSection.calendarSlotId,
            interviewerIds,
            interviewId,
            sectionId,
            candidateName: interview.candidate.name,
            sectionTypeTitle,
            isSlotException: !!calendarSlot.exceptionId,
            location: restData.videoCallLink!,
            description: updatedSection.description!,
            creator: user,
        });
    }

    const createFinishSectionEvent = currentSection.hire === null && data.hire !== null;

    if (createFinishSectionEvent) {
        const previousInterview = await interviewMethods.findWithSections(data.interviewId);
        const sectionType = await sectionTypeMethods.getById({ id: updatedSection.sectionTypeId });
        const hireStream = await hireStreamMethods.getById(previousInterview.hireStreamId);

        if (!data.hire && sectionType.finishInterviewOnReject) {
            await commentMethods.createComment(
                {
                    target: {
                        interviewId: data.interviewId,
                        status: InterviewStatus.REJECTED,
                    },
                    status: InterviewStatus.REJECTED,
                    userId: user.id,
                    text: tr('Rejection following the results of {title} section', {
                        title: sectionType.title,
                    }),
                },
                user.id,
            );
        }

        await analyticsEventMethods.createEvent(
            {
                event: 'candidate_finished_section',
                candidateId: previousInterview.candidateId,
                interviewId: data.interviewId,
                interviewerIds: idObjsToIds(updatedSection.interviewers),
                sectionId: updatedSection.id,
                sectionType: sectionType.value,
                hireStream: hireStream.name,
                hire: data.hire ?? updatedSection.hire ?? false,
                grade: data.grade ?? undefined,
            },
            user.id,
        );

        await notifyHR(updatedSection.id, data);

        if (sectionType.giveAchievement) {
            await Promise.all(updatedSection.interviewers.map(({ id }) => giveSectionAchievement(id)));
        }
    }

    return updatedSection;
};

const cancelSection = async (data: CancelSection): Promise<Section> => {
    const { sectionId, cancelComment, calendarSlotId } = data;
    await cancelSectionEmail(sectionId, cancelComment);

    if (calendarSlotId) {
        const exception = await prisma.calendarEventException.findFirstOrThrow({
            where: { id: calendarSlotId },
            include: { event: true },
        });
        const rRule = RRule.fromString(exception.event.rule);

        if (!rRule.options.freq) {
            await prisma.calendarEventException.delete({ where: { id: calendarSlotId } });
        }
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
