import {
    Interview,
    Candidate,
    Problem,
    Section,
    Solution,
    SectionType,
    User,
    HireStream,
    InterviewStatus,
    Attach,
} from '@prisma/client';
import { z } from 'zod';

import { SectionWithInterviewerRelation } from './sectionTypes';
import { AccessOptions } from './accessChecks';

export const interviewIdQuerySchema = z.object({
    interviewId: z.number(),
});
export type InterviewIdQuery = z.infer<typeof interviewIdQuerySchema>;

export const getInterviewByIdSchema = z.object({
    interviewId: z.number(),
    showGradeForOwnSectionOnly: z.object({ interviewerId: z.number() }).optional(),
});

export type GetInterviewById = z.infer<typeof getInterviewByIdSchema>;
export type GetInterviewByIdOptions = Omit<GetInterviewById, 'interviewId'>;

export const createInterviewSchema = z.object({
    candidateId: z.number(),
    hireStreamId: z.number(),
    description: z.string().nullish(),
    attachIds: z.string().array().optional(),
    cvAttachId: z.string().optional(),
    crewVacancyId: z.string().optional(),
});
export type CreateInterview = z.infer<typeof createInterviewSchema>;

export const updateInterviewSchema = z.object({ interviewId: z.number() }).merge(
    z
        .object({
            description: z.string(),
            status: z.nativeEnum(InterviewStatus),
            statusComment: z.string(),
            feedback: z.string(),
            hireStreamId: z.number(),
            candidateId: z.number(),
            candidateSelectedSectionId: z.number().nullable(),
            crewVacancyId: z.string().nullish(),
        })
        .partial(),
);
export type UpdateInterview = z.infer<typeof updateInterviewSchema>;

export const updateInterviewWithMetadataSchema = z.object({
    data: updateInterviewSchema,
    metadata: z
        .object({
            createFinishInterviewEvent: z.boolean(),
        })
        .optional(),
});
export type UpdateInterviewWithMetadata = z.infer<typeof updateInterviewWithMetadataSchema>;

export interface CandidateInterviewsFetchParams {
    candidateId: number;
    accessOptions?: AccessOptions;
}

export type SectionWithInterviewRelation = Section & {
    interview: Interview & { candidate: Candidate };
    sectionType: SectionType;
};

export type InterviewWithSections = Interview & {
    sections: Section[];
};

export type InterviewWithHireStreamAndSectionsRelation = InterviewWithSections & {
    hireStream: HireStream | null;
};

export type InterviewWithHireStreamRelation = Interview & {
    hireStream: HireStream | null;
};

export type SectionWithSectionTypeAndInterviewerAndSolutionsRelations = Section & {
    sectionType: SectionType;
    interviewer: User;
    solutions: (Solution & {
        problem: Problem;
    })[];
};

export type InterviewWithRelations = InterviewWithHireStreamRelation & {
    creator: User;
    candidate: Candidate;
    sections: SectionWithSectionTypeAndInterviewerAndSolutionsRelations[];
    candidateSelectedSection: Section | null;
    cv?: Attach;
};

export interface InterviewWithCandidateRelation extends Interview, Record<string, unknown> {
    candidate: {
        name: string;
    };
}

export interface InterviewByInterviewer extends Interview {
    candidate: Candidate;
    creator: User;
    sections: SectionWithInterviewerRelation[];
}
