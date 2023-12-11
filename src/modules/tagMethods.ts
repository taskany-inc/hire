import { Prisma, Tag } from '@prisma/client';

import { prisma } from '../utils/prisma';
import { generateColor } from '../utils/color';
import { suggestionsTake } from '../utils/suggestions';

import { CreateTag, GetTagSuggestions } from './tagTypes';

const create = async (data: CreateTag): Promise<Tag> => {
    const tag = await prisma.tag.create({ data: { ...data, color: generateColor() } });

    return tag;
};

const getAll = (): Promise<Tag[]> => {
    return prisma.tag.findMany();
};

const suggestions = async ({ query, include, take = suggestionsTake }: GetTagSuggestions) => {
    const where: Prisma.TagWhereInput = { name: { contains: query, mode: 'insensitive' } };

    if (include) {
        where.id = { notIn: include };
    }
    const suggestions = await prisma.tag.findMany({ where, take });

    if (include) {
        const includes = await prisma.tag.findMany({ where: { id: { in: include } } });
        suggestions.push(...includes);
    }

    return suggestions;
};

export const tagMethods = { create, getAll, suggestions };
