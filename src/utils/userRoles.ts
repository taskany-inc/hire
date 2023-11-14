import { HireStream } from '@prisma/client';

import { SectionTypeWithHireStream } from '../modules/sectionTypeTypes';

import { tr } from './utils.i18n';

export enum UserRoles {
    ADMIN = 'admin',
    HIRE_STREAM_MANAGER = 'hireStreamManager',
    HIRING_LEAD = 'hiringLead',
    RECRUITER = 'recruiter',
    INTERVIEWER = 'interviewer',
}

export const roleToLabel = (role: UserRoles): string => {
    return {
        [UserRoles.ADMIN]: tr('administrator'),
        [UserRoles.HIRE_STREAM_MANAGER]: tr('hiring flow manager'),
        [UserRoles.HIRING_LEAD]: tr('recruitment lead'),
        [UserRoles.RECRUITER]: tr('recruiter'),
        [UserRoles.INTERVIEWER]: tr('interviewer'),
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
