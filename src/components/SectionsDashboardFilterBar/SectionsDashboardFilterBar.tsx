import React, { useMemo } from 'react';

import { FilterBar } from '../FilterBar/FilterBar';
import {
    useCandidateFilterUrlParams,
    candidateFilterValuesToRequestData,
} from '../../hooks/useCandidateFilterUrlParams';
import { useCandidates } from '../../modules/candidateHooks';

interface SectionsDashboardFilterBarProps {
    title: string;
}

export const SectionsDashboardFilterBar = ({ title }: SectionsDashboardFilterBarProps) => {
    const { values, setter, clearParams, setSearch } = useCandidateFilterUrlParams();
    const { search } = values;

    const data = useMemo(
        () => ({
            hrIds: values.hrIds,
            sectionTypeIds: values.sectionTypeIds,
            vacancyIds: values.vacancyIds,
            createdAt: values.createdAt,
        }),
        [values],
    );

    const candidatesQuery = useCandidates(candidateFilterValuesToRequestData(data));

    return (
        <FilterBar
            title={title}
            search={search}
            setSearch={setSearch}
            setter={setter}
            values={data}
            clearParams={clearParams}
            total={candidatesQuery.data?.pages[0].total ?? 0}
            count={candidatesQuery.data?.pages[0].count}
        />
    );
};
