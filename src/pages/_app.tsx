import { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import '@taskany/bricks/harmony/style.css';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SnackbarProvider } from 'notistack';
import NextNProgress from 'nextjs-progressbar';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { FC, useEffect } from 'react';
import * as SentryNextJs from '@sentry/nextjs';
import * as SentryBrowser from '@sentry/browser';
import { link0 } from '@taskany/colors';

import { AppSettingsContextProvider } from '../contexts/appSettingsContext';
import { Browser } from '../utils';
import { trpc } from '../trpc/trpcClient';
import { TLocale, setSSRLocale } from '../utils/getLang';
import '../../react-big-calendar.css';
import { PreviewContextProvider } from '../contexts/previewContext';
import { Previews } from '../components/Previews/Previews';

import Error, { ErrorProps } from './_error';

import '@taskany/icons/style.css';

interface TaskanyHireAppProps {
    session: Session;
    browser: Browser;
    error?: ErrorProps;
}

const TaskanyHireApp: FC<AppProps<TaskanyHireAppProps>> = ({ Component, pageProps, router }) => {
    setSSRLocale(router.locale as TLocale);
    const { session, browser, error, ...restPageProps } = pageProps;

    useEffect(() => {
        SentryBrowser.setUser({
            id: String(session?.user?.id),
            email: session?.user?.email || undefined,
            username: String(session?.user?.name),
        });
    }, [session]);

    return (
        <>
            <NextNProgress color={link0} options={{ showSpinner: false }} />

            <SentryNextJs.ErrorBoundary fallback={<p>An error has occurred</p>}>
                <SnackbarProvider
                    maxSnack={5}
                    hideIconVariant
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <SessionProvider session={session} refetchOnWindowFocus>
                        <AppSettingsContextProvider session={session} browserServerSide={browser}>
                            <ThemeProvider themes={['light', 'dark']}>
                                {error ? (
                                    <Error {...error} />
                                ) : (
                                    <PreviewContextProvider>
                                        <Component {...restPageProps} />
                                        <Previews />
                                        <ReactQueryDevtools />
                                    </PreviewContextProvider>
                                )}
                            </ThemeProvider>
                        </AppSettingsContextProvider>
                    </SessionProvider>
                </SnackbarProvider>
            </SentryNextJs.ErrorBoundary>
        </>
    );
};

export default trpc.withTRPC(TaskanyHireApp);
