import React, { FC, ReactNode } from 'react';
import { Text } from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

import { PropsWithClassName } from '../../utils/types';
import { TitleMenuItem, TitleMenu } from '../TitleMenu/TitleMenu';

import s from './CardHeader.module.css';

type CardHeaderProps = PropsWithClassName<{
    title: ReactNode;
    subTitle?: ReactNode;
    chips?: ReactNode;
    menu?: TitleMenuItem[];
}>;

export const CardHeader: FC<CardHeaderProps> = ({ title, subTitle, chips, menu, className }) => {
    return (
        <div className={className}>
            <div className={s.TitleWrapper}>
                <Text className={s.TitleWrapper} size="l" weight="semiBold">
                    {title}
                </Text>
                {nullable(chips, (c) => c)}

                {nullable(menu, (m) => (
                    <TitleMenu items={m} />
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
