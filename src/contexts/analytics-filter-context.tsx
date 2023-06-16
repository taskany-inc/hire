import { HireStream } from '@prisma/client';
import {
    ReactNode,
    createContext,
    Dispatch,
    FC,
    SetStateAction,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';

import { noop } from '../utils';

const YEAR = 1000 * 60 * 60 * 24 * 365;
const QUARTER = 1000 * 60 * 60 * 24 * 30 * 3;
const MONTH = 1000 * 60 * 60 * 24 * 30;
const WEEK = 1000 * 60 * 60 * 24 * 7;

type AnalyticsFilterContext = {
    clearFilters: VoidFunction;
    setHireStreams: Dispatch<SetStateAction<HireStream[]>>;
    hireStreams: HireStream[];
    addHireStream: (status: HireStream) => void;
    removeHireStream: (status: HireStream) => void;
    startDate: Date;
    endDate: Date;
    setStartDate: Dispatch<SetStateAction<Date>>;
    setEndDate: Dispatch<SetStateAction<Date>>;
    setYear: () => void;
    setQuarter: () => void;
    setMonth: () => void;
    setWeek: () => void;
    periodTitle: string;
    setPeriodTitle: Dispatch<SetStateAction<string>>;
};

const analyticsFilterContext = createContext<AnalyticsFilterContext>({
    clearFilters: noop,
    hireStreams: [],
    setHireStreams: noop,
    addHireStream: noop,
    removeHireStream: noop,
    endDate: new Date(Date.now()),
    startDate: new Date(Date.now() - YEAR),
    setStartDate: noop,
    setEndDate: noop,
    setYear: noop,
    setQuarter: noop,
    setMonth: noop,
    setWeek: noop,
    periodTitle: '',
    setPeriodTitle: noop,
});

export const AnalyticsFilterContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [hireStreams, setHireStreams] = useState<HireStream[]>([]);

    const [periodTitle, setPeriodTitle] = useState('Year');

    const [endDate, setEndDate] = useState<Date>(new Date(Date.now()));
    const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - YEAR));

    const setYear = useCallback(() => {
        setEndDate(new Date(Date.now()));
        setStartDate(new Date(Date.now() - YEAR));
        setPeriodTitle('Year');
    }, [setStartDate, setPeriodTitle]);

    const setQuarter = useCallback(() => {
        setEndDate(new Date(Date.now()));
        setStartDate(new Date(Date.now() - QUARTER));
        setPeriodTitle('Quarter');
    }, [setStartDate, setPeriodTitle]);

    const setMonth = useCallback(() => {
        setEndDate(new Date(Date.now()));
        setStartDate(new Date(Date.now() - MONTH));
        setPeriodTitle('Month');
    }, [setStartDate, setPeriodTitle]);

    const setWeek = useCallback(() => {
        setEndDate(new Date(Date.now()));
        setStartDate(new Date(Date.now() - WEEK));
        setPeriodTitle('Week');
    }, [setStartDate, setPeriodTitle]);

    const clearFilters = useCallback(() => {
        setHireStreams([]);
    }, []);

    const addHireStream = useCallback(
        (hireStream: HireStream) =>
            setHireStreams((prev) => (prev.some((value) => value.id === hireStream.id) ? prev : [...prev, hireStream])),
        [],
    );

    const removeHireStream = useCallback(
        (hireStream: HireStream) => setHireStreams((prev) => prev.filter((value) => value.id !== hireStream.id)),
        [],
    );

    const value: AnalyticsFilterContext = useMemo(
        () => ({
            clearFilters,
            setHireStreams,
            hireStreams,
            addHireStream,
            removeHireStream,
            startDate,
            endDate,
            setStartDate,
            setEndDate,
            setYear,
            setQuarter,
            setMonth,
            setWeek,
            periodTitle,
            setPeriodTitle,
        }),
        [
            clearFilters,
            setHireStreams,
            hireStreams,
            addHireStream,
            removeHireStream,
            startDate,
            endDate,
            setStartDate,
            setEndDate,
            setYear,
            setQuarter,
            setMonth,
            setWeek,
            periodTitle,
            setPeriodTitle,
        ],
    );

    return <analyticsFilterContext.Provider value={value}>{children}</analyticsFilterContext.Provider>;
};

export const useAnalyticsFilterContext = () => useContext(analyticsFilterContext);
