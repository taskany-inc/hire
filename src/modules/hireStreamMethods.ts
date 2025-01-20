import { HireStream, Prisma } from '@prisma/client';
import { Session } from 'next-auth';

import { ErrorWithStatus } from '../utils';
import { prisma } from '../utils/prisma';
import { suggestionsTake } from '../utils/suggestions';

import { CreateHireStream, EditHireStream, GetHireStreamSuggestions } from './hireStreamTypes';
import { rolesMethods } from './rolesMethods';
import { getUserRoleIds } from './accessChecks';
import { tr } from './modules.i18n';

const getById = async (id: number): Promise<HireStream> => {
    const hireStream = await prisma.hireStream.findFirst({ where: { id } });

    if (!hireStream) {
        throw new ErrorWithStatus(tr('Hire stream not found!'), 404);
    }

    return hireStream;
};

const getByName = async (name: string): Promise<HireStream> => {
    const hireStream = await prisma.hireStream.findFirst({ where: { name } });

    if (!hireStream) {
        throw new ErrorWithStatus(tr('Hire stream not found!'), 404);
    }

    return hireStream;
};

const getAll = (): Promise<HireStream[]> => prisma.hireStream.findMany();

const getAllowed = (session: Session | null): Promise<HireStream[]> => {
    if (!session) {
        throw new ErrorWithStatus(tr('No session'), 401);
    }

    if (session.userRoles.admin) return prisma.hireStream.findMany();

    const { combinedHireStreams, interviewerInSectionTypes } = getUserRoleIds(session);

    return prisma.hireStream.findMany({
        where: {
            OR: [
                { id: { in: combinedHireStreams } },
                { sectionTypes: { some: { id: { in: interviewerInSectionTypes } } } },
            ],
        },
    });
};

const getManaged = (session: Session | null): Promise<HireStream[]> => {
    if (!session) {
        throw new ErrorWithStatus(tr('No session'), 401);
    }

    if (session.userRoles.admin) return prisma.hireStream.findMany();

    const { managerInHireStreams } = getUserRoleIds(session);

    return prisma.hireStream.findMany({ where: { id: { in: managerInHireStreams } } });
};

const create = async (data: CreateHireStream, creatorId: number) => {
    const hireStream = await prisma.hireStream.create({ data });

    await rolesMethods.addHireStreamManagerToHireStream({ hireStreamId: hireStream.id, userId: creatorId });

    return hireStream;
};

const allowedHiringStreamsByName = async (session: Session, hireStreamNames: string[]): Promise<string[]> => {
    if (!session) {
        throw new ErrorWithStatus(tr('No session'), 401);
    }

    if (session.userRoles.admin) return hireStreamNames;

    const { combinedHireStreams } = getUserRoleIds(session);
    const hireStreams = await prisma.hireStream.findMany({ where: { name: { in: hireStreamNames } } });

    return hireStreams.filter((hireStream) => combinedHireStreams.includes(hireStream.id)).map(({ name }) => name);
};

const suggestions = async ({ query, include, take = suggestionsTake }: GetHireStreamSuggestions) => {
    const where: Prisma.HireStreamWhereInput = { name: { contains: query, mode: 'insensitive' } };

    if (include) {
        where.id = { notIn: include };
    }
    const suggestions = await prisma.hireStream.findMany({ where, take });

    if (include) {
        const includes = await prisma.hireStream.findMany({ where: { id: { in: include } } });
        suggestions.push(...includes);
    }

    return suggestions;
};

const edit = ({ id, ...data }: EditHireStream) => {
    return prisma.hireStream.update({ where: { id }, data });
};

export const hireStreamMethods = {
    getById,
    getByName,
    getAll,
    getAllowed,
    create,
    getManaged,
    allowedHiringStreamsByName,
    suggestions,
    edit,
};
