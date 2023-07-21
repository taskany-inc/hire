import { CalendarEvent, Interview, Problem } from '@prisma/client';
import { Session } from 'next-auth';

import { CandidateWithInterviewWithSectionsRelations } from '../modules/candidate/candidate-types';
import { InterviewWithSections } from '../modules/interview/interview-types';
import { SectionWithInterviewRelation } from '../modules/section/section-types';
import { onlyUnique } from '../utils';

import { tr } from './access.i18n';

export type AccessOptions = Partial<{
    filterInterviewsByHireStreamIds: number[];
    filterInterviewsBySectionTypeIds: number[];
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
            if (session.userRoles.admin) {
                return allowed();
            }

            return session.user.id === problem.authorId
                ? allowed()
                : notAllowed(tr('The problem can be edited and deleted only by its author'));
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

        readOne: (session: Session, interview: InterviewWithSections): AccessCheckResult => {
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
                return allowed({ filterSectionsBySectionTypeIds: interviewerInSectionTypes });
            }

            return notAllowed(tr('No access to recruitment streams or section types for this interview'));
        },

        readMany: (session: Session): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { hiringLeadInHireStreams, recruiterInHireStreams, interviewerInSectionTypes } =
                getUserRoleIds(session);

            if (session.userRoles.hasHiringLeadRoles) {
                return allowed({ filterInterviewsByHireStreamIds: hiringLeadInHireStreams });
            }

            if (session.userRoles.hasRecruiterRoles) {
                return allowed({ filterInterviewsByHireStreamIds: recruiterInHireStreams });
            }

            if (session.userRoles.hasInterviewerRoles) {
                return allowed({ filterInterviewsBySectionTypeIds: interviewerInSectionTypes });
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

            const { recruiterInHireStreams } = getUserRoleIds(session);

            if (recruiterInHireStreams.includes(section.interview.hireStreamId)) {
                return allowed();
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

    solution: {
        create: (session: Session, section: SectionWithInterviewRelation): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { recruiterInHireStreams, interviewerInSectionTypes } = getUserRoleIds(session);

            if (recruiterInHireStreams.includes(section.interview.hireStreamId)) {
                return allowed();
            }

            if (interviewerInSectionTypes.includes(section.sectionTypeId)) {
                return session.user.id === section.interviewerId ? allowed() : notAllowed(tr('No access to section'));
            }

            return notAllowed(tr('No access to hire stream or section type'));
        },

        read: (session: Session, section: SectionWithInterviewRelation): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { hiringLeadInHireStreams, recruiterInHireStreams, interviewerInSectionTypes } =
                getUserRoleIds(session);

            if (
                hiringLeadInHireStreams.includes(section.interview.hireStreamId) ||
                recruiterInHireStreams.includes(section.interview.hireStreamId)
            ) {
                return allowed();
            }

            if (interviewerInSectionTypes.includes(section.sectionTypeId)) {
                return section.interview.sections.some((section) => section.interviewerId === session.user.id)
                    ? allowed()
                    : notAllowed(tr('No access to section'));
            }

            return notAllowed(tr('No access to hire stream or section type'));
        },

        updateOrDelete: (session: Session, section: SectionWithInterviewRelation): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { recruiterInHireStreams, interviewerInSectionTypes } = getUserRoleIds(session);

            if (recruiterInHireStreams.includes(section.interview.hireStreamId)) {
                return allowed();
            }

            if (interviewerInSectionTypes.includes(section.sectionTypeId)) {
                return session.user.id === section.interviewerId ? allowed() : notAllowed(tr('No access to section'));
            }

            return notAllowed(tr('No access to hire stream or section type'));
        },
    },

    hireStream: {
        create: (_session: Session): AccessCheckResult => {
            return allowed();
        },

        read: (_session: Session): AccessCheckResult => {
            return allowed();
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

    reaction: {
        createOrReadOrUpdateOrDelete: (session: Session, hireStreamId: number): AccessCheckResult => {
            if (session.userRoles.admin) {
                return allowed();
            }

            const { hiringLeadInHireStreams } = getUserRoleIds(session);

            return hiringLeadInHireStreams.includes(hireStreamId)
                ? allowed()
                : notAllowed(tr('Only hiring leads can add reactions'));
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
};
