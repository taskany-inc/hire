import { Candidate, Section, SectionType, Solution, User, Attach } from '@prisma/client';
import { z } from 'zod';

import { InterviewEventTypes } from './interviewEventTypes';
import { type InterviewWithSections } from './interviewTypes';

const sectionCalendarSlotBookingSchema = z.object({
    eventId: z.string(),
    exceptionId: z.string().optional(),
    originalDate: z.date(),
});
export type SectionCalendarSlotBooking = z.infer<typeof sectionCalendarSlotBookingSchema>;

export const createSectionSchema = z.object({
    description: z.string().nullish(),
    interviewId: z.number(),
    sectionTypeId: z.number(),
    interviewerId: z.number(),
    videoCallLink: z.string().nullish(),
    calendarSlot: sectionCalendarSlotBookingSchema.optional(),
});
export type CreateSection = z.infer<typeof createSectionSchema>;

export const getInterviewSectionsSchema = z.object({
    interviewId: z.number(),
});
export type GetInterviewSections = z.infer<typeof getInterviewSectionsSchema>;

export const getSectionSchema = z.object({
    sectionId: z.number(),
});
export type GetSection = z.infer<typeof getSectionSchema>;

export const updateSectionSchema = z.object({
    sectionId: z.number(),
    interviewId: z.number(),
    interviewerId: z.number(),
    description: z.string().nullish(),
    grade: z.string().nullish(),
    hire: z.boolean().nullish(),
    feedback: z.string().nullish(),
    solutionIds: z.number().array().optional(),
    sendHrMail: z.boolean().optional(),
    calendarSlot: sectionCalendarSlotBookingSchema.optional(),
    attachIds: z.string().array().optional(),
    videoCallLink: z.string().nullish(),
});
export type UpdateSection = z.infer<typeof updateSectionSchema>;

export const createOrUpdateSectionSchema = z.object({
    sectionTypeId: z.number(),
    sectionId: z.number(),
    interviewId: z.number(),
    interviewerId: z.number(),
    description: z.string().nullish(),
    videoCallLink: z.string().nullish(),
    calendarSlot: sectionCalendarSlotBookingSchema.optional(),
});
export type CreateOrUpdateSection = z.infer<typeof createOrUpdateSectionSchema>;

export const updateSectionWithMetadataSchema = z.object({
    data: updateSectionSchema,
    metadata: z
        .object({
            eventsType: z.nativeEnum(InterviewEventTypes).optional(),
        })
        .optional(),
});
export type UpdateSectionWithMetadata = z.infer<typeof updateSectionWithMetadataSchema>;

export const deleteSectionSchema = z.object({
    sectionId: z.number(),
    interviewId: z.number(),
});
export type DeleteSection = z.infer<typeof deleteSectionSchema>;

export const cancelSectionSchema = z.object({
    sectionId: z.number(),
    interviewId: z.number(),
    cancelComment: z.string(),
    calendarSlotId: z.string().nullish(),
});
export type CancelSection = z.infer<typeof cancelSectionSchema>;

export type SectionWithSectionType = Section & { interviewer: User; sectionType: SectionType };

export type SectionWithRelationsAndResults = Section & {
    interviewer: User;
    solutions: Solution[];
    sectionType: SectionType;
    interview: InterviewWithSections & { candidate: Candidate };
    passedSections: SectionWithSectionType[];
    attaches: Attach[];
};

export interface SectionWithInterviewerRelation extends Section {
    interviewer: User;
    sectionType: SectionType;
}

export type SectionWithSolutionsAndSectionType = Section & {
    solutions: Solution[];
    sectionType: SectionType;
};

export type SectionWithInterviewRelation = Section & {
    interview: InterviewWithSections;
};
