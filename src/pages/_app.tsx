import { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SnackbarProvider } from 'notistack';
import NextNProgress from 'nextjs-progressbar';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { FC, useEffect } from 'react';
import * as SentryNextJs from '@sentry/nextjs';
import * as SentryBrowser from '@sentry/browser';
import { link0 } from '@taskany/colors';

import { AppSettingsContextProvider } from '../contexts/app-settings-context';
import { ProblemFilterContextProvider } from '../contexts/problem-filter-context';
import { CandidateFilterContextProvider } from '../contexts/candidate-filter-context';
import { Browser } from '../utils';
import { trpc } from '../utils/trpc-front';
import { ErrorProps } from 'next/error';

type TaskanyHireAppProps = {
    session: Session;
    browser: Browser;
    error?: ErrorProps;
};

const TaskanyHireApp: FC<AppProps<TaskanyHireAppProps>> = ({ Component, pageProps }) => {
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

            <Head>
                <link rel="icon" href="/favicon.png" />
            </Head>

            <SentryNextJs.ErrorBoundary fallback={<p>An error has occurred</p>}>
                <SnackbarProvider
                    maxSnack={5}
                    hideIconVariant
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <SessionProvider session={session} refetchOnWindowFocus>
                        <AppSettingsContextProvider session={session} browserServerSide={browser}>
                            <ThemeProvider themes={['light', 'dark']}>
                                <ProblemFilterContextProvider>
                                    <CandidateFilterContextProvider>
                                        <Component {...pageProps} />
                                        <ReactQueryDevtools />
                                    </CandidateFilterContextProvider>
                                </ProblemFilterContextProvider>
                            </ThemeProvider>
                        </AppSettingsContextProvider>
                    </SessionProvider>
                </SnackbarProvider>
            </SentryNextJs.ErrorBoundary>
        </>
    );
};

export default trpc.withTRPC(TaskanyHireApp);
