import { FC, ReactNode } from 'react';
import Head from 'next/head';
import { nullable } from '@taskany/bricks/utils/nullable';
import styled from 'styled-components';

import { TitleMenu } from '../TitleMenu/TitleMenu';
import { OfflineBanner } from '../OfflineBanner';
import { Theme } from '../Theme';
import { DropdownMenuItem } from '../TagFilterDropdown';
import { PageHeader } from '../header/PageHeader';
import { PageFooter } from '../footer/PageFooter';

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

export const LayoutMain: FC<LayoutMainProps> = ({
    pageTitle,
    aboveContainer,
    headerGutter,
    titleMenuItems,
    backlink,
    hidePageHeader,
    children,
}) => {
    const theme: 'dark' | 'light' = 'dark';

    const title = `${pageTitle} - Taskany Hire`;

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
