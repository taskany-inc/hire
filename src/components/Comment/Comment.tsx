import { useCallback } from 'react';
import { InterviewStatus } from '@prisma/client';
import { Badge, nullable } from '@taskany/bricks';

import { useCommentDeleteMutation, useCommentEditMutation } from '../../modules/commentHooks';
import { InterviewStatusTagPalette } from '../../utils/tagPalette';
import { interviewStatusLabels } from '../../utils/dictionaries';
import { CommentWithUserAndReaction } from '../../modules/commentTypes';
import { useReactionsResource } from '../../modules/reactionHooks';
import { CommentView, CommentViewHeader, CommentViewHeaderTitle } from '../CommentView/CommentView';
import { useSession } from '../../contexts/appSettingsContext';
import { accessChecks } from '../../modules/accessChecks';

import { tr } from './Comment.i18n';

interface CommentProps {
    comment: CommentWithUserAndReaction;
    status?: InterviewStatus;
}

export const Comment = ({ comment, status }: CommentProps) => {
    const { id, reactions, user } = comment;
    const session = useSession();
    const commentEditMutation = useCommentEditMutation();
    const commentDeleteMutation = useCommentDeleteMutation();
    const { commentReaction } = useReactionsResource();

    const validatedStatus = status === 'HIRED' || status === 'REJECTED' ? status : undefined;
    const canUpdateOrDelete =
        session && accessChecks.comment.updateOrDelete(session, comment).allowed && !validatedStatus;

    const onCommentEditSubmit = useCallback(
        async (text: string) => {
            const result = await commentEditMutation.mutateAsync({
                text,
                id,
            });
            return result;
        },
        [commentEditMutation, id],
    );

    const onDeleteComment = useCallback(async () => {
        const result = await commentDeleteMutation.mutateAsync({
            id,
        });

        return result;
    }, [commentDeleteMutation, id]);

    const onCommentReactionToggle = useCallback(
        (id: string) => {
            return commentReaction(id);
        },
        [commentReaction],
    );

    return (
        <CommentView
            author={user}
            text={comment.text}
            reactions={reactions}
            status={validatedStatus}
            onReactionToggle={onCommentReactionToggle(comment.id)}
            onDelete={canUpdateOrDelete ? onDeleteComment : undefined}
            onEdit={canUpdateOrDelete ? onCommentEditSubmit : undefined}
            header={
                <CommentViewHeader author={user} date={comment.createdAt} dot={Boolean(validatedStatus)}>
                    {nullable(validatedStatus, (status) => (
                        <>
                            <CommentViewHeaderTitle>{tr('Interview status:')}</CommentViewHeaderTitle>
                            <Badge size="l" color={InterviewStatusTagPalette[status]}>
                                {interviewStatusLabels[status]}
                            </Badge>
                        </>
                    ))}
                </CommentViewHeader>
            }
        />
    );
};
