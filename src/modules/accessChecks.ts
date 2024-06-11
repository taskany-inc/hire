import { CalendarEvent, HireStream, Problem, Comment } from '@prisma/client';
import { Session } from 'next-auth';

import { onlyUnique } from '../utils';

import { CandidateWithInterviewWithSectionsRelations } from './candidateTypes';
import { InterviewWithSections, InterviewWithSectionsAndSpecialAccessUsers } from './interviewTypes';
import { SectionWithInterviewRelation } from './sectionTypes';
import { tr } from './modules.i18n';

export type AccessOptions = Partial<{
    filterInterviewsByHireStreamIds: number[];
    filterInterviewsBySectionTypeIds: number[];
    addInterviewsByUserAccessPermission: number;
    filterInterviewsByUserAccessRestriction: number;
    filterCandidatesBySectionTypeIds: number[];
    filterSectionsBySectionTypeIds: number[];
    hideSectionGradesBySectionIds: number[];
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
    const combinedHireStreams = [...hiringLeadInHireStreams, ...recruiterInHireStreams].filter(onlyUnique);

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
            session.userRoles.admin || session.userRoles.hasHiringLeadRoles || session.userRoles.hasRecruiterRoles
                ? allowed()
                : notAllowed(tr('Only Hiring Leads and Recruiters can add candidates')),

        readOne: (session: Session, candidate: CandidateWithInterviewWithSectionsRelations): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { combinedHireStreams, interviewerInSectionTypes } = getUserRoleIds(session);

            if (session.userRoles.hasHiringLeadRoles || session.userRoles.hasRecruiterRoles) {
                return allowed({ filterInterviewsByHireStreamIds: combinedHireStreams });
            }

            const candidateSectionTypeIds = candidate.interviews
                .flatMap((interview) => interview.sections)
                .map((section) => section.sectionTypeId);

            const userHasRelevantInterviewerRoles = interviewerInSectionTypes.some((id) =>
                candidateSectionTypeIds.includes(id),
            );

            if (userHasRelevantInterviewerRoles) {
                return allowed({ filterInterviewsBySectionTypeIds: interviewerInSectionTypes });
            }

            return notAllowed(tr('No access to this candidates section types'));
        },

        readMany: (session: Session): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { combinedHireStreams, interviewerInSectionTypes } = getUserRoleIds(session);

            if (session.userRoles.hasHiringLeadRoles || session.userRoles.hasRecruiterRoles) {
                return allowed({ filterInterviewsByHireStreamIds: combinedHireStreams });
            }

            if (session.userRoles.hasInterviewerRoles) {
                return allowed({ filterCandidatesBySectionTypeIds: interviewerInSectionTypes });
            }

            return notAllowed(tr('No access to hire streams or section types'));
        },

        update: (session: Session, candidate: CandidateWithInterviewWithSectionsRelations): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { hiringLeadInHireStreams, recruiterInHireStreams } = getUserRoleIds(session);

            const candidateHireStreamIds = candidate.interviews.map((interview) => interview.hireStreamId);

            const userHasRelevantHiringLeadRoles = hiringLeadInHireStreams.some((id) =>
                candidateHireStreamIds.includes(id),
            );
            const userRelevantHasRecruiterRoles = recruiterInHireStreams.some((id) =>
                candidateHireStreamIds.includes(id),
            );

            if (userHasRelevantHiringLeadRoles || userRelevantHasRecruiterRoles) {
                return allowed();
            }

            return notAllowed(tr('No access to recruitment streams for this candidate'));
        },

        delete: (session: Session, candidate: CandidateWithInterviewWithSectionsRelations): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { hiringLeadInHireStreams } = getUserRoleIds(session);

            const candidateHireStreamIds = candidate.interviews.map((interview) => interview.hireStreamId);

            const userHasRelevantHiringLeadRoles = hiringLeadInHireStreams.some((id) =>
                candidateHireStreamIds.includes(id),
            );

            if (userHasRelevantHiringLeadRoles) {
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

            const { hiringLeadInHireStreams, recruiterInHireStreams } = getUserRoleIds(session);

            if (hiringLeadInHireStreams.includes(hireStreamId) || recruiterInHireStreams.includes(hireStreamId)) {
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

            const { hiringLeadInHireStreams, recruiterInHireStreams, interviewerInSectionTypes } =
                getUserRoleIds(session);

            if (
                hiringLeadInHireStreams.includes(interview.hireStreamId) ||
                recruiterInHireStreams.includes(interview.hireStreamId)
            ) {
                return allowed();
            }

            const interviewSectionTypes = interview.sections.map((section) => section.sectionTypeId);

            const userHasRelevantInterviewerRoles = interviewerInSectionTypes.some((id) =>
                interviewSectionTypes.includes(id),
            );

            if (userHasRelevantInterviewerRoles) {
                return allowed({ filterSectionsBySectionTypeIds: interviewerInSectionTypes });
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

            const { combinedHireStreams, interviewerInSectionTypes } = getUserRoleIds(session);

            if (session.userRoles.hasRecruiterRoles || session.userRoles.hasHiringLeadRoles) {
                accessOptions.filterInterviewsByHireStreamIds = combinedHireStreams;
                return allowed(accessOptions);
            }

            if (session.userRoles.hasInterviewerRoles) {
                accessOptions.filterSectionsBySectionTypeIds = interviewerInSectionTypes;
                return allowed(accessOptions);
            }

            return notAllowed(tr('No access to hire streams or section types'));
        },

        update: (session: Session, hireStreamId: number): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { recruiterInHireStreams } = getUserRoleIds(session);

            if (recruiterInHireStreams.includes(hireStreamId)) {
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

            const { hiringLeadInHireStreams, recruiterInHireStreams } = getUserRoleIds(session);

            if (hiringLeadInHireStreams.includes(hireStreamId) || recruiterInHireStreams.includes(hireStreamId)) {
                return allowed();
            }

            return notAllowed(tr('No access to recruitment stream'));
        },

        readOne: (session: Session, section: SectionWithInterviewRelation): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { hiringLeadInHireStreams, recruiterInHireStreams } = getUserRoleIds(session);

            if (
                hiringLeadInHireStreams.includes(section.interview.hireStreamId) ||
                recruiterInHireStreams.includes(section.interview.hireStreamId)
            ) {
                return allowed();
            }

            if (session.user.id === section.interviewerId) {
                return allowed();
            }

            const interviewAccessCheck = accessChecks.interview.readOne(session, section.interview);

            if (interviewAccessCheck.allowed) {
                return allowed({ hideSectionGradesBySectionIds: [section.id] });
            }

            return notAllowed(tr('No access to hire stream or section type'));
        },

        readMany: (session: Session, interview: InterviewWithSections): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { hiringLeadInHireStreams, recruiterInHireStreams, interviewerInSectionTypes } =
                getUserRoleIds(session);

            if (
                hiringLeadInHireStreams.includes(interview.hireStreamId) ||
                recruiterInHireStreams.includes(interview.hireStreamId)
            ) {
                return allowed();
            }

            const interviewSectionTypes = interview.sections.map((section) => section.sectionTypeId);

            const userHasRelevantInterviewerRoles = interviewerInSectionTypes.some((id) =>
                interviewSectionTypes.includes(id),
            );

            if (userHasRelevantInterviewerRoles) {
                const nonOwnedSections = interview.sections
                    .filter((section) => section.interviewerId !== session.user.id)
                    .map((section) => section.id);

                return allowed({
                    filterSectionsBySectionTypeIds: interviewerInSectionTypes,
                    hideSectionGradesBySectionIds: nonOwnedSections,
                });
            }

            return notAllowed(tr('No access to hire stream or section types'));
        },

        update: (session: Session, section: SectionWithInterviewRelation): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { recruiterInHireStreams, interviewerInSectionTypes } = getUserRoleIds(session);

            if (recruiterInHireStreams.includes(section.interview.hireStreamId)) {
                return allowed();
            }

            if (interviewerInSectionTypes.includes(section.sectionTypeId)) {
                if (section.interviewerId === session.user.id) {
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

            const { interviewerInSectionTypes, recruiterInHireStreams } = getUserRoleIds(session);

            if (recruiterInHireStreams.includes(section.interview.hireStreamId)) {
                return allowed();
            }

            if (interviewerInSectionTypes.includes(section.sectionTypeId)) {
                if (section.interviewerId === session.user.id) {
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

            return section.interviewerId === session.user.id
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

            if (session.userRoles.hasRecruiterRoles) {
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

            if (session.userRoles.hasRecruiterRoles || session.userRoles.hasInterviewerRoles) {
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
            if (session.userRoles.hasHiringLeadRoles || session.userRoles.hasRecruiterRoles) {
                return allowed();
            }
            return notAllowed('Only hiring leads and recruiters can see vacancies');
        },
    },
};
