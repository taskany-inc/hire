import { User, Prisma, UserSettings } from '@prisma/client';

import { prisma } from '../utils/prisma';
import { ErrorWithStatus, idObjsToIds } from '../utils';
import { UserRoles, UserRolesInfo } from '../utils/userRoles';
import { suggestionsTake } from '../utils/suggestions';

import {
    AddProblemToFavorites,
    CreateUser,
    EditUserSettings,
    GetUserByCrewUser,
    GetUserList,
    GetUserSuggestions,
} from './userTypes';
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

    if (data.interviewerInHireStreamId) {
        where.interviewerInSectionTypes = { some: { hireStreamId: data.interviewerInHireStreamId } };
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
            problemEditor: true,
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
        [UserRoles.PROBLEM_EDITOR]: user.problemEditor,
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
        data,
    });
};

const suggestions = async ({ query, include, take = suggestionsTake, hr, includeEmails }: GetUserSuggestions) => {
    const where: Prisma.UserWhereInput = {
        name: { contains: query, mode: 'insensitive' },
    };

    if (include) {
        where.id = { notIn: include };
    }

    if (includeEmails) {
        where.email = { notIn: includeEmails };
    }

    if (hr) {
        where.createdInterviews = { some: {} };
    }
    const suggestions = await prisma.user.findMany({ where, take });

    if (include) {
        const includes = await prisma.user.findMany({ where: { id: { in: include } } });
        suggestions.push(...includes);
    }

    if (includeEmails) {
        const includes = await prisma.user.findMany({ where: { email: { in: includeEmails } } });
        suggestions.push(...includes);
    }

    return suggestions;
};

const getByCrewUser = async (input: GetUserByCrewUser): Promise<User> => {
    const user = await prisma.user.findFirst({
        where: {
            OR: [{ name: input.name }, { email: input.email }, { name: input.login }],
        },
    });

    if (user) {
        if (input.name && user.name !== input.name) {
            return prisma.user.update({ where: { id: user.id }, data: { name: input.name } });
        }
        return user;
    }

    return create({ name: input.name || input.login || input.email, email: input.email });
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
    suggestions,
    getByCrewUser,
};
