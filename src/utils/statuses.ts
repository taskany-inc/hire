import { InterviewStatus } from '@prisma/client';

export const statuses = [
    InterviewStatus.NEW,
    InterviewStatus.IN_PROGRESS,
    InterviewStatus.REJECTED,
    InterviewStatus.HIRED,
];
