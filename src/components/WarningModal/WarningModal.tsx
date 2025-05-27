import { ReactNode } from 'react';
import { Modal, ModalHeader, ModalContent, Button } from '@taskany/bricks/harmony';

import { tr } from './WarningModal.i18n';
import s from './WarningModal.module.css';

interface WarningModalProps {
    visible: boolean;
    warningText: ReactNode;
    onCancel: () => void;
    onConfirm: () => void;
    view?: 'danger' | 'warning';
}

export const WarningModal = ({ visible, warningText, onCancel, onConfirm, view = 'danger' }: WarningModalProps) => (
    <Modal visible={visible} width={530}>
        <ModalHeader view={view}>{tr('Confirm action')}</ModalHeader>
        <ModalContent className={s.ModalContent}>{warningText}</ModalContent>
        <div className={s.FormActions}>
            <Button type="button" text={tr('Cancel')} onClick={onCancel} />
            <Button type="button" text={tr('Yes, confirm')} view={view} onClick={onConfirm} />
        </div>
    </Modal>
);
