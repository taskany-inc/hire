import React, { FC, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { brandColor, danger0, gapM, gapS, gray4, textColor } from '@taskany/colors';
import { Card, CardComment, CardInfo, UserPic, nullable, Button, Md, Dropdown, MenuItem } from '@taskany/bricks';
import { IconBinOutline, IconEditOutline, IconMoreVerticalOutline } from '@taskany/icons';
import { Comment } from '@prisma/client';

import { ActivityFeedItem } from '../ActivityFeed';
import { CommentForm } from '../CommentForm/CommentForm';
import { CardHeaderComment } from '../CardHeaderComment';
import config from '../../config';
import { Circle } from '../Circle';
import { CommentSchema } from '../../modules/commentTypes';
import { Light } from '../Light';
import { Link } from '../Link';
import { accessChecks } from '../../modules/accessChecks';
import { useSession } from '../../contexts/appSettingsContext';
import { useDistanceDate } from '../../hooks/useDateFormat';

import { tr } from './CommentView.i18n';

interface CommentViewProps {
    author?: {
        name: string | null;
        email: string;
    };
    highlight?: boolean;
    comment: Comment;

    onSubmit?: (comment: CommentSchema) => void;
    onChange?: (comment: CommentSchema) => void;
    onCancel?: () => void;
    onDelete: () => void;
}

const StyledCommentActions = styled.div`
    display: flex;
    align-items: center;
    justify-self: end;

    margin-right: -10px;

    & > span + span {
        margin-left: ${gapS};
    }
`;

const StyledCommentCard = styled(Card)<Pick<CommentViewProps, 'highlight'>>`
    position: relative;
    min-height: 60px;

    transition: border-color 200ms ease-in-out;
    border-radius: 9px;

    ${({ highlight }) =>
        highlight &&
        `
            border-color: ${brandColor};
        `}

    &::before {
        position: absolute;
        z-index: 0;

        content: '';

        width: 14px;
        height: 14px;

        background-color: ${gray4};

        border-left: 1px solid ${gray4};
        border-top: 1px solid ${gray4};
        border-radius: 2px;

        transform: rotate(-45deg);
        transition: border-color 200ms ease-in-out;

        top: 7px;
        left: -6px;

        ${({ highlight }) =>
            highlight &&
            `
                border-color: ${brandColor};
            `}
    }
`;

const StyledCardInfo = styled(CardInfo)`
    display: flex;
    justify-content: space-between;
`;

const StyledCardComment = styled(CardComment)`
    display: flex;
    flex-direction: column;
    gap: ${gapM};
    word-break: keep-all;
`;

const StyledMd = styled(Md)`
    overflow-x: auto;
`;

export const CommentView: FC<CommentViewProps> = ({
    author,
    comment,
    highlight,

    onChange,
    onCancel,
    onSubmit,
    onDelete,
}) => {
    const [editMode, setEditMode] = useState(false);
    const [focused, setFocused] = useState(false);
    const [busy, setBusy] = useState(false);
    const [commentText, setCommentText] = useState({ text: comment.text });
    const session = useSession();
    const date = useDistanceDate(comment.createdAt);

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
                color: danger0,
                icon: <IconBinOutline size="xxs" />,
            });
        }

        return items;
    }, [session, comment, onDelete]);

    return (
        <ActivityFeedItem id={`comment-${comment.id}`}>
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
                            size="m"
                            view="primary"
                            disabled={commentText.text === comment.text || busy}
                            outline
                            type="submit"
                            text={tr('Save')}
                        />
                    }
                />
            ) : (
                <StyledCommentCard highlight={highlight}>
                    <StyledCardInfo>
                        {nullable(author, (data) => (
                            <CardHeaderComment name={data.name || data.email} timeAgo={date} />
                        ))}

                        <StyledCommentActions>
                            <Dropdown
                                items={dropdownItems}
                                renderTrigger={({ ref, onClick }) => (
                                    <Light color={textColor} ref={ref} onClick={onClick}>
                                        <IconMoreVerticalOutline size="xs" />
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
                        </StyledCommentActions>
                    </StyledCardInfo>

                    <StyledCardComment>
                        <StyledMd>{commentText.text}</StyledMd>
                    </StyledCardComment>
                </StyledCommentCard>
            )}
        </ActivityFeedItem>
    );
};
