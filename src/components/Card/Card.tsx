import { FC, ReactNode } from 'react';
import cn from 'classnames';

import { PropsWithClassName } from '../../utils/types';

import s from './Card.module.css';

type CardProps = PropsWithClassName<{
    children?: ReactNode;
}>;

export const Card: FC<CardProps> = ({ className, children }) => {
    return (
        <div className={cn(s.Card, className)}>
            <div>{children}</div>
        </div>
    );
};
