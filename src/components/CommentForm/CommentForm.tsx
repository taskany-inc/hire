import React, { useCallback, useRef } from 'react';
import { InterviewStatus } from '@prisma/client';
import { Form, FormAction, nullable, useClickOutside } from '@taskany/bricks';
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
    autoFocus?: boolean;
    busy?: boolean;
    text?: string;
    status?: InterviewStatus;

    onSubmit: (form: CommentSchema) => void | Promise<void>;
    onChange?: (form: CommentSchema) => void;
    onFocus?: () => void;
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
    busy,
    actionButton,
    onChange,
    onSubmit,
    onFocus,
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

    const onCommentSubmit = useCallback(() => {
        onSubmit?.({ text, status });
    }, [text, status, onSubmit]);

    useClickOutside(ref, () => {
        if (text === '') {
            onCancel?.();
        }
    });

    return (
        <div
            className={cn(!interviewRejectReason ? s.CommentFormWrapper : s.CommentFormRejectInterviewStatusWrapper, {
                [s.CommentFormWrapper_focused]: focused,
            })}
            ref={ref}
            tabIndex={0}
        >
            <Form onSubmit={onCommentSubmit}>
                {status === InterviewStatus.REJECTED ? (
                    <>
                        {interviewRejectReason}
                        <FormActions>
                            <div className={s.FormHelpButton}>
                                <HelpButton />
                            </div>
                            <FormAction right inline>
                                {nullable(!busy, () => (
                                    <Button text={tr('Cancel')} onClick={onCommentCancel} />
                                ))}
                                {actionButton}
                            </FormAction>
                        </FormActions>
                    </>
                ) : (
                    <>
                        <FormControl>
                            <FormControlEditor
                                disabled={busy}
                                placeholder={tr('Leave a comment')}
                                height={focused ? 120 : 80}
                                onCancel={onCommentCancel}
                                onFocus={onFocus}
                                autoFocus={autoFocus}
                                value={text}
                                onChange={onTextChange}
                                outline
                                uploadLink={uploadLink}
                            />
                        </FormControl>
                        {nullable(focused, () => (
                            <>
                                <FormActions>
                                    <div className={s.FormHelpButton}>
                                        <HelpButton />
                                    </div>
                                    <FormAction right inline>
                                        {nullable(!busy, () => (
                                            <Button text={tr('Cancel')} onClick={onCommentCancel} />
                                        ))}

                                        {actionButton}
                                    </FormAction>
                                </FormActions>
                            </>
                        ))}
                    </>
                )}
            </Form>
        </div>
    );
};
