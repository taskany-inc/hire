import React, { FC, useState } from 'react';
import { gapM, gray10 } from '@taskany/colors';
import { Button, ModalContent, ModalHeader, ModalPreview, Text } from '@taskany/bricks';
import styled from 'styled-components';

import { ProblemFilterContextProvider } from '../../contexts/problemFilterContext';
import { ProblemList } from '../ProblemList/ProblemList';
import { ProblemFilterBar } from '../ProblemFilterBar/ProblemFilterBar';

import { tr } from './AddProblemToSection.i18n';

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

type AddProblemToSectionProps = {
    interviewId: number;
};

const AddProblemToSectionInner: FC<AddProblemToSectionProps> = ({ interviewId }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button view="primary" outline type="button" text={tr('Add problem')} onClick={() => setOpen(true)} />
            <ModalPreview visible={open} onClose={() => setOpen(false)}>
                <StyledModalHeader>
                    <Text weight="bold" color={gray10}>
                        Add problem
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

export const AddProblemToSection: FC<AddProblemToSectionProps> = (props) => (
    <ProblemFilterContextProvider>
        <AddProblemToSectionInner {...props} />
    </ProblemFilterContextProvider>
);
