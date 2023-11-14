import { Tag } from '@prisma/client';

import { prisma } from '../utils/prisma';
import { generateColor } from '../utils/color';

import { CreateTag } from './tagTypes';

const create = async (data: CreateTag): Promise<Tag> => {
    const tag = await prisma.tag.create({ data: { ...data, color: generateColor() } });

    return tag;
};

const getAll = (): Promise<Tag[]> => {
    return prisma.tag.findMany();
};

export const tagMethods = { create, getAll };
