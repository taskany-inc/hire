import { CalendarEvent, HireStream, Problem, Comment } from '@prisma/client';
import { Session } from 'next-auth';

import { onlyUnique } from '../utils';

import { CandidateWithInterviewWithSectionsRelations } from './candidateTypes';
import { InterviewWithSectionsAndSpecialAccessUsers } from './interviewTypes';
import { SectionWithInterviewRelation, SectionWithRelationsAndResults } from './sectionTypes';
import { tr } from './modules.i18n';

export type AccessOptions = Partial<{
    filterInterviewsByHireStreamIds: number[];
    filterByInterviewerId: number;
    addInterviewsByUserAccessPermission: number;
    filterInterviewsByUserAccessRestriction: number;
    filterSectionsBySectionTypeIds: number[];
    filterSectionGradeByInterviewer: number;
}>;

export type AccessCheckResult = Readonly<
    { allowed: true; accessOptions: AccessOptions } | { allowed: false; errorMessage: string }
>;

const allowed = (accessOptions?: AccessOptions): AccessCheckResult => ({
    allowed: true,
    accessOptions: accessOptions ?? {},
});

const notAllowed = (errorMessage: string): AccessCheckResult => ({ allowed: false, errorMessage });

export const getUserRoleIds = (session: Session) => {
    const managerInHireStreams = session.userRoles.hireStreamManager.map((hireStream) => hireStream.id);
    const hiringLeadInHireStreams = session.userRoles.hiringLead.map((hireStream) => hireStream.id);
    const recruiterInHireStreams = session.userRoles.recruiter.map((hireStream) => hireStream.id);
    const interviewerInSectionTypes = session.userRoles.interviewer.map((sectionType) => sectionType.id);
    const combinedHireStreams = [...hiringLeadInHireStreams, ...recruiterInHireStreams, ...managerInHireStreams].filter(
        onlyUnique,
    );

    return {
        combinedHireStreams,
        managerInHireStreams,
        hiringLeadInHireStreams,
        recruiterInHireStreams,
        interviewerInSectionTypes,
    };
};

