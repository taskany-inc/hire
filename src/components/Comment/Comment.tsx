import { useCallback } from 'react';
import { InterviewStatus } from '@prisma/client';

import { useCommentDeleteMutation, useCommentEditMutation } from '../../modules/commentHooks';
import { CommentSchema, CommentWithUserAndReaction } from '../../modules/commentTypes';
import { CommentView } from '../CommentView/CommentView';
import { useReactionsResource } from '../../modules/reactionHooks';

interface CommentProps {
    comment: CommentWithUserAndReaction;
    status?: InterviewStatus;
}

export const Comment = ({ comment, status }: CommentProps) => {
    const { id, reactions, user } = comment;
    const commentEditMutation = useCommentEditMutation();
    const commentDeleteMutation = useCommentDeleteMutation();
    const { commentReaction } = useReactionsResource();

    const onCommenEditSubmit = useCallback(
        async (value: CommentSchema) => {
            const result = await commentEditMutation.mutateAsync({
                text: value.text,
                id,
            });
            return result;
        },
        [commentEditMutation, id],
    );

    const onDeleteComment = useCallback(
        async (id: string) => {
            const result = await commentDeleteMutation.mutateAsync({
                id,
            });

            return result;
        },
        [commentDeleteMutation],
    );

    const onCommentReactionToggle = useCallback(
        (id: string) => {
            return commentReaction(id);
        },
        [commentReaction],
    );

    return (
        <>
            <CommentView
                comment={comment}
                key={id}
                author={user}
                reactions={reactions}
                onReactionToggle={onCommentReactionToggle(comment.id)}
                onDelete={() => onDeleteComment(id)}
                onSubmit={onCommenEditSubmit}
                status={status}
            />
        </>
    );
};
