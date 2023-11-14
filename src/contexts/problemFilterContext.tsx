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
import { ProblemDifficulty, User } from '@prisma/client';
import { useDebounce } from 'use-debounce';

import { noop } from '../utils';

type ProblemFilterContext = {
    search?: string;
    debouncedSearch?: string;
    setSearch: Dispatch<SetStateAction<string | undefined>>;
    difficulty?: ProblemDifficulty;
    setDifficulty: Dispatch<SetStateAction<ProblemDifficulty | undefined>>;
    tagIds: number[];
    author: User | null;
    setTagIds: Dispatch<SetStateAction<number[]>>;
    setAuthor: Dispatch<SetStateAction<User | null>>;
    clearFilters: VoidFunction;
};

const problemFilterContext = createContext<ProblemFilterContext>({
    setSearch: noop,
    setDifficulty: noop,
    tagIds: [],
    author: null,
    setTagIds: noop,
    setAuthor: noop,
    clearFilters: noop,
});

export const ProblemFilterContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [search, setSearch] = useState<string>();
    const [debouncedSearch] = useDebounce(search, 300);

    const [difficulty, setDifficulty] = useState<ProblemDifficulty>();
    const [tagIds, setTagIds] = useState<number[]>([]);
    const [author, setAuthor] = useState<User | null>(null);

    const clearFilters = useCallback(() => {
        setSearch(undefined);
        setDifficulty(undefined);
        setTagIds([]);
        setAuthor(null);
    }, []);

    const value: ProblemFilterContext = {
        search,
        debouncedSearch,
        setSearch,
        difficulty,
        setDifficulty,
        tagIds,
        author,
        setAuthor,
        setTagIds,
        clearFilters,
    };

    return <problemFilterContext.Provider value={value}>{children}</problemFilterContext.Provider>;
};

export const useProblemFilterContext = () => useContext(problemFilterContext);
