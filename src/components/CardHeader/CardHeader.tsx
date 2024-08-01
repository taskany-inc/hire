import React, { FC, ReactNode } from 'react';
import { Text } from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

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

export const CardHeader: FC<CardHeaderProps> = ({ title, link, subTitle, chips, menu, className }) => {
    return (
        <div className={className}>
            <div className={s.TitleWrapper}>
                <Text size="xl" weight="bold" className={s.Title}>
                    {nullable(
                        link,
                        () => (
                            <Link href={link}>{title}</Link>
                        ),
                        title,
                    )}
                </Text>
                {nullable(menu, (m) => (
                    <TitleMenu items={m} />
                ))}
                {nullable(chips, (c) => (
                    <div className={s.ChipsWrapper}>{c}</div>
                ))}
            </div>
            {nullable(subTitle, () => (
                <Text className={s.SubTitle} size="s">
                    {subTitle}
                </Text>
            ))}
        </div>
    );
};
