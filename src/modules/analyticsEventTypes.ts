interface CandidateCreated {
    event: 'candidate_created';
    candidateId: number;
}

interface InterviewCreated {
    event: 'interview_created';
    candidateId: number;
    recruiterId: number;
    hireStream: string;
}

interface CandidateFinishedSection {
    event: 'candidate_finished_section';
    candidateId: number;
    interviewId: number;
    interviewerId: number;
    sectionId: number;
    sectionType: string;
    hireStream: string;
    hire: boolean;
    grade?: string;
}

interface CandidateFinishedInterview {
    event: 'candidate_finished_interview';
    interviewId: number;
    candidateId: number;
    hireStream: string;
    hire: boolean;
    rejectReason?: string;
}

export type AnalyticsEventData =
    | CandidateCreated
    | InterviewCreated
    | CandidateFinishedSection
    | CandidateFinishedInterview;
