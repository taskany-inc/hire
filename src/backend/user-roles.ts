import { HireStream } from '@prisma/client';

import { SectionTypeWithHireStream } from './modules/section-type/section-type-types';

export enum UserRoles {
    ADMIN = 'admin',
    HIRE_STREAM_MANAGER = 'hireStreamManager',
    HIRING_LEAD = 'hiringLead',
    RECRUITER = 'recruiter',
    INTERVIEWER = 'interviewer',
}

export const roleToLabel = (role: UserRoles): string => {
    return {
        [UserRoles.ADMIN]: 'administrator',
        [UserRoles.HIRE_STREAM_MANAGER]: 'hiring flow manager',
        [UserRoles.HIRING_LEAD]: 'recruitment lead',
        [UserRoles.RECRUITER]: 'recruiter',
        [UserRoles.INTERVIEWER]: 'interviewer',
    }[role];
};

export type UserRolesInfo = {
    [UserRoles.ADMIN]: boolean;
    [UserRoles.HIRE_STREAM_MANAGER]: HireStream[];
    hasHireStreamManagerRoles: boolean;
    [UserRoles.HIRING_LEAD]: HireStream[];
    hasHiringLeadRoles: boolean;
    [UserRoles.RECRUITER]: HireStream[];
    hasRecruiterRoles: boolean;
    [UserRoles.INTERVIEWER]: SectionTypeWithHireStream[];
    hasInterviewerRoles: boolean;
};
