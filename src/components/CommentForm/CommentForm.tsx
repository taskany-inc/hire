import React, { useCallback, useRef } from 'react';
import styled from 'styled-components';
import { backgroundColor, gapM, gray4 } from '@taskany/colors';
import {
    Button,
    Form,
    FormCard,
    FormAction,
    FormActions,
    nullable,
    useClickOutside,
    FormEditor,
} from '@taskany/bricks';
import { IconQuestionCircleOutline } from '@taskany/icons';

import { CommentSchema } from '../../modules/commentTypes';

import { tr } from './CommentForm.i18n';

interface CommentFormProps {
    actionButton: React.ReactNode;
    focused?: boolean;
    autoFocus?: boolean;
    busy?: boolean;
    text?: string;

    onSubmit: (form: CommentSchema) => void | Promise<void>;
    onChange?: (form: CommentSchema) => void;
    onFocus?: () => void;
    onCancel?: () => void;
}

const StyledFormBottom = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding-top: ${gapM};
`;

const StyledCommentForm = styled(FormCard)`
    &::before {
        position: absolute;
        z-index: 0;

        content: '';

        width: 14px;
        height: 14px;

        background-color: ${backgroundColor};

        border-left: 1px solid ${gray4};
        border-top: 1px solid ${gray4};
        border-radius: 2px;

        transform: rotate(-45deg);
        top: 12px;
        left: -8px;
    }
`;

const StyledIconQuestionCircleOutline = styled(IconQuestionCircleOutline)`
    display: flex;
`;

export const CommentForm: React.FC<CommentFormProps> = ({
    text = '',
    autoFocus,
    focused,
    busy,
    actionButton,
    onChange,
    onSubmit,
    onFocus,
    onCancel,
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
        onSubmit?.({ text });
    }, [text, onSubmit]);

    useClickOutside(ref, () => {
        if (text === '') {
            onCancel?.();
        }
    });

    return (
        <StyledCommentForm ref={ref} tabIndex={0}>
            <Form onSubmit={onCommentSubmit}>
                <FormEditor
                    disabled={busy}
                    placeholder={tr('Leave a comment')}
                    height={focused ? 120 : 40}
                    onCancel={onCommentCancel}
                    onFocus={onFocus}
                    autoFocus={autoFocus}
                    value={text}
                    onChange={onTextChange}
                    disableAttaches={true}
                />

                {nullable(focused, () => (
                    <FormActions>
                        <FormAction left inline>
                            {nullable(focused, () => (
                                <StyledFormBottom>
                                    <StyledIconQuestionCircleOutline size="s" />{' '}
                                </StyledFormBottom>
                            ))}
                        </FormAction>
                        <FormAction right inline>
                            {nullable(!busy, () => (
                                <Button outline text={tr('Cancel')} onClick={onCommentCancel} />
                            ))}

                            {actionButton}
                        </FormAction>
                    </FormActions>
                ))}
            </Form>
        </StyledCommentForm>
    );
};
