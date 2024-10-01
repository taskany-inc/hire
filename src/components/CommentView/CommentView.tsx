import { ComponentProps, FC, ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import cn from 'classnames';
import { nullable } from '@taskany/bricks';
import { IconBinOutline, IconEditOutline, IconMoreVerticalOutline } from '@taskany/icons';
import {
    Avatar,
    Text,
    Card,
    CardInfo,
    CardContent,
    Dropdown,
    DropdownTrigger,
    DropdownPanel,
    ListView,
    ListViewItem,
    MenuItem,
    Button,
    Tooltip,
} from '@taskany/bricks/harmony';

import { ReactionsMap } from '../../modules/reactionTypes';
import { CommentForm } from '../CommentForm/CommentForm';
import { Reactions } from '../Reactions/Reactions';
import { Light } from '../Light/Light';
import { ActivityFeedItem, ActivityFeedItemContent } from '../ActivityFeed/ActivityFeed';
import Md from '../Md';

import { tr } from './CommentView.i18n';
import s from './CommentView.module.css';

type CommentStatus = 'NEW' | 'HIRED' | 'REJECTED';

interface User {
    email: string;
    name?: string | null;
}

const statusColors = {
    NEW: {
        backgroundColor: 'var(--status-background-in-progress)',
        foregroundColor: 'var(--status-in-progress)',
    },
    HIRED: {
        backgroundColor: 'var(--status-background-finished)',
        foregroundColor: 'var(--status-finished)',
    },
    REJECTED: {
        backgroundColor: 'var(--status-background-failed)',
        foregroundColor: 'var(--status-failed)',
    },
};

interface CommentAvatarProps {
    author: User[];
}

const CommentAvatar: FC<CommentAvatarProps & ComponentProps<typeof Avatar>> = ({ author, size = 'm', ...props }) => {
    const textRef = useRef<HTMLDivElement>(null);
    return (
        <div className={cn(s.CommentViewAvatarWrapper, s[`CommentViewAvatarWrapper-${size}`])}>
            <Avatar
                className={s.CommentViewAvatar}
                size={size}
                email={author[0].email}
                name={author[0].name}
                {...props}
            />
            {nullable(author.length > 1, () => (
                <>
                    <Text ref={textRef} className={s.CommentViewAvatarCount} size="xs">
                        +{author.length - 1}
                    </Text>
                    <Tooltip arrow reference={textRef} placement="top">
                        {author
                            .slice(1)
                            .map((a) => a.name || a.email)
                            .join(', ')}
                    </Tooltip>
                </>
            ))}
        </div>
    );
};

interface CommentViewProp {
    className?: string;
    authors: User[];
    reactions?: ReactionsMap;
    header?: ReactNode;
    text?: string;
    placeholder?: string;
    status?: CommentStatus;
    onEdit?: (text: string) => void;
    onDelete?: () => void;
    onReactionToggle?: (emoji?: string) => void;
    view?: ComponentProps<typeof CardContent>['view'];
    avatarSize?: ComponentProps<typeof CommentAvatar>['size'];
}

export const CommentView: FC<CommentViewProp> = ({
    className,
    header,
    authors,
    text,
    reactions,
    placeholder,
    onReactionToggle,
    status,
    view,
    onDelete,
    onEdit,
    avatarSize,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [focused, setFocused] = useState(false);
    const [busy, setBusy] = useState(false);
    const [formValue, setFormValue] = useState(text);

    const dropdownItems = useMemo(() => {
        const items = [];

        if (onEdit) {
            items.push({
                onClick: () => {
                    setEditMode(true);
                    setFocused(true);
                },
                label: tr('Edit'),

                icon: <IconEditOutline size="xxs" />,
            });
        }

        if (onDelete) {
            items.push({
                onClick: onDelete,
                label: tr('Delete'),
                className: s.CommentViewActionsItem_danger,
                icon: <IconBinOutline size="xxs" />,
            });
        }

        return items;
    }, [onEdit, onDelete]);

    const onChange = useCallback((comment: { text: string }) => {
        setFormValue(comment.text);
    }, []);

    const onSubmit = useCallback(
        async (comment: { text: string }) => {
            setEditMode(false);
            setFocused(false);
            setBusy(true);

            setFormValue(comment.text);

            try {
                await onEdit?.(comment.text);
            } catch {
                setFormValue(text);
            }

            setBusy(false);
        },
        [onEdit, text],
    );

    const onCancel = useCallback(() => {
        setEditMode(false);
        setFocused(false);
        setFormValue(text);
    }, [text]);

    const headerColors = status ? statusColors[status] : {};

    return (
        <ActivityFeedItem className={cn(s.CommentView, className)}>
            <CommentAvatar author={authors} size={avatarSize} />

            <ActivityFeedItemContent>
                {editMode ? (
                    <CommentForm
                        text={formValue}
                        focused={focused}
                        busy={busy}
                        autoFocus
                        onChange={onChange}
                        onSubmit={onSubmit}
                        onCancel={onCancel}
                        actionButton={
                            <Button
                                size="s"
                                view="primary"
                                disabled={text === formValue || busy}
                                type="submit"
                                text={tr('Save')}
                            />
                        }
                    />
                ) : (
                    <Card {...headerColors}>
                        <CardInfo className={s.CommentViewCardInfo} corner>
                            {header}
                            {nullable(dropdownItems, (items) => (
                                <div className={s.CommentViewActions}>
                                    <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)}>
                                        <DropdownTrigger
                                            renderTrigger={(props) => (
                                                <Light ref={props.ref} onClick={() => setIsOpen(!isOpen)}>
                                                    <IconMoreVerticalOutline size="xs" />
                                                </Light>
                                            )}
                                        />
                                        <DropdownPanel placement="right-start">
                                            <ListView>
                                                {items.map((item) => (
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
                                                                <Text
                                                                    className={cn(
                                                                        s.CommentViewActionsItem,
                                                                        item.className,
                                                                    )}
                                                                    size="xs"
                                                                >
                                                                    {item.icon}
                                                                    {item.label}
                                                                </Text>
                                                            </MenuItem>
                                                        )}
                                                    />
                                                ))}
                                            </ListView>
                                        </DropdownPanel>
                                    </Dropdown>
                                </div>
                            ))}
                        </CardInfo>
                        <CardContent view={view} className={s.CommentViewContent}>
                            {nullable(
                                text,
                                (t) => (
                                    <Md className={s.CommentViewMarkdown}>{t}</Md>
                                ),
                                <Text size="s" className={s.CommentViewPlaceholder}>
                                    {placeholder}
                                </Text>,
                            )}

                            {nullable(reactions, () => (
                                <Reactions reactions={reactions} onClick={onReactionToggle} />
                            ))}
                        </CardContent>
                    </Card>
                )}
            </ActivityFeedItemContent>
        </ActivityFeedItem>
    );
};
