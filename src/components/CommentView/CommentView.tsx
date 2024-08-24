import { FC, ReactNode, useCallback, useMemo, useState } from 'react';
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
    Dot,
} from '@taskany/bricks/harmony';

import config from '../../config';
import { ReactionsMap } from '../../modules/reactionTypes';
import { useDistanceDate } from '../../hooks/useDateFormat';
import { CommentForm } from '../CommentForm/CommentForm';
import { Reactions } from '../Reactions/Reactions';
import { Light } from '../Light/Light';
import { ActivityFeedItem } from '../ActivityFeed/ActivityFeed';
import { Link } from '../Link';
import Md from '../Md';

import { tr } from './CommentView.i18n';
import s from './CommentView.module.css';

interface Author {
    name: string | null;
    email: string;
}

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

const getAuthorLink = (author: Author) =>
    config.crew.userByEmailLink ? `${config.crew.userByEmailLink}/${author?.email}` : null;

export const CommentAvatar: FC<{ author: Author }> = ({ author }) => {
    const authorLink = getAuthorLink(author);
    const avatar = <Avatar className={s.CommentViewAvatar} size="m" email={author.email} name={author.name} />;

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

interface CommentViewHeaderTitleProps {
    children?: ReactNode;
    link?: string;
}

export const CommentViewHeaderTitle: FC<CommentViewHeaderTitleProps> = ({ children, link }) => (
    <Text size="l" weight="bold">
        {nullable(
            link,
            (l) => (
                <Link href={l}>{children}</Link>
            ),
            children,
        )}
    </Text>
);

interface CommentViewHeaderProp {
    subtitle?: string;
    dot?: boolean;
    children?: ReactNode;
    authorRole?: string;
    author: Author;
    date: Date;
}

export const CommentViewHeader: FC<CommentViewHeaderProp> = ({ children, author, authorRole, date, subtitle, dot }) => {
    const authorLink = getAuthorLink(author);
    const authorName = author.name ?? author.email;
    const timeAgo = useDistanceDate(date);

    return (
        <div className={s.CommentViewHeader}>
            {nullable(children, (ch) => (
                <div className={s.CommentViewHeaderContent}>{ch}</div>
            ))}

            <div className={s.CommentViewMetaInfo}>
                {nullable(subtitle, (s) => (
                    <Text size="s" weight="bold">
                        {s}
                    </Text>
                ))}

                {nullable(dot, () => (
                    <Dot size="s" className={s.CommentViewHeaderDot} />
                ))}

                <Text size="xs" weight="bold">
                    {nullable(authorRole, (role) => `${role} `)}
                    {nullable(
                        authorLink,
                        (link) => (
                            <Link href={link} inline target="_blank">
                                {authorName}
                            </Link>
                        ),
                        authorName,
                    )}
                </Text>
                <span>—</span>
                <Text size="xs">{timeAgo}</Text>
            </div>
        </div>
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
    onDelete,
    onEdit,
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
    }, []);

    const headerColors = status ? statusColors[status] : {};

    return (
        <ActivityFeedItem className={cn(s.CommentView, className)}>
            <CommentAvatar author={author} />

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
                                                                className={cn(s.CommentViewActionsItem, item.className)}
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
                    <CardContent view="transparent" className={s.CommentViewContent}>
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
        </ActivityFeedItem>
    );
};
