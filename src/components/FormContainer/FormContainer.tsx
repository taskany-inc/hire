import styled from 'styled-components';
import { FC, ReactNode } from 'react';
import { Button, KeyCode, KeyMod, useKeyboard } from '@taskany/bricks';

import { KeyboardSubmitHint } from '../candidates/KeyboardSubmitHint';

const OuterContainer = styled.div`
    width: 650px;
    max-width: 80vw;
`;

const InnerContainer = styled.div`
    opacity: 0.8;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-sizing: border-box;
    border-radius: 6px;
    padding: 6px 12px;
    margin-bottom: 28px;
`;

const BottomContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 8px;
`;

const StyledButton = styled(Button)`
    display: inline-block;
    float: right;
    margin-left: 8px;
    margin-top: 8px;
`;

export interface FormContainerProps {
    submitButtonText: string;
    onSubmitButton: () => void;
    submitButtonDisabled?: boolean;
    onDeleteButton?: () => void;
    deleteButtonText?: string;
    notToShowHint?: boolean;
    children?: ReactNode;
}

export const FormContainer: FC<FormContainerProps> = (props) => {
    const {
        children,
        onSubmitButton,
        submitButtonDisabled,
        submitButtonText,
        onDeleteButton,
        deleteButtonText,
        notToShowHint,
    } = props;

    const [keyboard] = useKeyboard([KeyCode.Enter, KeyMod.CtrlCmd], () => onSubmitButton(), {
        disableGlobalEvent: false,
        capture: true,
    });

    return (
        <OuterContainer {...keyboard}>
            <InnerContainer>{children}</InnerContainer>
            {!notToShowHint && <KeyboardSubmitHint actionTitle={submitButtonText} />}
            <BottomContainer>
                <StyledButton
                    type="submit"
                    view="primary"
                    onClick={onSubmitButton}
                    disabled={submitButtonDisabled}
                    text={submitButtonText}
                />
                {deleteButtonText && <StyledButton view="danger" onClick={onDeleteButton} text={deleteButtonText} />}
            </BottomContainer>
        </OuterContainer>
    );
};
