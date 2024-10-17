import React, { FormEvent, useCallback, useRef } from 'react';
import { InterviewStatus } from '@prisma/client';
import { nullable, useClickOutside } from '@taskany/bricks';
import { FormControl, Button } from '@taskany/bricks/harmony';
import cn from 'classnames';

import { CommentSchema } from '../../modules/commentTypes';
import { FormActions } from '../FormActions/FormActions';
import { HelpButton } from '../HelpButton/HelpButton';
import { FormControlEditor } from '../FormControlEditorForm/FormControlEditorForm';

import { tr } from './CommentForm.i18n';
import s from './CommentForm.module.css';

interface CommentFormProps {
    actionButton: React.ReactNode;
    interviewRejectReason?: React.ReactNode;
    focused?: boolean;
    control?: boolean;
    autoFocus?: boolean;
    busy?: boolean;
    text?: string;
    status?: InterviewStatus;

    onSubmit: (form: CommentSchema) => void | Promise<void>;
    onChange?: (form: CommentSchema) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onCancel?: () => void;
    onUploadSuccess?: () => void;
    onUploadFail?: (message?: string) => void;
    uploadLink?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({
    text = '',
    status,
    autoFocus,
    focused,
    control,
    busy,
    actionButton,
    onChange,
    onSubmit,
    onFocus,
    onBlur,
    onCancel,
    uploadLink,
    interviewRejectReason,
}) => {
    const ref = useRef(null);

    const onTextChange = useCallback(
        (t = '') => {
            onChange?.({ text: t });
        },

        [onChange],
    );

    const onCommentCancel = useCallback(() => {
        onCancel?.();
    }, [onCancel]);

    const onCommentSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e?.preventDefault();
            onSubmit?.({ text, status });
        },
        [text, status, onSubmit],
    );

    useClickOutside(ref, () => {
        if (text === '') {
            onCancel?.();
        }
    });

    return (
        <div
            className={cn(!interviewRejectReason ? s.CommentFormWrapper : undefined, {
                [s.CommentFormWrapper_focused]: focused,
            })}
            ref={ref}
            tabIndex={0}
        >
            <form onSubmit={onCommentSubmit}>
                {status === InterviewStatus.REJECTED ? (
                    <>
                        {interviewRejectReason}
                        <FormActions>
                            <div className={s.FormHelpButton}>
                                <HelpButton />
                            </div>
                            {nullable(!busy, () => (
                                <Button text={tr('Cancel')} onClick={onCommentCancel} />
                            ))}
                            {actionButton}
                        </FormActions>
                    </>
                ) : (
                    <>
                        <FormControl>
                            <FormControlEditor
                                disabled={busy}
                                placeholder={tr('Leave a comment')}
                                height={control ? 120 : 80}
                                onCancel={onCommentCancel}
                                onFocus={onFocus}
                                onBlur={onBlur}
                                autoFocus={autoFocus}
                                value={text}
                                onChange={onTextChange}
                                outline
                                uploadLink={uploadLink}
                            />
                        </FormControl>
                        {nullable(control, () => (
                            <>
                                <FormActions>
                                    <div className={s.FormHelpButton}>
                                        <HelpButton />
                                    </div>
                                    {nullable(!busy, () => (
                                        <Button text={tr('Cancel')} onClick={onCommentCancel} />
                                    ))}

                                    {actionButton}
                                </FormActions>
                            </>
                        ))}
                    </>
                )}
            </form>
        </div>
    );
};
