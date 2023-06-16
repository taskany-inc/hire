import { Candidate, InterviewStatus, OutstaffVendor } from '@prisma/client';
import { z } from 'zod';

import {
    InterviewWithHireStreamAndSectionsRelation,
    InterviewWithHireStreamRelation,
} from '../interview/interview-types';

export const candidateIdQuery = z.object({
    candidateId: z.number(),
});
export type CandidateIdQuery = z.infer<typeof candidateIdQuery>;

export const getCandidateListSchema = z
    .object({
        search: z.string(),
        statuses: z.nativeEnum(InterviewStatus).array(),
        hireStreamIds: z.number().array(),
        limit: z.number(),
        offset: z.number(),
        orderBy: z.string(),
        orderDirection: z.enum(['asc', 'desc']),
        cursor: z.number().nullish(),
    })
    .partial();
export type GetCandidateList = z.infer<typeof getCandidateListSchema>;

export const createCandidateSchema = z.object({
    name: z.string(),
    email: z.string().email().nullish(),
    phone: z.string().nullish(),
    outstaffVendorId: z.string().nullish(),
});
export type CreateCandidate = z.infer<typeof createCandidateSchema>;

export const updateCandidateSchema = createCandidateSchema.partial().merge(z.object({ candidateId: z.number() }));
export type UpdateCandidate = z.infer<typeof updateCandidateSchema>;

export type CandidateWithInterviewWithSectionsRelations = Candidate & {
    interviews: InterviewWithHireStreamAndSectionsRelation[];
};

export type CandidateWithVendorRelation = Candidate & {
    outstaffVendor: OutstaffVendor | null;
};

export type CandidateWithVendorAndInterviewWithSectionsRelations = Candidate & {
    outstaffVendor: OutstaffVendor | null;
    interviews: InterviewWithHireStreamAndSectionsRelation[];
};

export type CandidateWithVendorAndInterviewRelations = Candidate & {
    outstaffVendor: OutstaffVendor | null;
    interviews: InterviewWithHireStreamRelation[];
};
