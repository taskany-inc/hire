import { useState, VFC } from 'react';
import { Button, FormTitle, Modal, ModalContent, ModalCross, ModalHeader, Text } from '@taskany/bricks';
import { gapM, gapS } from '@taskany/colors';
import styled from 'styled-components';

import { AsyncAnyFunction } from '../types';

import { tr } from './components.i18n';

type ConfirmationProps = {
    open: boolean;
    message: string;
    description?: string;
    onAgree: VoidFunction;
    onClose: VoidFunction;
    inProgress?: boolean;
    destructive?: boolean;
};

const StyledDescription = styled(Text)`
    padding-bottom: ${gapM};
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
}) => (
    <Modal onClose={onClose} visible={open} {...modalProps}>
        <ModalHeader>
            <ModalCross onClick={onClose} />
            <FormTitle>{message}</FormTitle>
        </ModalHeader>
        <ModalContent>
            {description && <StyledDescription>{description}</StyledDescription>}
            <>
                <Button onClick={onClose} text={tr('Cancel')} />
                <Button
                    onClick={onAgree}
                    view={destructive ? 'danger' : 'primary'}
                    disabled={inProgress}
                    text={tr('Ok')}
                    style={{ marginLeft: gapS }}
                />
            </>
        </ModalContent>
    </Modal>
);

type UseConfirmation = (config: {
    message: string;
    description?: string;
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
