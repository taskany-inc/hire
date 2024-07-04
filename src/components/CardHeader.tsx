import { ReactNode, VFC } from 'react';
import styled from 'styled-components';
import { Text } from '@taskany/bricks';

import { PropsWithClassName } from '../utils/types';

import { DropdownMenuItem } from './TagFilterDropdown';
import { Link } from './Link';
import { TitleMenu } from './TitleMenu/TitleMenu';

const StyledTitleRow = styled.div`
    display: flex;
    align-items: baseline;
    gap: 22px;
`;

const StyledTitle = styled(Text)`
    line-height: 40px;
`;

const StyledChips = styled.div`
    transform: translateY(-5px);
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

type CardHeaderProps = PropsWithClassName<{
    title: string;
    link?: string;
    subTitle?: ReactNode;
    chips?: ReactNode;
    menu?: DropdownMenuItem[];
}>;

export const CardHeader: VFC<CardHeaderProps> = ({ title, link, subTitle, chips, menu, className }) => {
    return (
        <div className={className}>
            <StyledTitleRow>
                <StyledTitle size="xl" weight="bold">
                    {link ? <Link href={link}>{title}</Link> : title}
                    {menu && <TitleMenu items={menu} />}
                </StyledTitle>
                {chips && <StyledChips>{chips}</StyledChips>}
            </StyledTitleRow>
            {subTitle && (
                <Text size="s" color="textSecondary">
                    {subTitle}
                </Text>
            )}
        </div>
    );
};
