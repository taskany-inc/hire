import { InterviewStatus } from '@prisma/client';
import React, {
    createContext,
    Dispatch,
    FC,
    ReactNode,
    SetStateAction,
    useCallback,
    useContext,
    useState,
} from 'react';
import { useDebounce } from 'use-debounce';
import { useRouter } from 'next/router';

import { noop } from '../utils';

type CandidateFilterContext = {
    search?: string;
    debouncedSearch?: string;
    setSearch: Dispatch<SetStateAction<string | undefined>>;
    statuses: InterviewStatus[];
    setStatuses: Dispatch<SetStateAction<InterviewStatus[]>>;
    clearFilters: VoidFunction;
    setHireStreamFilter: Dispatch<SetStateAction<string[]>>;
    hireStreamFilter: string[];
    hrIds: number[];
    setHrIds: Dispatch<SetStateAction<number[]>>;
    hrFilter: string[];
    setHrFitlter: Dispatch<SetStateAction<string[]>>;
    total: number;
    setTotal: Dispatch<SetStateAction<number>>;
    count: number;
    setCount: Dispatch<SetStateAction<number>>;
    hireStreamIds: number[];
    setHireStreamIds: Dispatch<SetStateAction<number[]>>;
    vacancyIds: string[];
    setVacancyIds: Dispatch<SetStateAction<string[]>>;
};

const candidateFilterContext = createContext<CandidateFilterContext>({
    setSearch: noop,
    statuses: [],
    setStatuses: noop,
    clearFilters: noop,
    hireStreamFilter: [],
    setHireStreamFilter: noop,
    hrIds: [],
    setHrIds: noop,
    hrFilter: [],
    setHrFitlter: noop,
    total: 0,
    setTotal: noop,
    count: 0,
    setCount: noop,
    hireStreamIds: [],
    setHireStreamIds: noop,
    vacancyIds: [],
    setVacancyIds: noop,
});

export const CandidateFilterContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const router = useRouter();

    const [search, setSearch] = useState<string>();
    const [debouncedSearch] = useDebounce(search, 300);
    const [statuses, setStatuses] = useState<InterviewStatus[]>([]);

    const [hireStreamIds, setHireStreamIds] = useState<number[]>([]);
    const [hireStreamFilter, setHireStreamFilter] = useState<string[]>(hireStreamIds.map((id) => String(id)));

    const [hrIds, setHrIds] = useState<number[]>([]);

    const [total, setTotal] = useState<number>(0);
    const [count, setCount] = useState<number>(0);

    const [hrFilter, setHrFitlter] = useState<string[]>(hrIds.map((id) => String(id)));

    const [vacancyIds, setVacancyIds] = useState<string[]>(() => {
        const vacancyIdParam = router.query.vacancyId;
        return vacancyIdParam ? [String(vacancyIdParam)] : [];
    });

    const clearFilters = useCallback(() => {
        setSearch(undefined);
        setStatuses([]);
        setHireStreamIds([]);
        setHrIds([]);
        setVacancyIds([]);
    }, []);

    const value: CandidateFilterContext = {
        search,
        debouncedSearch,
        setSearch,
        statuses,
        setStatuses,
        clearFilters,
        setHireStreamFilter,
        hireStreamFilter,
        hrIds,
        setHrIds,
        hrFilter,
        setHrFitlter,
        total,
        setTotal,
        count,
        setCount,
        hireStreamIds,
        setHireStreamIds,
        vacancyIds,
        setVacancyIds,
    };

    return <candidateFilterContext.Provider value={value}>{children}</candidateFilterContext.Provider>;
};

export const useCandidateFilterContext = () => useContext(candidateFilterContext);
