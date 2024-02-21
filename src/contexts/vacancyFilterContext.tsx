import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { contextNotInitialized } from '../utils';
import { VacancyStatus } from '../modules/crewTypes';

interface VacancyFilterContext {
    search?: string;
    debouncedSearch?: string;
    setSearch: Dispatch<SetStateAction<string | undefined>>;
    statuses?: VacancyStatus[];
    setStatuses: Dispatch<SetStateAction<VacancyStatus[] | undefined>>;
    hireStreamIds?: string[];
    setHireStreamIds: Dispatch<SetStateAction<string[] | undefined>>;
}

const noContext = contextNotInitialized('Vacancy filter context is not initialized');

const vacancyFilterContext = createContext<VacancyFilterContext>({
    setSearch: noContext,
    setStatuses: noContext,
    setHireStreamIds: noContext,
});

interface VacancyFilterContextProviderProps {
    children: ReactNode;
}

export const VacancyFilterContextProvider = ({ children }: VacancyFilterContextProviderProps) => {
    const [search, setSearch] = useState<string>();
    const [debouncedSearch] = useDebounce(search, 300);
    const [statuses, setStatuses] = useState<VacancyStatus[]>();
    const [hireStreamIds, setHireStreamIds] = useState<string[]>();

    const value: VacancyFilterContext = {
        search,
        debouncedSearch,
        setSearch,
        statuses,
        setStatuses,
        hireStreamIds,
        setHireStreamIds,
    };

    return <vacancyFilterContext.Provider value={value}>{children}</vacancyFilterContext.Provider>;
};

export const useVacancyFilterContext = () => useContext(vacancyFilterContext);
