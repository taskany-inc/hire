import { useState, VFC } from 'react';
import { Button, FormTitle, Modal, ModalContent, ModalHeader, Text } from '@taskany/bricks';

import { AsyncAnyFunction } from '../types';

type ConfirmationProps = {
    open: boolean;
    message: string;
    description?: string;
    onAgree: VoidFunction;
    onClose: VoidFunction;
    inProgress?: boolean;
    destructive?: boolean;
};

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
            <FormTitle>{message}</FormTitle>
        </ModalHeader>
        <ModalContent>
            {description && <Text>{description}</Text>}
            <>
                <Button onClick={onClose} text="Cancel" />
                <Button onClick={onAgree} view={destructive ? 'danger' : 'default'} disabled={inProgress} text="Ok" />
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
