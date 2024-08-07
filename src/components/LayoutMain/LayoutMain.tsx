import { FC, ReactNode, useEffect } from 'react';
import Head from 'next/head';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';

import { trpc } from '../../trpc/trpcClient';
import { OfflineBanner } from '../OfflineBanner/OfflineBanner';
import { Theme } from '../Theme';
import { DropdownMenuItem } from '../TagFilterDropdown';
import { PageHeader } from '../PageHeader/PageHeader';
import { PageFooter } from '../PageFooter/PageFooter';
import { PageTitle } from '../PageTitle/PageTitle';
import { GlobalStyle } from '../GlobalStyle';
import { TitleMenu } from '../TitleMenu/TitleMenu';
import { WhatsNew } from '../WhatsNew/WhatsNew';
import { PageNavigation } from '../PageNavigation/PageNavigation';

import s from './LayoutMain.module.css';

interface LayoutMainProps {
    pageTitle: string;
    aboveContainer?: JSX.Element;
    headerGutter?: string;
    titleMenuItems?: DropdownMenuItem[];
    backlink?: string;
    children?: ReactNode;
}

export const LayoutMain: FC<LayoutMainProps> = ({
    pageTitle,
    aboveContainer,
    headerGutter,
    titleMenuItems,
    backlink,
    children,
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
                <PageNavigation userSettings={userSettings} />
                <main className={s.Main}>
                    <PageHeader userSettings={userSettings} />

                    <PageTitle title={pageTitle} gutter={headerGutter} backlink={backlink}>
                        {titleMenuItems && titleMenuItems.length > 0 && <TitleMenu items={titleMenuItems} />}
                    </PageTitle>

                    {aboveContainer}

                    <div className={s.LayoutMainContent}>{children}</div>

                    <PageFooter />
                    <WhatsNew />
                </main>
            </div>
        </>
    );
};
