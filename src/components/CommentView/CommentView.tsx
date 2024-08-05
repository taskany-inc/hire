import React, { FC, useCallback, useMemo, useState } from 'react';
import { textColor } from '@taskany/colors';
import { UserPic, nullable } from '@taskany/bricks';
import { IconBinOutline, IconEditOutline, IconMoreVerticalOutline } from '@taskany/icons';
import { Comment, InterviewStatus } from '@prisma/client';
import {
    Card,
    CardInfo,
    Button,
    CardContent,
    Dropdown,
    DropdownTrigger,
    DropdownPanel,
    MenuItem,
    ListView,
    ListViewItem,
} from '@taskany/bricks/harmony';
import cn from 'classnames';

import { ActivityFeedItem } from '../ActivityFeed/ActivityFeed';
import { CommentForm } from '../CommentForm/CommentForm';
import { CardHeaderComment } from '../CardHeaderComment/CardHeaderComment';
import config from '../../config';
import { Circle } from '../Circle/Circle';
import { CommentSchema } from '../../modules/commentTypes';
import { Light } from '../Light';
import { Link } from '../Link';
import { accessChecks } from '../../modules/accessChecks';
import { useSession } from '../../contexts/appSettingsContext';
import { useDistanceDate } from '../../hooks/useDateFormat';
import ReactionsDropdown from '../ReactionDropdown/ReactionDropdown';
import { Reactions } from '../Reactions/Reactions';
import { ReactionsMap } from '../../modules/reactionTypes';
import { useReactionsResource } from '../../modules/reactionHooks';
import { InterviewStatusCommentCard } from '../InterviewStatusCommentCard/InterviewStatusCommentCard';
import Md from '../Md';

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
    status?: InterviewStatus;

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
    status,
}) => {
    const [editMode, setEditMode] = useState(false);
    const [focused, setFocused] = useState(false);
    const [busy, setBusy] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [commentText, setCommentText] = useState({ text: comment.text });
    const session = useSession();
    const date = useDistanceDate(comment.createdAt);
    const { reactionsProps } = useReactionsResource(reactions);
    const userByEmailLink = `${config.sourceUsers.userByEmailLink}/${author?.email}`;

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
            <Card className={cn(s.CommentCard, { [s.CommentCard_highlighted]: highlight })}>
                <Circle>
                    {nullable(userByEmailLink && author, ({ email, name }) => (
                        <Link href={userByEmailLink} inline target="_blank">
                            <UserPic size={35} email={email} name={name} />
                        </Link>
                    ))}
                </Circle>
            </Card>

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
                    {status === InterviewStatus.REJECTED || status === InterviewStatus.HIRED ? (
                        nullable(author, (data) => (
                            <InterviewStatusCommentCard
                                name={data.name || data.email}
                                timeAgo={date}
                                comment={comment}
                                userByEmailLink={userByEmailLink}
                            />
                        ))
                    ) : (
                        <CardInfo className={s.CardInfo}>
                            {nullable(author, (data) => (
                                <CardHeaderComment name={data.name || data.email} timeAgo={date} />
                            ))}
                            <div className={s.CommentActions}>
                                <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)}>
                                    <DropdownTrigger
                                        renderTrigger={(props) => (
                                            <Light color={textColor} ref={props.ref} onClick={() => setIsOpen(!isOpen)}>
                                                <IconMoreVerticalOutline size="xs" className={s.DropdownTrigger} />
                                            </Light>
                                        )}
                                    />
                                    <DropdownPanel placement="top-end">
                                        <ListView>
                                            {dropdownItems.map((item) => (
                                                <ListViewItem
                                                    key={item.label}
                                                    value={item}
                                                    renderItem={({ active, hovered, ...props }) => (
                                                        <MenuItem
                                                            hovered={active || hovered}
                                                            onClick={item.onClick}
                                                            key={item.label}
                                                            {...props}
                                                        >
                                                            {item.label}
                                                        </MenuItem>
                                                    )}
                                                />
                                            ))}
                                        </ListView>
                                    </DropdownPanel>
                                </Dropdown>
                            </div>
                        </CardInfo>
                    )}

                    <CardContent view="transparent" className={s.CardComment}>
                        {nullable(commentText.text, (t) => (
                            <Md className={s.Markdown}>{t}</Md>
                        ))}

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
