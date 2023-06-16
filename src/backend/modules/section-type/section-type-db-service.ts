import { prisma } from '../..';
import { ErrorWithStatus } from '../../../utils';
import { Option } from '../../../types';

import {
    CreateSectionType,
    GetAllSectionTypes,
    GetSectionType,
    UpdateSectionType,
    SectionTypeWithHireStream,
} from './section-type-types';

const getAll = async (where: GetAllSectionTypes): Promise<SectionTypeWithHireStream[]> => {
    const sectionTypes = await prisma.sectionType.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        include: { hireStream: true },
    });

    if (sectionTypes === null) {
        throw new ErrorWithStatus('Hire stream section types type not found', 404);
    }

    return sectionTypes;
};

const getById = async (where: GetSectionType): Promise<SectionTypeWithHireStream> => {
    const sectionType = await prisma.sectionType.findFirst({
        where,
        include: { hireStream: true },
    });

    if (sectionType === null) {
        throw new ErrorWithStatus('Section type not found', 404);
    }

    return sectionType;
};

const getInterviewers = async (sectionTypeId: number): Promise<Option[]> => {
    const users = await prisma.user.findMany({ where: { interviewerInSectionTypes: { some: { id: sectionTypeId } } } });

    return users.map((u) => ({ text: u.name ?? '', value: u.id }));
};

const create = async (data: CreateSectionType) => {
    const { hireStreamId, ...restData } = data;

    return prisma.sectionType.create({ data: { ...restData, hireStream: { connect: { id: hireStreamId } } } });
};

const update = async (data: UpdateSectionType) => {
    const { sectionTypeId, ...restData } = data;

    return prisma.sectionType.update({ where: { id: sectionTypeId }, data: restData });
};

const deleteSectionType = async (id: number) => {
    const sectionTypeRelation = await prisma.sectionType.findFirst({ where: { id } });

    if (sectionTypeRelation === null) {
        throw new ErrorWithStatus('SectionType not found', 404);
    }

    const sectionType = await prisma.sectionType.delete({ where: { id } });

    return sectionType;
};

export const sectionTypeDbService = {
    getAll,
    getById,
    getInterviewers,
    create,
    update,
    delete: deleteSectionType,
};
