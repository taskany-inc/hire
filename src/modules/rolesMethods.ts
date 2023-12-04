import { prisma } from '../utils/prisma';
import { ErrorWithStatus } from '../utils';
import { UserRoles } from '../utils/userRoles';

import { sectionTypeMethods } from './sectionTypeMethods';
import {
    AddAndRemoveProblemEditorRole,
    GetUsersByHireStreamId,
    HireStreamIdAndSectionTypeAndUserId,
    HireStreamIdAndUserId,
    HireStreamUsersWithRoles,
} from './rolesTypes';
import { tr } from './modules.i18n';

const getAllAdmins = () => {
    return prisma.user.findMany({ where: { admin: { equals: true } } });
};

const getUsersByHireStream = async ({ hireStreamId }: GetUsersByHireStreamId): Promise<HireStreamUsersWithRoles> => {
    const hireStreamManagers = await prisma.user.findMany({
        where: { managerInHireStreams: { some: { id: hireStreamId } } },
    });

    const hiringLeads = await prisma.user.findMany({
        where: { hiringLeadInHireStreams: { some: { id: hireStreamId } } },
    });

    const recruiters = await prisma.user.findMany({
        where: { recruiterInHireStreams: { some: { id: hireStreamId } } },
    });

    const sectionTypes = await sectionTypeMethods.getAll({ hireStreamId });
    const sectionTypeIds = sectionTypes.map((s) => s.id);

    const interviewers = await prisma.user.findMany({
        where: { interviewerInSectionTypes: { some: { id: { in: sectionTypeIds } } } },
        include: { interviewerInSectionTypes: true },
    });

    const sectionTypeUsers: HireStreamUsersWithRoles['interviewer'] = sectionTypes.map((sectionType) => ({
        sectionType,
        users: interviewers.filter((user) => user.interviewerInSectionTypes.some((st) => sectionType.id === st.id)),
    }));

    return {
        [UserRoles.HIRE_STREAM_MANAGER]: hireStreamManagers,
        [UserRoles.HIRING_LEAD]: hiringLeads,
        [UserRoles.RECRUITER]: recruiters,
        [UserRoles.INTERVIEWER]: sectionTypeUsers,
    };
};

const addHireStreamManagerToHireStream = async ({ hireStreamId, userId }: HireStreamIdAndUserId) => {
    return prisma.user.update({
        where: { id: userId },
        data: { managerInHireStreams: { connect: { id: hireStreamId } } },
    });
};

const removeHireStreamManagerFromHireStream = async ({ hireStreamId, userId }: HireStreamIdAndUserId) => {
    return prisma.user.update({
        where: { id: userId },
        data: { managerInHireStreams: { disconnect: { id: hireStreamId } } },
    });
};

const addHiringLeadToHireStream = async ({ hireStreamId, userId }: HireStreamIdAndUserId) => {
    return prisma.user.update({
        where: { id: userId },
        data: { hiringLeadInHireStreams: { connect: { id: hireStreamId } } },
    });
};

const removeHiringLeadFromHireStream = async ({ hireStreamId, userId }: HireStreamIdAndUserId) => {
    return prisma.user.update({
        where: { id: userId },
        data: { hiringLeadInHireStreams: { disconnect: { id: hireStreamId } } },
    });
};

const addRecruiterToHireStream = async ({ hireStreamId, userId }: HireStreamIdAndUserId) => {
    return prisma.user.update({
        where: { id: userId },
        data: { recruiterInHireStreams: { connect: { id: hireStreamId } } },
    });
};

const removeRecruiterFromHireStream = async ({ hireStreamId, userId }: HireStreamIdAndUserId) => {
    return prisma.user.update({
        where: { id: userId },
        data: { recruiterInHireStreams: { disconnect: { id: hireStreamId } } },
    });
};

const addInterviewerToSectionType = async ({
    hireStreamId,
    sectionTypeId,
    userId,
}: HireStreamIdAndSectionTypeAndUserId) => {
    const sectionType = await prisma.sectionType.findFirst({ where: { id: sectionTypeId, hireStreamId } });

    if (!sectionType) {
        throw new ErrorWithStatus(
            tr('Section type {sectionTypeId} is not in hire stream {hireStreamId}', { sectionTypeId, hireStreamId }),
            500,
        );
    }

    return prisma.user.update({
        where: { id: userId },
        data: { interviewerInSectionTypes: { connect: { id: sectionTypeId } } },
    });
};

const removeInterviewerFromSectionType = async ({
    hireStreamId,
    sectionTypeId,
    userId,
}: HireStreamIdAndSectionTypeAndUserId) => {
    const sectionType = await prisma.sectionType.findFirst({ where: { id: sectionTypeId, hireStreamId } });

    if (!sectionType) {
        throw new ErrorWithStatus(
            tr('Section type {sectionTypeId} is not in hire stream {hireStreamId}', { sectionTypeId, hireStreamId }),
            500,
        );
    }

    return prisma.user.update({
        where: { id: userId },
        data: { interviewerInSectionTypes: { disconnect: { id: sectionTypeId } } },
    });
};

const getAllProblemEditors = () => {
    return prisma.user.findMany({ where: { problemEditor: { equals: true } } });
};

const addProblemEditorRole = async ({ userId }: AddAndRemoveProblemEditorRole) => {
    return prisma.user.update({
        where: { id: userId },
        data: { problemEditor: true },
    });
};

const removeProblemEditorRole = async ({ userId }: AddAndRemoveProblemEditorRole) => {
    return prisma.user.update({
        where: { id: userId },
        data: { problemEditor: false },
    });
};

export const rolesMethods = {
    getAllAdmins,
    getUsersByHireStream,
    addHireStreamManagerToHireStream,
    removeHireStreamManagerFromHireStream,
    addHiringLeadToHireStream,
    removeHiringLeadFromHireStream,
    addRecruiterToHireStream,
    removeRecruiterFromHireStream,
    addInterviewerToSectionType,
    removeInterviewerFromSectionType,
    getAllProblemEditors,
    addProblemEditorRole,
    removeProblemEditorRole,
};
