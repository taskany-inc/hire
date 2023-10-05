import React, { FC, useState } from 'react';
import { gapM, gapXs, gray10, gray5 } from '@taskany/colors';
import { Button, ModalContent, ModalHeader, ModalPreview, Text } from '@taskany/bricks';
import styled from 'styled-components';

import { ProblemList } from '../problems/ProblemList';
import { ProblemFilterBar } from '../problems/problem-filter/ProblemFilterBar';
import { ProblemFilterContextProvider } from '../../contexts/problem-filter-context';

import { tr } from './sections.i18n';

const StyledModalHeader = styled(ModalHeader)`
    margin-top: ${gapXs};
    position: sticky;
    box-shadow: 0 2px 5px 2px rgb(0 0 0 / 10%);
`;

const StyledModalContent = styled(ModalContent)`
    overflow: auto;
    height: 80%;

    padding-top: ${gapM};
`;

const StyledFiltersPanel = styled.div`
    width: 100vw;
    margin-left: calc((100vw - 400px) / -20);
    background-color: ${gray5};
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
