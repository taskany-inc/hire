import React, { FC, useState } from 'react';
import { gapM } from '@taskany/colors';
import { ModalContent, ModalHeader, ModalPreview } from '@taskany/bricks';
import { Button, Text } from '@taskany/bricks/harmony';
import styled from 'styled-components';
import { IconPlusCircleOutline } from '@taskany/icons';

import { ProblemList } from '../ProblemList/ProblemList';
import { ProblemFilterBar } from '../ProblemFilterBar/ProblemFilterBar';

import { tr } from './AddProblemToSection.i18n';
import s from './AddProblemToSection.module.css';

const StyledModalHeader = styled(ModalHeader)`
    position: sticky;
    padding-bottom: ${gapM};
`;

const StyledModalContent = styled(ModalContent)`
    overflow-y: scroll;
    overflow-x: hidden;
    height: 80%;

    padding-top: ${gapM};
`;

const StyledFiltersPanel = styled.div`
    margin-left: -20px;
`;

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
                <StyledModalHeader>
                    <Text weight="bold" className={s.AddProblemText}>
                        {tr('Add problem')}
                    </Text>
                    <StyledFiltersPanel>
                        <ProblemFilterBar embedded />
                    </StyledFiltersPanel>
                </StyledModalHeader>
                <StyledModalContent>
                    <ProblemList embedded isSmallSize interviewId={interviewId} />
                </StyledModalContent>
            </ModalPreview>
        </>
    );
};
