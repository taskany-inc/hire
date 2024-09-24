import React, { FC } from 'react';
import { Text } from '@taskany/bricks/harmony';

import { Preview } from '../Preview/Preview';
import { ProblemFilterBar } from '../ProblemFilterBar/ProblemFilterBar';
import { ProblemList } from '../ProblemList/ProblemList';

import { tr } from './AddProblemToSectionPreview.i18n';
import s from './AddProblemToSectionPreview.module.css';

interface AddProblemToSectionPreviewProps {
    problemPreview?: {
        interviewId: number;
        sectionId: number;
    };
}

export const AddProblemToSectionPreviewProps: FC<AddProblemToSectionPreviewProps> = ({
    problemPreview,
}: AddProblemToSectionPreviewProps) => {
    return (
        <Preview
            header={
                <>
                    <Text weight="bold" className={s.AddProblemText}>
                        {tr('Add problem')}
                    </Text>
                    <div className={s.AddProblemToSectionFiltersPanel}>
                        <ProblemFilterBar />
                    </div>
                </>
            }
            content={
                <ProblemList
                    embedded
                    isSmallSize
                    interviewId={problemPreview?.interviewId}
                    sectionId={problemPreview?.sectionId}
                />
            }
        />
    );
};
