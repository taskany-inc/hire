import { FC, ReactNode, useEffect } from 'react';
import Head from 'next/head';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import { nullable } from '@taskany/bricks';

import { trpc } from '../../trpc/trpcClient';
import { OfflineBanner } from '../OfflineBanner/OfflineBanner';
import { Theme } from '../Theme';
import { TitleMenuItem, TitleMenu } from '../TitleMenu/TitleMenu';
import { HeaderLoader } from '../HeaderLoader/HeaderLoader';
import { PageHeader } from '../PageHeader/PageHeader';
import { PageFooter } from '../PageFooter/PageFooter';
import { GlobalStyle } from '../GlobalStyle';
import { WhatsNew } from '../WhatsNew/WhatsNew';
import { PageNavigation } from '../PageNavigation/PageNavigation';
import { PageTitle } from '../PageTitle/PageTitle';

import s from './LayoutMain.module.css';

interface LayoutMainProps {
    pageTitle: string;
    aboveContainer?: JSX.Element;
    headerGutter?: string;
    titleMenuItems?: TitleMenuItem[];
    loading?: boolean;
    backlink?: string;
    children?: ReactNode;
    filterBar?: ReactNode;
}

export const LayoutMain: FC<LayoutMainProps> = ({
    pageTitle,
    aboveContainer,
    titleMenuItems,
    backlink,
    children,
    filterBar,
    loading,
}) => {
    const { data: userSettings } = trpc.users.getSettings.useQuery();
    const config = trpc.appConfig.get.useQuery(undefined, {
        staleTime: Infinity,
    });
    const title = pageTitle ? `${pageTitle} - Taskany Hire` : 'Taskany Hire';

    const { resolvedTheme } = useTheme();
    const theme = (userSettings?.theme === 'system' ? resolvedTheme || 'dark' : userSettings?.theme || 'light') as
        | 'dark'
        | 'light';
    const router = useRouter();

    useEffect(() => {
        const { asPath, locale, replace } = router;

        if (userSettings?.locale && locale !== userSettings.locale) {
            replace(asPath, asPath, { locale: userSettings.locale });
        }
    }, [router, userSettings]);

    return (
        <>
            <Head>
                <title>{title}</title>
                <link rel="icon" href={config.data?.favicon ?? '/favicon.png'} />
                <link rel="stylesheet" id="themeVariables" href={`/theme/${theme}.css`} />
            </Head>

            <OfflineBanner />

            <GlobalStyle />

            <Theme theme={theme} />

            <div className={s.LayoutMain}>
                <aside className={s.PageAside}>
                    <PageNavigation />
                </aside>

                <main className={s.Main}>
                    {nullable(
                        filterBar,
                        (f) => f,
                        <PageHeader>
                            <PageTitle backlink={backlink}>{pageTitle}</PageTitle>
                            {filterBar}
                            {nullable(titleMenuItems, (i) => (
                                <TitleMenu items={i} />
                            ))}
                            {nullable(loading, () => (
                                <HeaderLoader />
                            ))}
                        </PageHeader>,
                    )}
                    <div className={s.LayoutMainContent}>
                        {aboveContainer}
                        {children}
                    </div>
                    <PageFooter />
                    <WhatsNew />
                </main>
            </div>
        </>
    );
};
