import { FC, ReactNode } from 'react';
import styled from 'styled-components';
import { backgroundColor } from '@taskany/colors';
import { Text, Link } from '@taskany/bricks';

type PageTitleProps = {
    title: string;
    gutter?: string;
    backlink?: string;
    children?: ReactNode;
};

const StyledContainer = styled.div<{ gutter: string }>`
    padding: 0 40px;
    margin-bottom: ${({ gutter }) => gutter};
    background-color: ${backgroundColor};
`;

const StyledTitle = styled(Text)`
    display: inline-block;
    margin-top: 20px;
`;

export const PageTitle: FC<PageTitleProps> = ({ title, gutter = '30px', backlink, children }) => {
    return (
        <StyledContainer gutter={gutter}>
            <StyledTitle size="xxl" weight="bolder">
                {backlink ? (
                    <Link inline href={backlink}>
                        {title}
                    </Link>
                ) : (
                    title
                )}
            </StyledTitle>
            {children}
        </StyledContainer>
    );
};
