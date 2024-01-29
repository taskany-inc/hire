import React, { useState, useCallback } from 'react';
import { Button, UserPic } from '@taskany/bricks';

import { useSession } from '../../contexts/appSettingsContext';
import { CommentForm } from '../CommentForm/CommentForm';
import { ActivityFeedItem } from '../ActivityFeed';
import { CommentSchema } from '../../modules/commentTypes';

import { tr } from './CommentCreateForm.i18n';

interface CommentCreateFormProps extends Omit<React.ComponentProps<typeof CommentForm>, 'actionButton'> {
    onSubmit: (comment: CommentSchema) => void;
    onChange?: (comment: CommentSchema) => void;
}

const CommentCreateForm: React.FC<CommentCreateFormProps> = ({
    text: currentText = '',
    onSubmit,
    onFocus,
    onCancel,
    onChange,
}) => {
    const session = useSession();

    const [text, setText] = useState(currentText);
    const [focused, setFocused] = useState(Boolean(currentText));
    const [busy, setBusy] = useState(false);

    const onCommentFocus = useCallback(() => {
        setFocused(true);
        onFocus?.();
    }, [onFocus]);

    const onCommentChange = useCallback(
        ({ text }: { text: string }) => {
            setText(text);
            onChange?.({ text });
        },
        [onChange],
    );

    const onCommentSubmit = useCallback(
        async (form: CommentSchema) => {
            setBusy(true);
            setFocused(false);

            onSubmit?.(form);

            setText('');

            setBusy(false);
            setFocused(true);
        },
        [onSubmit],
    );

    const onCancelCreate = useCallback(() => {
        setBusy(false);
        setFocused(false);
        setText('');
        onCancel?.();
    }, [onCancel]);

    return (
        <ActivityFeedItem>
            <UserPic size={32} email={session?.user?.email} name={session?.user?.name} />

            <CommentForm
                text={text}
                focused={focused}
                busy={busy}
                onChange={onCommentChange}
                onSubmit={onCommentSubmit}
                onCancel={onCancelCreate}
                onFocus={onCommentFocus}
                actionButton={
                    <>
                        <Button size="m" view="primary" disabled={busy} outline type="submit" text={tr('Comment')} />
                    </>
                }
            />
        </ActivityFeedItem>
    );
};

export default CommentCreateForm;
