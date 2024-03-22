import { ReactNode, useRef, useState, VFC } from 'react';
import { Button, FormTitle, Modal, ModalContent, ModalCross, ModalHeader } from '@taskany/bricks';
import { gapL, gapM, gapS } from '@taskany/colors';
import styled from 'styled-components';

import { AsyncAnyFunction } from '../../utils/types';

import { tr } from './Confirmation.i18n';

interface ConfirmationProps {
    open: boolean;
    message: string;
    description?: ReactNode;
    onAgree: VoidFunction;
    onClose: VoidFunction;
    inProgress?: boolean;
    destructive?: boolean;
}

const StyledWrapper = styled.div`
    display: flex;
    gap: ${gapS};
    float: right;
    margin: ${gapL} 0 ${gapM} 0;
`;

export const Confirmation: VFC<ConfirmationProps> = ({
    message,
    description,
    destructive,
    onClose,
    onAgree,
    inProgress,
    open,
    ...modalProps
}) => {
    const ref = useRef<HTMLButtonElement>(null);

    const onShow = () => setTimeout(() => ref.current?.focus(), 0);

    return (
        <Modal onShow={onShow} width={500} onClose={onClose} visible={open} {...modalProps}>
            <ModalHeader>
                <ModalCross onClick={onClose} />
                <FormTitle>{message}</FormTitle>
            </ModalHeader>
            <ModalContent>
                {description}
                <StyledWrapper>
                    <Button
                        ref={ref}
                        onClick={onAgree}
                        view={destructive ? 'danger' : 'primary'}
                        disabled={inProgress}
                        outline
                        type="submit"
                        text={tr('Ok')}
                    />
                    <Button onClick={onClose} text={tr('Cancel')} />
                </StyledWrapper>
            </ModalContent>
        </Modal>
    );
};

type UseConfirmation = (config: {
    message: string;
    description?: ReactNode;
    onAgree: AsyncAnyFunction;
    /** Colors the Ok button red to warn the user of a dangerous action */
    destructive?: boolean;
}) => {
    show: VoidFunction;
    props: ConfirmationProps;
};

export const useConfirmation: UseConfirmation = (config) => {
    const { message, description, onAgree, destructive } = config;
    const [open, setOpen] = useState(false);
    const [inProgress, setInProgress] = useState(false);

    const show = () => setOpen(true);
    const hide = () => setOpen(false);

    const wrappedOnAgree = () => {
        setInProgress(true);
        onAgree()
            .then(hide)
            .finally(() => setInProgress(false));
    };

    return {
        show,
        props: {
            open,
            message,
            description,
            onAgree: wrappedOnAgree,
            onClose: hide,
            inProgress,
            destructive,
        },
    };
};
