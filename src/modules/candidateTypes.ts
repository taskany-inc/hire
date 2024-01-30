import { Candidate, InterviewStatus, OutstaffVendor } from '@prisma/client';
import { z } from 'zod';

import { InterviewWithHireStreamAndSectionsRelation, InterviewWithHireStreamRelation } from './interviewTypes';

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
        hrIds: z.number().array(),
    })
    .partial();
export type GetCandidateList = z.infer<typeof getCandidateListSchema>;

// TODO check out if zod fix email validation https://github.com/colinhacks/zod/issues/2396#issuecomment-1650340178
export const createCandidateSchema = z.object({
    name: z.string(),
    email: z.string().nullish(),
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
