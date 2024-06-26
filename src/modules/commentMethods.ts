import { Comment, InterviewStatus, Prisma } from '@prisma/client';

import { prisma } from '../utils/prisma';
import { Paths, generatePath } from '../utils/paths';
import config from '../config';
import { ErrorWithStatus, idsToIdObjs } from '../utils';

import { sendMail } from './nodemailer';
import { CreateComment, EditComment, DeleteComment } from './commentTypes';
import { tr } from './modules.i18n';
import { crewMethods } from './crewMethods';
import { VacancyStatus } from './crewTypes';

const createComment = async (params: CreateComment): Promise<Comment> => {
    const { text, userId, target, attachIds, ...restData } = params;

    const data: Prisma.CommentCreateInput = {
        ...restData,
        text,
        user: { connect: { id: params.userId } },
        attaches: attachIds ? { connect: idsToIdObjs(attachIds) } : undefined,
    };

    if ('problemId' in target) {
        data.problem = { connect: { id: target.problemId } };
    }

    if ('interviewId' in target) {
        data.interview = { connect: { id: target.interviewId, status: target.status } };
    }

    const comment = await prisma.comment.create({
        data,
        include: {
            user: true,
            problem: { include: { comments: { include: { user: true } }, author: true } },
            interview: { include: { comments: { include: { user: true } }, creator: true } },
            attaches: true,
            reactions: true,
        },
    });

    const { interviewId } = comment;

    if (comment.status === InterviewStatus.HIRED && interviewId) {
        const interview = await prisma.interview.findFirstOrThrow({
            where: { id: interviewId },
            select: { crewVacancyId: true },
        });

        if (interview.crewVacancyId !== null) {
            crewMethods.editVacancy({ id: interview.crewVacancyId, status: VacancyStatus.CLOSED });
        }
    }

    if (comment.user !== comment.problem?.author && comment.problem?.author) {
        await sendMail({
            to: comment.problem.author.email,
            subject: `${tr('Comment on problem')} ${comment.problem.name}`,
            text: `${tr('User')} ${comment.user.name} ${tr('wrote:')}})\n
                        ${data.text}\n
                        ${config.defaultPageURL}/${generatePath(Paths.PROBLEM, {
                problemId: comment.problem.id,
            })}`,
        });
    }
    if (comment.user !== comment.interview?.creator && comment.interview?.creator) {
        if (comment.interview?.creator) {
            await sendMail({
                to: comment.interview.creator.email,
                subject: `${tr('Comment on interview')} ${comment.interview.id}`,
                text: `${tr('User')} ${comment.user.name} ${tr('wrote:')}\n
                        ${data.text}\n
                        ${config.defaultPageURL}/${generatePath(Paths.INTERVIEW, {
                    interviewId: comment.interview.id,
                })}`,
            });
        }
    }

    return comment;
};

const getById = async (id: string): Promise<Comment> => {
    const comment = await prisma.comment.findFirst({
        where: { id },
        include: { attaches: { where: { deletedAt: null } } },
    });

    if (comment === null) {
        throw new ErrorWithStatus(tr('Comment not found'), 404);
    }

    return comment;
};

const updateComment = async (data: EditComment) => {
    const { id, text, attachIds } = data;

    const comment = await prisma.comment.update({
        where: { id },
        data: { text, attaches: attachIds ? { connect: idsToIdObjs(attachIds) } : undefined },
    });

    return comment;
};

const deleteComment = async (data: DeleteComment) => {
    const id = prisma.comment.delete({ where: { id: data.id } });

    return id;
};
export const commentMethods = { createComment, updateComment, deleteComment, getById };
