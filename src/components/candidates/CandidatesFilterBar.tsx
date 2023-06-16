import React from 'react';
import { HireStream, InterviewStatus } from '@prisma/client';

import { useCandidateFilterContext } from '../../contexts/candidate-filter-context';
import { useCandidates } from '../../hooks/candidate-hooks';
import { useSession } from '../../contexts/app-settings-context';
import { accessChecks } from '../../backend/access/access-checks';
import { FiltersPanel } from '../FiltersPanel';
import { mapEnum } from '../../utils';
import { candidateStatus } from '../../utils/dictionaries';
import { FilterBarAddButton } from '../FilterBarAddButton';
import { Paths } from '../../utils/paths';

type CandidatesFilterBarProps = {
    hireStreams: HireStream[];
};

export const CandidatesFilterBar = ({ hireStreams }: CandidatesFilterBarProps): JSX.Element => {
    const session = useSession();
    const {
        clearFilters,
        setSearch,
        debouncedSearch,
        statuses,
        hireStreams: selectedHireStreams,
        setHireStreams,
        setStatuses,
    } = useCandidateFilterContext();
    const selectedHireStreamIds = selectedHireStreams.map((hireStream) => hireStream.id);
    const candidatesQuery = useCandidates({ search: debouncedSearch, statuses, hireStreamIds: selectedHireStreamIds });

    const canCreateCandidate = session && accessChecks.candidate.create(session).allowed;

    const allStatuses = mapEnum(InterviewStatus, (value) => value).filter((item) =>
        Object.keys(candidateStatus).some((it) => it === item),
    );

    return (
        <FiltersPanel
            onClearFilters={clearFilters}
            onSearchChange={(e) => setSearch(e.target.value)}
            count={candidatesQuery.data?.pages[0].total}
            streams={hireStreams}
            streamFilter={selectedHireStreams}
            onStreamChange={setHireStreams}
            statuses={allStatuses}
            statusFilter={statuses}
            onStatusChange={setStatuses}
        >
            {canCreateCandidate && <FilterBarAddButton link={Paths.CANDIDATES_NEW} text="Add candidate" />}
        </FiltersPanel>
    );
};
