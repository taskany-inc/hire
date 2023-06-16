import {
    Interview,
    Candidate,
    Problem,
    Section,
    Solution,
    SectionType,
    User,
    HireStream,
    Reaction,
    InterviewStatus,
} from '@prisma/client';
import { z } from 'zod';

import { SectionWithInterviewerRelation } from '../section/section-types';
import { ReactionEnum } from '../../../utils/dictionaries';
import { AccessOptions } from '../../access/access-checks';

export const interviewIdQuerySchema = z.object({
    interviewId: z.number(),
});
export type InterviewIdQuery = z.infer<typeof interviewIdQuerySchema>;

export const getInterviewByIdSchema = z.object({
    interviewId: z.number(),
    showGradeForOwnSectionOnly: z.object({ interviewerId: z.number() }).optional(),
    showReactions: z.boolean().optional(),
});
export type GetInterviewById = z.infer<typeof getInterviewByIdSchema>;
export type GetInterviewByIdOptions = Omit<GetInterviewById, 'interviewId'>;

export const createInterviewSchema = z.object({
    candidateId: z.number(),
    hireStreamId: z.number(),
    description: z.string().nullish(),
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

export type ReactionWithRelations = Reaction & {
    user: User;
};

export type ReactionsMatrix = Record<ReactionEnum, ReactionWithRelations[]>;

export type InterviewWithRelations = InterviewWithHireStreamRelation & {
    creator: User;
    candidate: Candidate;
    sections: SectionWithSectionTypeAndInterviewerAndSolutionsRelations[];
    candidateSelectedSection: Section | null;
    reactions?: ReactionWithRelations[];
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
