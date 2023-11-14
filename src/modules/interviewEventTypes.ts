import { InterviewEvent, Prisma, User } from '@prisma/client';

export enum InterviewEventTypes {
    INTERVIEW_CREATE = 'INTERVIEW_CREATE',
    INTERVIEW_UPDATE = 'INTERVIEW_UPDATE',
    INTERVIEW_DELETE = 'INTERVIEW_DELETE',
    CHANGE_INTERVIEW_STATUS = 'CHANGE_INTERVIEW_STATUS',
    SECTION_CREATE = 'SECTION_CREATE',
    SECTION_UPDATE = 'SECTION_UPDATE',
    SECTION_REMOVE = 'SECTION_REMOVE',
    SECTION_CANCEL = 'SECTION_CANCEL',
    SET_SECTION_FEEDBACK = 'SET_SECTION_FEEDBACK',
    CANDIDATE_SELECT = 'CANDIDATE_SELECT',
}

export const InterviewEventLabels = {
    [InterviewEventTypes.INTERVIEW_CREATE]: 'interview create',
    [InterviewEventTypes.INTERVIEW_UPDATE]: 'interview update',
    [InterviewEventTypes.INTERVIEW_DELETE]: 'interview remove',
    [InterviewEventTypes.CHANGE_INTERVIEW_STATUS]: 'change interview status',
    [InterviewEventTypes.SECTION_CREATE]: 'section create',
    [InterviewEventTypes.SECTION_UPDATE]: 'section update',
    [InterviewEventTypes.SECTION_REMOVE]: 'section remove',
    [InterviewEventTypes.SECTION_CANCEL]: 'section cancel',
    [InterviewEventTypes.SET_SECTION_FEEDBACK]: 'feedback update',
    [InterviewEventTypes.CANDIDATE_SELECT]: 'candidate select',
};

export type CreateInterviewEvents = Pick<Prisma.InterviewEventCreateInput, 'type' | 'before' | 'after'> & {
    userId: number;
    interviewId?: number;
};

export type InterviewEventWithRelations = InterviewEvent & {
    user: User;
};
