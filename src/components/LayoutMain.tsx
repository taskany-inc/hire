import { FC, ReactNode } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTheme } from 'next-themes';

import { trpc } from '../trpc/trpcClient';

import { TitleMenu } from './TitleMenu';
import { OfflineBanner } from './OfflineBanner/OfflineBanner';
import { Theme } from './Theme';
import { DropdownMenuItem } from './TagFilterDropdown';
import { PageHeader } from './PageHeader/PageHeader';
import { PageFooter } from './PageFooter/PageFooter';
import { PageTitle } from './PageTitle';
import { GlobalStyle } from './GlobalStyle';

type LayoutMainProps = {
    pageTitle: string;
    aboveContainer?: JSX.Element;
    headerGutter?: string;
    titleMenuItems?: DropdownMenuItem[];
    backlink?: string;
    hidePageHeader?: boolean;
    children?: ReactNode;
};

const StyledContainer = styled.div`
    padding-left: 40px;
`;

const StyledContent = styled.main`
    /* presses the footer to the bottom*/
    min-height: calc(100vh - 160px);
`;

export const LayoutMain: FC<LayoutMainProps> = ({
    pageTitle,
    aboveContainer,
    headerGutter,
    titleMenuItems,
    backlink,
    hidePageHeader,
    children,
}) => {
    const userSettings = trpc.users.getSettings.useQuery();
    const title = pageTitle ? `${pageTitle} - Taskany Hire` : 'Taskany Hire';

    const { resolvedTheme } = useTheme();
    const theme = (
        userSettings.data?.theme === 'system' ? resolvedTheme || 'dark' : userSettings.data?.theme || 'light'
    ) as 'dark' | 'light';

    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>

            <OfflineBanner />

            <GlobalStyle />

            <PageHeader />
            <Theme theme={theme} />
            <StyledContent>
                {!hidePageHeader && (
                    <PageTitle title={pageTitle} gutter={headerGutter} backlink={backlink}>
                        {titleMenuItems && titleMenuItems.length > 0 && <TitleMenu items={titleMenuItems} />}
                    </PageTitle>
                )}

                {aboveContainer}

                <StyledContainer>{children}</StyledContainer>
            </StyledContent>

            <PageFooter />
        </>
    );
};
