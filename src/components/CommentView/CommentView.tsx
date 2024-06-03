import React, { FC, useCallback, useMemo, useState } from 'react';
import { textColor } from '@taskany/colors';
import { UserPic, nullable, Dropdown, MenuItem } from '@taskany/bricks';
import { IconBinOutline, IconEditOutline, IconMoreVerticalOutline } from '@taskany/icons';
import { Comment } from '@prisma/client';
import { Card, CardInfo, Button, CardContent } from '@taskany/bricks/harmony';
import cn from 'classnames';

import { ActivityFeedItem } from '../ActivityFeed';
import { CommentForm } from '../CommentForm/CommentForm';
import { CardHeaderComment } from '../CardHeaderComment/CardHeaderComment';
import config from '../../config';
import { Circle } from '../Circle';
import { CommentSchema } from '../../modules/commentTypes';
import { Light } from '../Light';
import { Link } from '../Link';
import { accessChecks } from '../../modules/accessChecks';
import { useSession } from '../../contexts/appSettingsContext';
import { useDistanceDate } from '../../hooks/useDateFormat';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import ReactionsDropdown from '../ReactionDropdown/ReactionDropdown';
import { Reactions } from '../Reactions/Reactions';
import { ReactionsMap } from '../../modules/reactionTypes';
import { useReactionsResource } from '../../modules/reactionHooks';

import { tr } from './CommentView.i18n';
import s from './CommentView.module.css';

interface CommentViewProps {
    author?: {
        name: string | null;
        email: string;
    };
    highlight?: boolean;
    reactions: ReactionsMap;
    comment: Comment;

    onSubmit?: (comment: CommentSchema) => void;
    onChange?: (comment: CommentSchema) => void;
    onCancel?: () => void;
    onDelete: () => void;
    className?: string;
    onReactionToggle?: React.ComponentProps<typeof ReactionsDropdown>['onClick'];
}

export const CommentView: FC<CommentViewProps> = ({
    author,
    comment,
    reactions,
    highlight,

    onChange,
    onCancel,
    onSubmit,
    onDelete,
    className,
    onReactionToggle,
}) => {
    const [editMode, setEditMode] = useState(false);
    const [focused, setFocused] = useState(false);
    const [busy, setBusy] = useState(false);
    const [commentText, setCommentText] = useState({ text: comment.text });
    const session = useSession();
    const date = useDistanceDate(comment.createdAt);
    const { reactionsProps } = useReactionsResource(reactions);

    const onCommentSubmit = useCallback(
        async (form: CommentSchema) => {
            setEditMode(false);
            setBusy(true);
            setFocused(false);

            onChange?.({ text: form.text });

            setCommentText({ text: form.text });
            try {
                await onSubmit?.({ text: form.text });
            } catch (error) {
                setCommentText({ text: comment.text });
            }

            setBusy(false);
        },
        [onSubmit, onChange, comment.text],
    );

    const onCommentCancel = useCallback(() => {
        setEditMode(false);
        setFocused(false);
        setCommentText({ text: comment.text });
        onCancel?.();
    }, [comment.text, onCancel]);

    const userByEmailLink = `${config.sourceUsers.userByEmailLink}/${author?.email}`;

    const dropdownItems = useMemo(() => {
        const canUpdateOrDelete = session && accessChecks.comment.updateOrDelete(session, comment).allowed;
        const items = [];

        if (canUpdateOrDelete) {
            items.push({
                onClick: () => {
                    setEditMode(true);
                    setFocused(true);
                },
                label: tr('Edit'),

                icon: <IconEditOutline size="xxs" />,
            });
            items.push({
                onClick: onDelete,
                label: tr('Delete'),
                className: s.CommentActionsItem_danger,
                icon: <IconBinOutline size="xxs" />,
            });
        }

        return items;
    }, [session, comment, onDelete]);

    return (
        <ActivityFeedItem className={cn(s.CommentView, className)} id={`comment-${comment.id}`}>
            <Circle size={31}>
                {nullable(userByEmailLink && author, ({ email, name }) => (
                    <Link href={userByEmailLink} inline target="_blank">
                        <UserPic size={35} email={email} name={name} />
                    </Link>
                ))}
            </Circle>

            {editMode ? (
                <CommentForm
                    text={commentText.text}
                    focused={focused}
                    busy={busy}
                    autoFocus
                    onChange={setCommentText}
                    onSubmit={onCommentSubmit}
                    onCancel={onCommentCancel}
                    actionButton={
                        <Button
                            size="s"
                            view="primary"
                            disabled={commentText.text === comment.text || busy}
                            type="submit"
                            text={tr('Save')}
                        />
                    }
                />
            ) : (
                <Card className={cn(s.CommentCard, { [s.CommentCard_highlighted]: highlight })}>
                    <CardInfo className={s.CardInfo}>
                        {nullable(author, (data) => (
                            <CardHeaderComment name={data.name || data.email} timeAgo={date} />
                        ))}

                        <div className={s.CommentActions}>
                            <Dropdown
                                items={dropdownItems}
                                renderTrigger={({ ref, onClick }) => (
                                    <Light color={textColor} ref={ref} onClick={onClick}>
                                        <IconMoreVerticalOutline size="xs" className={s.DropdownTrigger} />
                                    </Light>
                                )}
                                renderItem={({ item, cursor, index }) => (
                                    <MenuItem
                                        key={item.label}
                                        ghost
                                        color={item.color}
                                        focused={cursor === index}
                                        icon={item.icon}
                                        onClick={item.onClick}
                                    >
                                        {item.label}
                                    </MenuItem>
                                )}
                            />
                        </div>
                    </CardInfo>

                    <CardContent view="transparent" className={s.CardComment}>
                        <MarkdownRenderer className={s.Markdown} value={commentText.text} />

                        <Reactions reactions={reactions} onClick={onReactionToggle}>
                            {nullable(!reactionsProps.limited, () => (
                                <ReactionsDropdown view="button" onClick={onReactionToggle} />
                            ))}
                        </Reactions>
                    </CardContent>
                </Card>
            )}
        </ActivityFeedItem>
    );
};
