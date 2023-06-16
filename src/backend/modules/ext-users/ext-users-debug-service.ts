import { deepClone } from '../../../utils';
import { UserRoles, UserRolesInfo } from '../../user-roles';
import { hireStreamDbService } from '../hire-streams/hire-stream-db-service';
import { sectionTypeDbService } from '../section-type/section-type-db-service';

const getUserRolesFromDebugCookie = async (roleDebugCookieValue: string): Promise<UserRolesInfo> => {
    const params = new URLSearchParams(roleDebugCookieValue);

    const hireStreams = await hireStreamDbService.getAll();
    const sectionTypes = await sectionTypeDbService.getAll({});

    const admin = params.has('admin');
    const hireStreamManagerFromCookie =
        params
            .get('hire_stream_manager')
            ?.split(',')
            .map((id) => +id) ?? [];
    const hiringLeadFromCookie =
        params
            .get('hiring_lead')
            ?.split(',')
            .map((id) => +id) ?? [];
    const recruiterFromCookie =
        params
            .get('recruiter')
            ?.split(',')
            .map((id) => +id) ?? [];
    const interviewerFromCookie =
        params
            .get('interviewer')
            ?.split(',')
            .map((id) => +id) ?? [];

    const hireStreamManager = hireStreams
        .filter((hireStream) => hireStreamManagerFromCookie.includes(hireStream.id))
        .map(deepClone);
    const hiringLead = hireStreams.filter((hireStream) => hiringLeadFromCookie.includes(hireStream.id)).map(deepClone);
    const recruiter = hireStreams.filter((hireStream) => recruiterFromCookie.includes(hireStream.id)).map(deepClone);
    const interviewer = sectionTypes
        .filter((sectionType) => interviewerFromCookie.includes(sectionType.id))
        .map(deepClone);

    const userRoles: UserRolesInfo = {
        [UserRoles.ADMIN]: admin,
        [UserRoles.HIRE_STREAM_MANAGER]: hireStreamManager,
        hasHireStreamManagerRoles: hireStreamManager.length > 0,
        [UserRoles.HIRING_LEAD]: hiringLead,
        hasHiringLeadRoles: hiringLead.length > 0,
        [UserRoles.RECRUITER]: recruiter,
        hasRecruiterRoles: recruiter.length > 0,
        [UserRoles.INTERVIEWER]: interviewer,
        hasInterviewerRoles: interviewer.length > 0,
    };

    return userRoles;
};

export const externalUsersDebugService = { getUserRolesFromDebugCookie };
