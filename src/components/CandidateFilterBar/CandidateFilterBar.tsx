import React from 'react';

import { FilterBar } from '../FilterBar/FilterBar';
import {
    useCandidateFilterUrlParams,
    candidateFilterValuesToRequestData,
} from '../../hooks/useCandidateFilterUrlParams';
import { useCandidates } from '../../modules/candidateHooks';

interface CandidateFilterBarProps {
    title: string;
}

export const CandidateFilterBar = ({ title }: CandidateFilterBarProps) => {
    const { values, setter, clearParams, setSearch } = useCandidateFilterUrlParams();
    const { search, ...restValues } = values;

    const candidatesQuery = useCandidates(candidateFilterValuesToRequestData(values));

    return (
        <FilterBar
            title={title}
            search={search}
            setSearch={setSearch}
            setter={setter}
            values={restValues}
            clearParams={clearParams}
            total={candidatesQuery.data?.pages[0].total ?? 0}
            count={candidatesQuery.data?.pages[0].count}
        />
    );
};
