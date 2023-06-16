import { HireStream, InterviewStatus } from '@prisma/client';
import React, { createContext, Dispatch, FC, ReactNode, SetStateAction, useCallback, useContext, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { noop } from '../utils';

type CandidateFilterContext = {
    search?: string;
    debouncedSearch?: string;
    setSearch: Dispatch<SetStateAction<string | undefined>>;
    statuses: InterviewStatus[];
    setStatuses: Dispatch<SetStateAction<InterviewStatus[]>>;
    clearFilters: VoidFunction;
    setHireStreams: Dispatch<SetStateAction<HireStream[]>>;
    hireStreams: HireStream[];
};

const candidateFilterContext = createContext<CandidateFilterContext>({
    setSearch: noop,
    statuses: [],
    setStatuses: noop,
    clearFilters: noop,
    hireStreams: [],
    setHireStreams: noop,
});

export const CandidateFilterContextProvider: FC<{children: ReactNode}> = ({ children }) => {
    const [search, setSearch] = useState<string>();
    const [debouncedSearch] = useDebounce(search, 300);
    const [statuses, setStatuses] = useState<InterviewStatus[]>([]);
    const [hireStreams, setHireStreams] = useState<HireStream[]>([]);

    const clearFilters = useCallback(() => {
        setSearch(undefined);
        setStatuses([]);
        setHireStreams([]);
    }, []);

    const value: CandidateFilterContext = {
        search,
        debouncedSearch,
        setSearch,
        statuses,
        setStatuses,
        clearFilters,
        setHireStreams,
        hireStreams,
    };

    return <candidateFilterContext.Provider value={value}>{children}</candidateFilterContext.Provider>;
};

export const useCandidateFilterContext = () => useContext(candidateFilterContext);
