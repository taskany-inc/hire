/* eslint-disable camelcase */
import { z } from 'zod';

import { tr } from './analytics-queries.i18n';

export const hireStreamsAndTimeRangeSchema = z
    .object({
        from: z.date(),
        to: z.date(),
        hireStreams: z.array(z.string()),
    })
    .refine(({ from, to }) => from < to, {
        message: tr('The start date cannot be later than the end date of the recruitment stream'),
    });
export type HireStreamsAndTimeRange = z.infer<typeof hireStreamsAndTimeRangeSchema>;

export const hireStreamsAndTimeRangeAndHasTasksSchema = hireStreamsAndTimeRangeSchema.and(
    z.object({ hasTasks: z.boolean() }),
);
export type hireStreamsAndTimeRangeAndHasTasks = z.infer<typeof hireStreamsAndTimeRangeAndHasTasksSchema>;

export const hireStreamAndTimeRangeSchema = z
    .object({
        from: z.date(),
        to: z.date(),
        hireStreamName: z.string(),
    })
    .refine(({ from, to }) => from < to, {
        message: tr('The start date cannot be later than the end date of the recruitment stream'),
    });
export type HireStreamAndTimeRange = z.infer<typeof hireStreamAndTimeRangeSchema>;

export type HiringFunnelRawData = [
    {
        analytics_event__candidates_with_interview_count: bigint;
        analytics_event__passed_section_count: bigint;
        analytics_event__hired_count: bigint;
    },
];
export type HiringFunnelOutput = { value: number; label: string }[];

export type HiringBySectionTypeRawData = {
    section_type__title: string;
    section__hire: boolean;
    section__count: bigint;
}[];
export type HiringBySectionTypeOutput = { sectionType: string; hire: number; noHire: number }[];

export type GradesByInterviewerRawData = {
    user__name: string;
    analytics_event__grade: string;
    analytics_event__section_count: bigint;
}[];
export type GradesByInterviewerOutput = { name: string; grades: Record<string, number> }[];
export type SectionTypeToGradesByInterviewerOutput = Record<string, GradesByInterviewerOutput>;

export type FinishedSectionsByInterviewerRawData = {
    user__name: string;
    analytics_event__hirestream: string;
    analytics_event__section_count: bigint;
}[];
export type FinishedSectionsByInterviewerOutput = { name: string; hirestream: string; section: number }[];

export type CandidatesByHireStreamRawData = {
    analytics_event__hirestream: string;
    analytics_event__candidate_count: bigint;
}[];
export type CandidatesByHireStreamOutput = { hirestream: string; candidate: number }[];

export type CandidatesRejectReasonsRawData = {
    analytics_event__rejectreason: string;
    analytics_event__candidate_count: bigint;
}[];
export type CandidatesRejectReasonsOutput = { rejectreason: string; candidate: number }[];
