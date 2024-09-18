import {
    AppliedFilter,
    Select,
    SelectPanel,
    SelectTrigger,
    State,
    StateGroup,
    TagCleanButton,
} from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';
import React, { FC } from 'react';
import { ProblemDifficulty } from '@prisma/client';

import { problemDifficultyLabels } from '../../utils/dictionaries';
import { difficultyToColor, mapEnum } from '../../utils';

import { tr } from './AppliedProblemDifficultyFilter.i18n';

interface AppliedProblemDifficultyFilterProps {
    onCleanFilter: () => void;
    selectedDifficulties: string[] | undefined;
    onChange: (difficulties: { id: string }[]) => void;
    onClose: () => void;
}

const difficulties = mapEnum(ProblemDifficulty, (key) => ({
    id: key,
}));

export const AppliedProblemDifficultyFilter: FC<AppliedProblemDifficultyFilterProps> = ({
    onChange,
    onClose,
    onCleanFilter,
    selectedDifficulties,
}) => {
    const value = selectedDifficulties?.map((id) => ({ id })) || [];
    return (
        <AppliedFilter label={tr('Difficulty')} action={<TagCleanButton size="s" onClick={onCleanFilter} />}>
            <Select
                arrow
                value={value}
                items={difficulties}
                onClose={onClose}
                onChange={onChange}
                mode="multiple"
                selectable
                renderItem={({ item }) => (
                    <State
                        title={problemDifficultyLabels[item.id as ProblemDifficulty]}
                        color={difficultyToColor[item.id as ProblemDifficulty]}
                    />
                )}
            >
                <SelectTrigger>
                    {nullable(
                        value.length > 1,
                        () => (
                            <StateGroup
                                items={value.map((item) => ({
                                    title: problemDifficultyLabels[item.id as ProblemDifficulty],
                                    color: difficultyToColor[item.id as ProblemDifficulty],
                                }))}
                            />
                        ),
                        nullable(value[0], (item) => (
                            <State
                                title={problemDifficultyLabels[item.id as ProblemDifficulty]}
                                color={difficultyToColor[item.id as ProblemDifficulty]}
                            />
                        )),
                    )}
                </SelectTrigger>
                <SelectPanel placement="bottom" />
            </Select>
        </AppliedFilter>
    );
};
