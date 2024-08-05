import { ReactNode, VFC } from 'react';
import { Text } from '@taskany/bricks';

import { PropsWithClassName } from '../../utils/types';
import { DropdownMenuItem } from '../TagFilterDropdown';
import { Link } from '../Link';
import { TitleMenu } from '../TitleMenu/TitleMenu';

import s from './CardHeader.module.css';

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
            <div className={s.CardHeaderTitleRow}>
                <Text size="xl" weight="bold" className={s.CardHeaderTitle}>
                    {link ? <Link href={link}>{title}</Link> : title}
                    {menu && <TitleMenu items={menu} />}
                </Text>
                {chips && <div className={s.CardHeaderChips}>{chips}</div>}
            </div>
            {subTitle && (
                <Text size="s" color="textSecondary">
                    {subTitle}
                </Text>
            )}
        </div>
    );
};
