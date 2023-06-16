import { User } from '@prisma/client';

import { prisma } from '../..';
import { ErrorWithStatus } from '../../../utils';
import { UserRoles, UserRolesInfo } from '../../user-roles';
import { idObjsToIds } from '../../utils';
import { sectionTypeDbService } from '../section-type/section-type-db-service';

import { AddProblemToFavorites, CreateUser } from './user-types';

const create = async (data: CreateUser) => {
    return prisma.user.create({ data: { ...data } });
};

const find = async (id: number): Promise<User> => {
    const user = await prisma.user.findFirst({ where: { id } });

    if (user === null) {
        throw new ErrorWithStatus('User not found', 404);
    }

    return user;
};

const getFavoriteProblems = async (userId: number) => {
    return prisma.problem.findMany({ where: { favoritedBy: { some: { id: userId } } } });
};

const findIdByEmail = async (email: string): Promise<number | undefined> => {
    const user = await prisma.user.findFirst({ where: { email } });

    return user?.id;
};

const getByEmail = async (email: string): Promise<User> => {
    const user = await prisma.user.findFirst({ where: { email } });

    if (user === null) {
        throw new ErrorWithStatus('User not found', 404);
    }

    return user;
};

const getAll = (): Promise<User[]> => {
    return prisma.user.findMany();
};

const addProblemToFavorites = async (userId: number, data: AddProblemToFavorites) => {
    await prisma.user.update({
        where: { id: userId },
        data: { favoriteProblems: { connect: { id: data.problemId } } },
    });
};

const removeProblemFromFavorites = async (userId: number, data: AddProblemToFavorites) => {
    await prisma.user.update({
        where: { id: userId },
        data: { favoriteProblems: { disconnect: { id: data.problemId } } },
    });
};

const getUserRoles = async (id: number) => {
    const user = await prisma.user.findFirst({
        where: { id },
        select: {
            admin: true,
            managerInHireStreams: true,
            hiringLeadInHireStreams: true,
            recruiterInHireStreams: true,
            interviewerInSectionTypes: { select: { id: true } },
        },
    });

    if (!user) {
        throw new Error('User not found');
    }

    const allSectionTypes = await sectionTypeDbService.getAll({});

    const interviewerInSectionTypeIds = idObjsToIds(user.interviewerInSectionTypes);
    const interviewerInSectionTypes = allSectionTypes.filter((st) => interviewerInSectionTypeIds.includes(st.id));

    const userRoles: UserRolesInfo = {
        [UserRoles.ADMIN]: user.admin,
        [UserRoles.HIRE_STREAM_MANAGER]: user.managerInHireStreams,
        hasHireStreamManagerRoles: user.managerInHireStreams.length > 0,
        [UserRoles.HIRING_LEAD]: user.hiringLeadInHireStreams,
        hasHiringLeadRoles: user.hiringLeadInHireStreams.length > 0,
        [UserRoles.RECRUITER]: user.recruiterInHireStreams,
        hasRecruiterRoles: user.recruiterInHireStreams.length > 0,
        [UserRoles.INTERVIEWER]: interviewerInSectionTypes,
        hasInterviewerRoles: interviewerInSectionTypes.length > 0,
    };

    return userRoles;
};

export const userDbService = {
    create,
    find,
    getFavoriteProblems,
    getByEmail,
    getAll,
    findIdByEmail,
    addProblemToFavorites,
    removeProblemFromFavorites,
    getUserRoles,
};
