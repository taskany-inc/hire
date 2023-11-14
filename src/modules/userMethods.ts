import { User, Prisma, UserSettings } from '@prisma/client';

import { prisma } from '../utils/prisma';
import { ErrorWithStatus, idObjsToIds } from '../utils';
import { UserRoles, UserRolesInfo } from '../utils/userRoles';

import { AddProblemToFavorites, CreateUser, EditUserSettings, GetUserList } from './userTypes';
import { sectionTypeMethods } from './sectionTypeMethods';
import { tr } from './modules.i18n';

const create = async (data: CreateUser) => {
    return prisma.user.create({ data: { ...data } });
};

const find = async (id: number): Promise<User> => {
    const user = await prisma.user.findFirst({ where: { id } });

    if (user === null) {
        throw new ErrorWithStatus(tr('User not found'), 404);
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
        throw new ErrorWithStatus(tr('User not found'), 404);
    }

    return user;
};

export const constructFindUserListWhereFilter = async (data: GetUserList): Promise<Prisma.UserWhereInput> => {
    const where = {} as Prisma.UserWhereInput;

    if (data.search) {
        where.OR = [
            { name: { contains: data.search, mode: 'insensitive' } },
            { email: { contains: data.search, mode: 'insensitive' } },
        ];
    }

    if (data.sectionTypeId) {
        where.interviewerInSectionTypes = { some: { id: data.sectionTypeId } };
    }

    if (data.sectionTypeOrHireStreamId && data.role) {
        where[data.role] = { none: { id: data.sectionTypeOrHireStreamId } };
    }

    return where;
};

const getUserList = async (data: GetUserList): Promise<User[]> => {
    const where = await constructFindUserListWhereFilter(data);

    return prisma.user.findMany({ where, take: data.limit });
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
        throw new Error(tr('User not found'));
    }

    const allSectionTypes = await sectionTypeMethods.getAll({});

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

const getSettings = async (id: number): Promise<UserSettings> => {
    const settings = await prisma.userSettings.upsert({
        where: { userId: id },
        update: {},
        create: { userId: id },
    });
    return settings;
};

const editSettings = (userId: number, data: EditUserSettings) => {
    return prisma.userSettings.update({
        where: { userId },
        data: { theme: data.theme },
    });
};

export const userMethods = {
    create,
    find,
    getFavoriteProblems,
    getByEmail,
    getAll,
    findIdByEmail,
    addProblemToFavorites,
    removeProblemFromFavorites,
    getUserRoles,
    getUserList,
    getSettings,
    editSettings,
};
