import { AppliedFilter, Checkbox, Select, SelectPanel, SelectTrigger, TagCleanButton } from '@taskany/bricks/harmony';
import React, { FC } from 'react';
import { ProblemDifficulty } from '@prisma/client';

import { mapEnum } from '../../utils';

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
    return (
        <AppliedFilter label={tr('Difficulty')} action={<TagCleanButton size="s" onClick={onCleanFilter} />}>
            <Select
                arrow
                value={selectedDifficulties?.map((id) => ({ id }))}
                items={difficulties}
                onClose={onClose}
                onChange={onChange}
                mode="multiple"
                renderItem={({ item }) => (
                    <Checkbox label={item.id} checked={selectedDifficulties?.includes(item.id)} />
                )}
            >
                <SelectTrigger />
                <SelectPanel placement="bottom" />
            </Select>
        </AppliedFilter>
    );
};
