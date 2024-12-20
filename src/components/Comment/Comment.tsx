import { useCallback } from 'react';
import { InterviewStatus } from '@prisma/client';
import { nullable } from '@taskany/bricks';
import { Badge } from '@taskany/bricks/harmony';

import { useCommentDeleteMutation, useCommentEditMutation } from '../../modules/commentHooks';
import { InterviewStatusTagPalette } from '../../utils/tagPalette';
import { interviewStatusLabels } from '../../utils/dictionaries';
import { CommentWithUserAndReaction } from '../../modules/commentTypes';
import { useReactionsResource } from '../../modules/reactionHooks';
import { CommentView } from '../CommentView/CommentView';
import { CommentViewHeader } from '../CommentViewHeader/CommentViewHeader';
import { CommentViewHeaderTitle } from '../CommentViewHeader/CommentViewHeaderTitle';
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
            view="transparent"
            authors={[user]}
            text={comment.text}
            reactions={reactions}
            status={validatedStatus}
            onReactionToggle={onCommentReactionToggle(comment.id)}
            onDelete={canUpdateOrDelete ? onDeleteComment : undefined}
            onEdit={canUpdateOrDelete ? onCommentEditSubmit : undefined}
            header={
                <CommentViewHeader authors={[user]} date={comment.createdAt} dot={Boolean(validatedStatus)}>
                    {nullable(validatedStatus, (status) => (
                        <>
                            <CommentViewHeaderTitle>{tr('Interview status:')}</CommentViewHeaderTitle>
                            <Badge
                                size="s"
                                view="outline"
                                weight="semiBold"
                                color={InterviewStatusTagPalette[status]}
                                text={interviewStatusLabels[status]}
                            />
                        </>
                    ))}
                </CommentViewHeader>
            }
        />
    );
};
