import { ComponentProps, FC, ReactNode, useCallback, useMemo, useState } from 'react';
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
} from '@taskany/bricks/harmony';

import { ReactionsMap } from '../../modules/reactionTypes';
import { Author, getAuthorLink } from '../../utils/user';
import { CommentForm } from '../CommentForm/CommentForm';
import { Reactions } from '../Reactions/Reactions';
import { Light } from '../Light/Light';
import { ActivityFeedItem, ActivityFeedItemContent } from '../ActivityFeed/ActivityFeed';
import { Link } from '../Link';
import Md from '../Md';

import { tr } from './CommentView.i18n';
import s from './CommentView.module.css';

export type CommentStatus = 'NEW' | 'HIRED' | 'REJECTED';

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
    author: Author;
    size?: ComponentProps<typeof Avatar>['size'];
}

const CommentAvatar: FC<CommentAvatarProps> = ({ author, size = 'm' }) => {
    const authorLink = getAuthorLink(author);
    const avatar = <Avatar className={s.CommentViewAvatar} size={size} email={author.email} name={author.name} />;

    return nullable(
        authorLink,
        (link) => (
            <Link href={link} inline target="_blank">
                {avatar}
            </Link>
        ),
        avatar,
    );
};

interface CommentViewProp {
    className?: string;
    author: Author;
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
    author,
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
            <CommentAvatar author={author} size={avatarSize} />

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
