import { ProblemDifficulty } from '@prisma/client';
import React from 'react';

import { useProblemCount } from '../../modules/problemHooks';
import { useProblemFilterUrlParams } from '../../hooks/useProblemFilterUrlParams';
import { FilterBar } from '../FilterBar/FilterBar';

interface ProblemFilterBarProps {
    title?: string;
}

export const ProblemFilterBar = ({ title }: ProblemFilterBarProps) => {
    const { values, setter, setSearch, clearParams } = useProblemFilterUrlParams();

    const problemCountQuery = useProblemCount({
        search: values.search,
        difficulty: values.difficulty as ProblemDifficulty[],
        tagIds: values.tag,
        authorIds: values.author,
    });

    return (
        <FilterBar
            title={title}
            search={values.search}
            setSearch={setSearch}
            setter={setter}
            values={{
                difficulty: values.difficulty,
                tag: values.tag,
                author: values.author,
            }}
            clearParams={clearParams}
            total={problemCountQuery.data?.total}
            count={problemCountQuery.data?.count}
        />
    );
};
