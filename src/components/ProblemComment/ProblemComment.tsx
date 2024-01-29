import { useCallback } from 'react';

import { useCommentDeleteMutation, useCommentEditMutation } from '../../modules/commentHooks';
import { CommentSchema, CommentWithUser } from '../../modules/commentTypes';
import { CommentView } from '../CommentView/CommentView';

interface ProblemCommentsProps {
    comment: CommentWithUser;
}

export const ProblemComment = ({ comment }: ProblemCommentsProps) => {
    const { user, id } = comment;

    const commentEditMutation = useCommentEditMutation();

    const commentDeleteMutation = useCommentDeleteMutation();

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

    return (
        <>
            <CommentView
                comment={comment}
                key={id}
                author={user}
                onDelete={() => onDeleteComment(id)}
                onSubmit={onCommenEditSubmit}
            />
        </>
    );
};
