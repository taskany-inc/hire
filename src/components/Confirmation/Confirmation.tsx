import { useState, VFC } from 'react';
import { Button, FormTitle, Modal, ModalContent, ModalCross, ModalHeader, Text } from '@taskany/bricks';
import { gapM, gapS, gapXl } from '@taskany/colors';
import styled from 'styled-components';

import { AsyncAnyFunction } from '../../utils/types';

import { tr } from './Confirmation.i18n';

type ConfirmationProps = {
    open: boolean;
    message: string;
    description?: string;
    onAgree: VoidFunction;
    onClose: VoidFunction;
    inProgress?: boolean;
    destructive?: boolean;
};

const StyledWrapper = styled.div`
    display: flex;
    gap: ${gapS};
    float: right;
    margin: ${gapXl} 0 ${gapM} 0;
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
    return (
        <Modal width={500} onClose={onClose} visible={open} {...modalProps}>
            <ModalHeader>
                <ModalCross onClick={onClose} />
                <FormTitle>{message}</FormTitle>
            </ModalHeader>
            <ModalContent>
                {description && <Text>{description}</Text>}
                <StyledWrapper>
                    <Button
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
