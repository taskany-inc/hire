import React, { FC, ReactNode } from 'react';
import { Text } from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

import { PropsWithClassName } from '../../utils/types';
import { DropdownMenuItem } from '../TagFilterDropdown';
import { TitleMenu } from '../TitleMenu/TitleMenu';

import s from './CardHeader.module.css';

type CardHeaderProps = PropsWithClassName<{
    title: ReactNode;
    subTitle?: ReactNode;
    chips?: ReactNode;
    menu?: DropdownMenuItem[];
}>;

export const CardHeader: FC<CardHeaderProps> = ({ title, subTitle, chips, menu, className }) => {
    return (
        <div className={className}>
            <Text size="l" weight="bold">
                <div className={s.TitleWrapper}>
                    {title}
                    {nullable(menu, (m) => (
                        <TitleMenu items={m} />
                    ))}
                    {nullable(chips, (c) => c)}
                </div>
            </Text>
            {nullable(subTitle, () => (
                <Text className={s.SubTitle} size="s">
                    {subTitle}
                </Text>
            ))}
        </div>
    );
};
