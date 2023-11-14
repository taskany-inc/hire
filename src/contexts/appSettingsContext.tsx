import { Session } from 'next-auth';
import { ReactNode, useState, useEffect, useContext, FC, createContext, useMemo } from 'react';

import { Browser } from '../utils';

type AppSettingsContext = {
    session: Session | null;
    browser: Browser;
};

const appSettingsContext = createContext<AppSettingsContext>({
    session: null,
    browser: undefined,
});

type AppSettingsContextProviderProps = {
    session: Session;
    browserServerSide?: Browser;
    children: ReactNode;
};

export const AppSettingsContextProvider: FC<AppSettingsContextProviderProps> = ({
    session,
    browserServerSide,
    children,
}) => {
    const [browser, setBrowser] = useState<Browser>(browserServerSide);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        if (navigator.vendor.match(/apple/i)) {
            setBrowser('safari');
        }
    }, []);

    const value = useMemo<AppSettingsContext>(
        () => ({
            session,
            browser,
        }),
        [session, browser],
    );

    return <appSettingsContext.Provider value={value}>{children}</appSettingsContext.Provider>;
};

export const useAppSettingsContext = (): AppSettingsContext => useContext(appSettingsContext);

export const useSession = (): Session | null => {
    return useAppSettingsContext().session;
};
