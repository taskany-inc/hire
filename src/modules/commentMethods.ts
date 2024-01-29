import { Comment } from '@prisma/client';

import { prisma } from '../utils/prisma';
import { Paths, generatePath } from '../utils/paths';
import config from '../config';
import { ErrorWithStatus } from '../utils';

import { sendMail } from './nodemailer';
import { CreateComment, EditComment, DeleteComment } from './commentTypes';
import { tr } from './modules.i18n';

const createComment = async (data: CreateComment) => {
    const { text, userId, problemId, ...restData } = data;

    const comment = await prisma.comment.create({
        data: { ...restData, text, user: { connect: { id: userId } }, problem: { connect: { id: problemId } } },
        include: { problem: { include: { comments: { include: { user: true } }, author: true } }, user: true },
    });

    if (comment.user !== comment.problem.author) {
        return sendMail({
            to: comment.problem.author.email,
            subject: tr('Comment on proplem {comment.problem.name}'),
            text: `User ${comment.user.name} wrote:\n
            ${data.text}\n
            ${config.defaultPageURL}/${generatePath(Paths.PROBLEM, {
                problemId: data.problemId,
            })}`,
        });
    }
};

const getById = async (id: string): Promise<Comment> => {
    const comment = await prisma.comment.findFirst({ where: { id } });

    if (comment === null) {
        throw new ErrorWithStatus(tr('Comment not found'), 404);
    }

    return comment;
};

const updateComment = async (data: EditComment) => {
    const { id, text } = data;

    const comment = prisma.comment.update({ where: { id }, data: { text } });

    return comment;
};

const deleteComment = async (data: DeleteComment) => {
    const id = prisma.comment.delete({ where: { id: data.id } });

    return id;
};
export const commentMethods = { createComment, updateComment, deleteComment, getById };
