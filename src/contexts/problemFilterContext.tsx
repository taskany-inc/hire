import React, {
    FC,
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useCallback,
    useContext,
    useState,
} from 'react';
import { ProblemDifficulty } from '@prisma/client';
import { useDebounce } from 'use-debounce';

import { noop } from '../utils';

type ProblemFilterContext = {
    search?: string;
    debouncedSearch?: string;
    setSearch: Dispatch<SetStateAction<string | undefined>>;
    difficulty?: ProblemDifficulty[];
    setDifficulty: Dispatch<SetStateAction<ProblemDifficulty[] | undefined>>;
    tagIds: number[];
    authorIds: number[];
    setTagIds: Dispatch<SetStateAction<number[]>>;
    setAuthorIds: Dispatch<SetStateAction<number[]>>;
    clearFilters: VoidFunction;
    tagFilter: string[];
    authorFilter: string[];
    setTagFitlter: Dispatch<SetStateAction<string[]>>;
    setAuthorFitlter: Dispatch<SetStateAction<string[]>>;
};

const problemFilterContext = createContext<ProblemFilterContext>({
    setSearch: noop,
    setDifficulty: noop,
    tagIds: [],
    authorIds: [],
    setTagIds: noop,
    setAuthorIds: noop,
    clearFilters: noop,
    tagFilter: [],
    authorFilter: [],
    setTagFitlter: noop,
    setAuthorFitlter: noop,
});

export const ProblemFilterContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [search, setSearch] = useState<string>();
    const [debouncedSearch] = useDebounce(search, 300);

    const [difficulty, setDifficulty] = useState<ProblemDifficulty[]>();
    const [tagIds, setTagIds] = useState<number[]>([]);
    const [authorIds, setAuthorIds] = useState<number[]>([]);

    const [tagFilter, setTagFitlter] = useState<string[]>(tagIds.map((id) => String(id)));
    const [authorFilter, setAuthorFitlter] = useState<string[]>(authorIds.map((id) => String(id)));
    const clearFilters = useCallback(() => {
        setSearch(undefined);
        setDifficulty(undefined);
        setTagIds([]);
        setAuthorIds([]);
    }, []);

    const value: ProblemFilterContext = {
        search,
        debouncedSearch,
        setSearch,
        difficulty,
        setDifficulty,
        tagIds,
        authorIds,
        setAuthorIds,
        setTagIds,
        clearFilters,
        tagFilter,
        setTagFitlter,
        authorFilter,
        setAuthorFitlter,
    };

    return <problemFilterContext.Provider value={value}>{children}</problemFilterContext.Provider>;
};

export const useProblemFilterContext = () => useContext(problemFilterContext);
