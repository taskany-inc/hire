import React, { FC, useState } from 'react';
import { ModalContent, ModalHeader, ModalPreview } from '@taskany/bricks';
import { Button, Text } from '@taskany/bricks/harmony';
import { IconPlusCircleOutline } from '@taskany/icons';

import { ProblemList } from '../ProblemList/ProblemList';
import { ProblemFilterBar } from '../ProblemFilterBar/ProblemFilterBar';

import { tr } from './AddProblemToSection.i18n';
import s from './AddProblemToSection.module.css';

interface AddProblemToSectionProps {
    interviewId: number;
}

export const AddProblemToSection: FC<AddProblemToSectionProps> = ({ interviewId }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                iconRight={<IconPlusCircleOutline size="s" />}
                view="default"
                type="button"
                text={tr('Add problem')}
                onClick={() => setOpen(true)}
            />
            <ModalPreview visible={open} onClose={() => setOpen(false)}>
                <ModalHeader className={s.AddProblemToSectionModalHeader}>
                    <Text weight="bold" className={s.AddProblemText}>
                        {tr('Add problem')}
                    </Text>
                    <div className={s.AddProblemToSectionFiltersPanel}>
                        <ProblemFilterBar embedded />
                    </div>
                </ModalHeader>
                <ModalContent className={s.AddProblemToSectionModalContent}>
                    <ProblemList embedded isSmallSize interviewId={interviewId} />
                </ModalContent>
            </ModalPreview>
        </>
    );
};
