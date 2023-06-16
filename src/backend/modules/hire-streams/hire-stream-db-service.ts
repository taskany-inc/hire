import { HireStream } from '@prisma/client';
import { Session } from 'next-auth';

import { ErrorWithStatus } from '../../../utils';
import { getUserRoleIds } from '../../access/access-checks';
import { prisma } from '../../index';
import { rolesDbService } from '../roles/roles-db-service';

import { CreateHireStream } from './hire-stream-types';

const getById = async (id: number): Promise<HireStream> => {
    const hireStream = await prisma.hireStream.findFirst({ where: { id } });

    if (!hireStream) {
        throw new ErrorWithStatus('Hire stream not found!', 404);
    }

    return hireStream;
};

const getByName = async (name: string): Promise<HireStream> => {
    const hireStream = await prisma.hireStream.findFirst({ where: { name } });

    if (!hireStream) {
        throw new ErrorWithStatus('Hire stream not found!', 404);
    }

    return hireStream;
};

const getAll = (): Promise<HireStream[]> => prisma.hireStream.findMany();

const getAllowed = (session: Session | null): Promise<HireStream[]> => {
    if (!session) {
        throw new ErrorWithStatus('No session', 401);
    }

    if (session.userRoles.admin) return prisma.hireStream.findMany();

    const { combinedHireStreams } = getUserRoleIds(session);

    return prisma.hireStream.findMany({ where: { id: { in: combinedHireStreams } } });
};

const create = async (data: CreateHireStream, creatorId: number) => {
    const hireStream = await prisma.hireStream.create({ data });

    await rolesDbService.addHireStreamManagerToHireStream({ hireStreamId: hireStream.id, userId: creatorId });

    return hireStream;
};

export const hireStreamDbService = {
    getById,
    getByName,
    getAll,
    getAllowed,
    create,
};
