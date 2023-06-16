import React, { VFC, useState } from 'react';
import { gapM } from '@taskany/colors';
import { Button, ModalPreview } from '@taskany/bricks';

import { ProblemList } from '../problems/ProblemList';
import { ProblemFilterBar } from '../problems/problem-filter/ProblemFilterBar';
import { ProblemFilterContextProvider } from '../../contexts/problem-filter-context';

type AddProblemToSectionProps = {
    interviewId: number;
};

const AddProblemToSectionInner: VFC<AddProblemToSectionProps> = ({ interviewId }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button view="primary" type="button" text="Add problem" onClick={() => setOpen(true)} />
            <ModalPreview visible={open} onClose={() => setOpen(false)}>
                <div style={{ paddingRight: 20 }}>
                    <ProblemFilterBar embedded />
                </div>
                <div style={{ padding: gapM }}>
                    <ProblemList embedded isSmallSize interviewId={interviewId} />
                </div>
            </ModalPreview>
        </>
    );
};

export const AddProblemToSection: VFC<AddProblemToSectionProps> = (props) => (
    <ProblemFilterContextProvider>
        <AddProblemToSectionInner {...props} />
    </ProblemFilterContextProvider>
);
