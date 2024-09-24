import { ReactNode } from 'react';
import { ModalContent, ModalHeader, ModalPreview } from '@taskany/bricks/harmony';

import { usePreviewContext } from '../../contexts/previewContext';

import s from './Preview.module.css';

interface ModalPreviewProps {
    header: ReactNode;
    content: ReactNode;
}

export const Preview = ({ header, content }: ModalPreviewProps): JSX.Element => {
    const { hidePreview } = usePreviewContext();

    return (
        <ModalPreview visible onClose={hidePreview} className={s.ModalPreview}>
            <ModalHeader className={s.ModalHeader}>{header}</ModalHeader>
            <div className={s.ModalWrapper}>
                <ModalContent className={s.ModalContent}>{content}</ModalContent>
            </div>
        </ModalPreview>
    );
};
