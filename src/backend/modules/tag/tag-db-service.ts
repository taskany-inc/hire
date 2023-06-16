import { Tag } from '@prisma/client';

import { prisma } from '../..';
import { generateColor } from '../../../utils/color';

import { CreateTag } from './tag-types';

const create = async (data: CreateTag): Promise<Tag> => {
    const tag = await prisma.tag.create({ data: { ...data, color: generateColor() } });

    return tag;
};

const getAll = (): Promise<Tag[]> => {
    return prisma.tag.findMany();
};

export const tagDbService = { create, getAll };
