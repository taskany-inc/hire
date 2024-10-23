import { createContext, FC, ReactNode, useContext } from 'react';

export interface FiltersContext {
    defaultFilterFallback?: boolean;
    hireStreamId?: number;
}

const filtersContext = createContext<FiltersContext>({});

export const useFiltersContext = () => useContext(filtersContext);

export const FiltersContextProvider: FC<{ children?: ReactNode; value?: FiltersContext }> = ({
    children,
    value = {},
}) => <filtersContext.Provider value={value}>{children}</filtersContext.Provider>;
