import { HireStream } from '@prisma/client';

import { SectionTypeWithHireStream } from '../modules/sectionTypeTypes';

import { tr } from './utils.i18n';

export enum UserRoles {
    ADMIN = 'admin',
    HIRE_STREAM_MANAGER = 'hireStreamManager',
    HIRING_LEAD = 'hiringLead',
    RECRUITER = 'recruiter',
    INTERVIEWER = 'interviewer',
    PROBLEM_EDITOR = 'problemEditor',
}

export const roleToLabel = (role: UserRoles): string => {
    return {
        [UserRoles.ADMIN]: tr('administrator'),
        [UserRoles.PROBLEM_EDITOR]: tr('problem editor'),
        [UserRoles.HIRE_STREAM_MANAGER]: tr('hiring stream manager'),
        [UserRoles.HIRING_LEAD]: tr('recruitment lead'),
        [UserRoles.RECRUITER]: tr('recruiter'),
        [UserRoles.INTERVIEWER]: tr('interviewer'),
    }[role];
};

export interface UserRolesInfo {
    [UserRoles.ADMIN]: boolean;
    [UserRoles.PROBLEM_EDITOR]: boolean;
    [UserRoles.HIRE_STREAM_MANAGER]: HireStream[];
    hasHireStreamManagerRoles: boolean;
    [UserRoles.HIRING_LEAD]: HireStream[];
    hasHiringLeadRoles: boolean;
    [UserRoles.RECRUITER]: HireStream[];
    hasRecruiterRoles: boolean;
    [UserRoles.INTERVIEWER]: SectionTypeWithHireStream[];
    hasInterviewerRoles: boolean;
}
