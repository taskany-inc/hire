import { Candidate, Section, SectionType, Solution, User, Attach } from '@prisma/client';
import { z } from 'zod';

import { type InterviewWithSections } from './interviewTypes';
import { SolutionProblem } from './solutionTypes';

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
    interviewerIds: z.number().array(),
    videoCallLink: z.string().nullish(),
    calendarSlot: sectionCalendarSlotBookingSchema.optional(),
});
export type CreateSection = z.infer<typeof createSectionSchema>;

export const getSectionSchema = z.object({
    sectionId: z.number(),
});
export type GetSection = z.infer<typeof getSectionSchema>;

export const updateSectionSchema = z.object({
    sectionId: z.number(),
    interviewId: z.number(),
    interviewerIds: z.number().array(),
    description: z.string().nullish(),
    grade: z.string().nullish(),
    hire: z.boolean().nullish(),
    feedback: z.string().nullish(),
    solutionIds: z.number().array().optional(),
    calendarSlot: sectionCalendarSlotBookingSchema.optional(),
    attachIds: z.string().array().optional(),
    videoCallLink: z.string().nullish(),
    calendarSlotId: z.string().nullish(),
});
export type UpdateSection = z.infer<typeof updateSectionSchema>;

export const createOrUpdateSectionSchema = z.object({
    sectionTypeId: z.number(),
    sectionId: z.number(),
    interviewId: z.number(),
    interviewerIds: z.number().array(),
    description: z.string().nullish(),
    videoCallLink: z.string().nullish(),
    calendarSlot: sectionCalendarSlotBookingSchema.optional(),
    calendarSlotId: z.string().nullish(),
});
export type CreateOrUpdateSection = z.infer<typeof createOrUpdateSectionSchema>;

export const updateSectionWithMetadataSchema = z.object({
    data: updateSectionSchema,
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

export type SectionWithSectionType = Section & { interviewers: User[]; sectionType: SectionType };

export type SectionWithRelationsAndResults = Section & {
    interviewers: User[];
    interviewer: User | null;
    solutions: Array<Solution & SolutionProblem>;
    sectionType: SectionType;
    interview: InterviewWithSections & {
        candidate: Candidate;
        restrictedUsers?: User[];
        allowedUsers?: User[];
    };
    passedSections: SectionWithSectionType[];
    attaches: Attach[];
};

export interface SectionWithInterviewerRelation extends Section {
    interviewers: User[];
    sectionType: SectionType;
}

export type SectionWithSolutionsAndSectionType = Section & {
    solutions: Solution[];
    sectionType: SectionType;
};

export type SectionWithInterviewRelation = Section & {
    interview: InterviewWithSections;
    interviewers: User[];
};
