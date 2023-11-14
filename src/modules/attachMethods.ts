import { Prisma, Attach } from '@prisma/client';

import { prisma } from '../utils/prisma';
import { ErrorWithStatus } from '../utils';

import { CreateAttach } from './attachTypes';
import { tr } from './modules.i18n';

const create = async (data: CreateAttach): Promise<Attach> => {
    const { sectionId, ...restData } = data;
    const createData: Prisma.AttachCreateInput = {
        ...restData,
        section: { connect: { id: sectionId } },
    };

    return prisma.attach.create({ data: createData });
};

const getById = async (id: string) => {
    const attach = await prisma.attach.findFirst({
        where: { id },
        include: { section: { include: { interview: { include: { sections: true } } } } },
    });

    if (attach === null) {
        throw new ErrorWithStatus(tr('Attach not found'), 404);
    }

    return attach;
};

const deleteAttach = async (id: string): Promise<Attach> => {
    await getById(id);

    return prisma.attach.update({ where: { id }, data: { deletedAt: new Date() } });
};

export const attachMethods = {
    create,
    getById,
    delete: deleteAttach,
};
