import { FC, ReactNode } from 'react';
import Head from 'next/head';
import { nullable } from '@taskany/bricks/utils/nullable';
import styled from 'styled-components';
import { useTheme } from 'next-themes';

import { trpc } from '../../utils/trpc-front';
import { TitleMenu } from '../TitleMenu/TitleMenu';
import { OfflineBanner } from '../OfflineBanner';
import { Theme } from '../Theme';
import { DropdownMenuItem } from '../TagFilterDropdown';
import { PageHeader } from '../header/PageHeader';
import { PageFooter } from '../footer/PageFooter';

import { PageTitle } from './PageTitle';
import { GlobalStyle } from './GlobalStyle';

type LayoutMainProps = {
    pageTitle: string | null;
    aboveContainer?: JSX.Element;
    headerGutter?: string;
    titleMenuItems?: DropdownMenuItem[];
    backlink?: string;
    hidePageHeader?: boolean;
    children?: ReactNode;
};

const StyledContainer = styled.div`
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

    const { resolvedTheme } = useTheme();
    const theme = (
        userSettings.data?.theme === 'system' ? resolvedTheme || 'dark' : userSettings.data?.theme || 'light'
    ) as 'dark' | 'light';

    const title = pageTitle ? `${pageTitle} - Taskany Hire` : 'Taskany Hire';

    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>

            <OfflineBanner />

            <GlobalStyle />

            <PageHeader />
            {nullable(theme, (t) => (
                <Theme theme={t} />
            ))}

            {!hidePageHeader && (
                <PageTitle title={pageTitle} gutter={headerGutter} backlink={backlink}>
                    {titleMenuItems && titleMenuItems.length > 0 && <TitleMenu items={titleMenuItems} />}
                </PageTitle>
            )}

            {aboveContainer}

            <StyledContainer>{children}</StyledContainer>

            <PageFooter />
        </>
    );
};