export const accessChecks = {
    problem: {
        create: (): AccessCheckResult => allowed(),

        read: (): AccessCheckResult => allowed(),

        updateOrDelete: (session: Session, problem: Problem): AccessCheckResult => {
            if (session.userRoles.admin || session.userRoles.problemEditor) {
                return allowed();
            }

            return session.user.id === problem.authorId
                ? allowed()
                : notAllowed(tr('Insufficient permissions to delete or edit the problem'));
        },
    },

    tag: {
        create: (): AccessCheckResult => allowed(),

        read: (): AccessCheckResult => allowed(),

        update: (session: Session): AccessCheckResult =>
            session.userRoles.admin ? allowed() : notAllowed(tr('Only administrators can edit tags')),

        delete: (session: Session): AccessCheckResult =>
            session.userRoles.admin ? allowed() : notAllowed(tr('Only administrators can delete tags')),
    },

    candidate: {
        create: (session: Session): AccessCheckResult =>
            session.userRoles.admin ||
            session.userRoles.hasHiringLeadRoles ||
            session.userRoles.hasRecruiterRoles ||
            session.userRoles.hasHireStreamManagerRoles
                ? allowed()
                : notAllowed(tr('Only Hiring Leads and Recruiters can add candidates')),

        readOne: (session: Session, candidate: CandidateWithInterviewWithSectionsRelations): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { combinedHireStreams } = getUserRoleIds(session);

            if (
                session.userRoles.hasHiringLeadRoles ||
                session.userRoles.hasRecruiterRoles ||
                session.userRoles.hasHireStreamManagerRoles
            ) {
                return allowed({ filterInterviewsByHireStreamIds: combinedHireStreams });
            }

            const userHasSectionsWithCandidate = candidate.interviews.some(({ sections }) =>
                sections.some(({ interviewers }) => interviewers.some(({ id }) => id === session.user.id)),
            );

            if (userHasSectionsWithCandidate) {
                return allowed();
            }

            return notAllowed(tr('No access to this candidates section types'));
        },

        readMany: (session: Session): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { combinedHireStreams } = getUserRoleIds(session);

            if (
                session.userRoles.hasHiringLeadRoles ||
                session.userRoles.hasRecruiterRoles ||
                session.userRoles.hasHireStreamManagerRoles
            ) {
                return allowed({ filterInterviewsByHireStreamIds: combinedHireStreams });
            }

            if (session.userRoles.hasInterviewerRoles) {
                return allowed({
                    filterByInterviewerId: session.user.id,
                    filterSectionGradeByInterviewer: session.user.id,
                });
            }

            return notAllowed(tr('No access to hire streams or section types'));
        },

        update: (session: Session, candidate: CandidateWithInterviewWithSectionsRelations): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { hiringLeadInHireStreams, recruiterInHireStreams, managerInHireStreams } = getUserRoleIds(session);

            const candidateHireStreamIds = candidate.interviews.map((interview) => interview.hireStreamId);

            const userHasRelevantHiringLeadRoles = hiringLeadInHireStreams.some((id) =>
                candidateHireStreamIds.includes(id),
            );
            const userRelevantHasRecruiterRoles = recruiterInHireStreams.some((id) =>
                candidateHireStreamIds.includes(id),
            );
            const userRelevantHasManagerRoles = managerInHireStreams.some((id) => candidateHireStreamIds.includes(id));

            if (userHasRelevantHiringLeadRoles || userRelevantHasRecruiterRoles || userRelevantHasManagerRoles) {
                return allowed();
            }

            return notAllowed(tr('No access to recruitment streams for this candidate'));
        },

        delete: (session: Session, candidate: CandidateWithInterviewWithSectionsRelations): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { hiringLeadInHireStreams, managerInHireStreams } = getUserRoleIds(session);

            const candidateHireStreamIds = candidate.interviews.map((interview) => interview.hireStreamId);

            const userHasRelevantHiringLeadRoles = hiringLeadInHireStreams.some((id) =>
                candidateHireStreamIds.includes(id),
            );
            const userRelevantHasManagerRoles = managerInHireStreams.some((id) => candidateHireStreamIds.includes(id));

            if (userHasRelevantHiringLeadRoles || userRelevantHasManagerRoles) {
                return allowed();
            }

            return notAllowed(tr('No access to recruitment streams for this candidate'));
        },
    },

    interview: {
        create: (session: Session, hireStreamId: number): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { hiringLeadInHireStreams, recruiterInHireStreams, managerInHireStreams } = getUserRoleIds(session);

            if (
                hiringLeadInHireStreams.includes(hireStreamId) ||
                recruiterInHireStreams.includes(hireStreamId) ||
                managerInHireStreams.includes(hireStreamId)
            ) {
                return allowed();
            }

            return notAllowed(tr('No access to this recruitment stream'));
        },

        readOne: (session: Session, interview: InterviewWithSectionsAndSpecialAccessUsers): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const restrictedUserIds = interview.restrictedUsers?.map((u) => u.id);
            if (restrictedUserIds?.length && restrictedUserIds.includes(session.user.id)) {
                return notAllowed(tr("You don't have access to this interview"));
            }

            const allowedUserIds = interview.allowedUsers?.map((u) => u.id);
            if (allowedUserIds?.length && allowedUserIds.includes(session.user.id)) {
                return allowed();
            }

            const { hiringLeadInHireStreams, recruiterInHireStreams, managerInHireStreams } = getUserRoleIds(session);

            if (
                hiringLeadInHireStreams.includes(interview.hireStreamId) ||
                recruiterInHireStreams.includes(interview.hireStreamId) ||
                managerInHireStreams.includes(interview.hireStreamId)
            ) {
                return allowed();
            }

            const userHasSectionInInterview = interview.sections.some(({ interviewers }) =>
                interviewers.some(({ id }) => id === session.user.id),
            );

            if (userHasSectionInInterview) {
                return allowed({
                    filterSectionGradeByInterviewer: session.user.id,
                });
            }

            return notAllowed(tr('No access to recruitment streams or section types for this interview'));
        },

        readMany: (session: Session): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const accessOptions: AccessOptions = {
                addInterviewsByUserAccessPermission: session.user.id,
                filterInterviewsByUserAccessRestriction: session.user.id,
            };

            const { combinedHireStreams } = getUserRoleIds(session);

            if (
                session.userRoles.hasRecruiterRoles ||
                session.userRoles.hasHiringLeadRoles ||
                session.userRoles.hasHireStreamManagerRoles
            ) {
                accessOptions.filterInterviewsByHireStreamIds = combinedHireStreams;
                return allowed(accessOptions);
            }

            if (session.userRoles.hasInterviewerRoles) {
                accessOptions.filterByInterviewerId = session.user.id;
                return allowed(accessOptions);
            }

            return notAllowed(tr('No access to hire streams or section types'));
        },

        update: (session: Session, hireStreamId: number): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { recruiterInHireStreams, managerInHireStreams } = getUserRoleIds(session);

            if (recruiterInHireStreams.includes(hireStreamId) || managerInHireStreams.includes(hireStreamId)) {
                return allowed();
            }

            return notAllowed(tr('Only recruiters in this hiring stream can edit interviews'));
        },

        delete: (session: Session): AccessCheckResult =>
            session.userRoles.admin ? allowed() : notAllowed(tr('Only administrators can delete interviews')),
    },

    section: {
        create: (session: Session, hireStreamId: number): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { hiringLeadInHireStreams, recruiterInHireStreams, managerInHireStreams } = getUserRoleIds(session);

            if (
                hiringLeadInHireStreams.includes(hireStreamId) ||
                recruiterInHireStreams.includes(hireStreamId) ||
                managerInHireStreams.includes(hireStreamId)
            ) {
                return allowed();
            }

            return notAllowed(tr('No access to recruitment stream'));
        },

        readOne: (session: Session, section: SectionWithRelationsAndResults): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const restrictedUserIds = section.interview.restrictedUsers?.map((u) => u.id);
            if (restrictedUserIds?.length && restrictedUserIds.includes(session.user.id)) {
                return notAllowed(tr("You don't have access to this section"));
            }

            const allowedUserIds = section.interview.allowedUsers?.map((u) => u.id);
            if (allowedUserIds?.length && allowedUserIds.includes(session.user.id)) {
                return allowed();
            }

            const { hiringLeadInHireStreams, recruiterInHireStreams, interviewerInSectionTypes, managerInHireStreams } =
                getUserRoleIds(session);

            if (
                hiringLeadInHireStreams.includes(section.interview.hireStreamId) ||
                recruiterInHireStreams.includes(section.interview.hireStreamId) ||
                managerInHireStreams.includes(section.interview.hireStreamId)
            ) {
                return allowed();
            }

            if (section.interviewers.some(({ id }) => id === session.user.id)) {
                return allowed();
            }

            const userHasSectionInInterview = section.interview.sections.some((section) =>
                section.interviewers.some(({ id }) => id === session.user.id),
            );

            if (userHasSectionInInterview) {
                return allowed({
                    filterSectionsBySectionTypeIds: interviewerInSectionTypes,
                    filterSectionGradeByInterviewer: session.user.id,
                });
            }

            return notAllowed(tr('No access to hire stream or section type'));
        },

        update: (session: Session, section: SectionWithInterviewRelation): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { recruiterInHireStreams, interviewerInSectionTypes, managerInHireStreams } = getUserRoleIds(session);

            if (
                recruiterInHireStreams.includes(section.interview.hireStreamId) ||
                managerInHireStreams.includes(section.interview.hireStreamId)
            ) {
                return allowed();
            }

            if (interviewerInSectionTypes.includes(section.sectionTypeId)) {
                if (section.interviewers.some(({ id }) => id === session.user.id)) {
                    return allowed();
                }

                return notAllowed(tr('This section is assigned to another interviewer'));
            }

            return notAllowed(tr('No access to hire stream or section type'));
        },

        delete: (session: Session, section: SectionWithInterviewRelation): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { interviewerInSectionTypes, recruiterInHireStreams, managerInHireStreams } = getUserRoleIds(session);

            if (
                recruiterInHireStreams.includes(section.interview.hireStreamId) ||
                managerInHireStreams.includes(section.interview.hireStreamId)
            ) {
                return allowed();
            }

            if (interviewerInSectionTypes.includes(section.sectionTypeId)) {
                if (section.interviewers.some(({ id }) => id === session.user.id)) {
                    return allowed();
                }

                return notAllowed(tr('This section is assigned to another interviewer'));
            }

            return notAllowed(tr('No access to recruitment stream'));
        },

        attachFile: (session: Session, section: SectionWithInterviewRelation): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            return section.interviewers.some(({ id }) => id === session.user.id)
                ? allowed()
                : notAllowed(tr('This section is assigned to another interviewer'));
        },
    },

    hireStream: {
        create: (session: Session): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            return notAllowed(tr('Only admins can create hire stream'));
        },

        read: (_session: Session): AccessCheckResult => {
            return allowed();
        },

        readOne: (session: Session, hireStream: HireStream): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }
            const { hiringLeadInHireStreams, recruiterInHireStreams, managerInHireStreams } = getUserRoleIds(session);

            if (
                hiringLeadInHireStreams.includes(hireStream.id) ||
                recruiterInHireStreams.includes(hireStream.id) ||
                managerInHireStreams.includes(hireStream.id)
            ) {
                return allowed();
            }

            return notAllowed(tr('No access to hire stream'));
        },

        update: (session: Session, hireStreamId: number): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { managerInHireStreams } = getUserRoleIds(session);

            if (managerInHireStreams.includes(hireStreamId)) {
                return allowed();
            }

            return notAllowed(tr('Only hiring stream managers can update it'));
        },
    },

    calendar: {
        create: (session: Session): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            if (session.userRoles.hasInterviewerRoles) {
                return allowed();
            }

            return notAllowed(tr('Only chat interviewers can create slots'));
        },

        readOne: (session: Session, event: CalendarEvent): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            if (session.userRoles.hasRecruiterRoles || session.userRoles.hasHireStreamManagerRoles) {
                return allowed();
            }

            if (session.userRoles.hasInterviewerRoles) {
                return session.user.id === event.creatorId
                    ? allowed()
                    : notAllowed(tr("No access to someone else's slot"));
            }

            return notAllowed(tr('Only recruiters and interviewers have access to slots'));
        },

        readMany: (session: Session): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            if (
                session.userRoles.hasRecruiterRoles ||
                session.userRoles.hasInterviewerRoles ||
                session.userRoles.hasHireStreamManagerRoles
            ) {
                return allowed();
            }

            return notAllowed(tr('Only recruiters and interviewers have access to slots'));
        },

        updateOrDelete: (session: Session, event: CalendarEvent): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            if (session.userRoles.hasInterviewerRoles) {
                return session.user.id === event.creatorId
                    ? allowed()
                    : notAllowed(tr("No access to someone else's slot"));
            }

            return notAllowed(tr('Only interviewers can edit slots'));
        },
    },

    user: {
        create: (session: Session): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            if (session.userRoles.hasHiringLeadRoles || session.userRoles.hasRecruiterRoles) {
                return allowed();
            }

            return notAllowed(tr('Only Hiring Leads and Recruiters can add users'));
        },
    },

    analytics: {
        read: (session: Session): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            if (
                session.userRoles.hasHiringLeadRoles ||
                session.userRoles.hasHireStreamManagerRoles ||
                session.userRoles.hasRecruiterRoles
            ) {
                return allowed();
            }

            return notAllowed(tr('No access to analytics'));
        },
    },

    roles: {
        readPage: (session: Session): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            if (session.userRoles.hasHireStreamManagerRoles) {
                return allowed();
            }

            return notAllowed(tr('Only hiring stream managers can view roles'));
        },

        readAdmins: (session: Session): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            return notAllowed(tr('Only administrators can view the list of administrators'));
        },

        readOrUpdateHireStreamUsers: (session: Session, hireStreamId: number): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { managerInHireStreams } = getUserRoleIds(session);

            return managerInHireStreams.includes(hireStreamId)
                ? allowed()
                : notAllowed(tr('Only hiring stream managers can manage lists of hiring stream users'));
        },
    },
    attach: {
        create: (session: Session): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }
            if (session.userRoles.hasInterviewerRoles || session.userRoles.hasRecruiterRoles) {
                return allowed();
            }
            return notAllowed(tr('Only recruiters and interviewers can create files'));
        },

        readOne: (session: Session): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }
            if (session.userRoles.hasInterviewerRoles || session.userRoles.hasRecruiterRoles) {
                return allowed();
            }
            return notAllowed(tr('Only recruiters and interviewers can view files'));
        },

        delete: (session: Session): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }
            if (session.userRoles.hasInterviewerRoles || session.userRoles.hasRecruiterRoles) {
                return allowed();
            }
            return notAllowed(tr('Only recruiters and interviewers can delete files'));
        },
    },

    comment: {
        create: (): AccessCheckResult => allowed(),

        updateOrDelete: (session: Session, comment: Comment): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            return session.user.id === comment.userId
                ? allowed()
                : notAllowed(tr('Insufficient permissions to delete or edit the comment'));
        },
    },

    vacancy: {
        read: (session: Session): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }
            if (
                session.userRoles.hasHiringLeadRoles ||
                session.userRoles.hasRecruiterRoles ||
                session.userRoles.hasHireStreamManagerRoles
            ) {
                return allowed();
            }
            return notAllowed('Only hiring leads and recruiters can see vacancies');
        },
    },
};
