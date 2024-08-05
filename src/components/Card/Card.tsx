import { FC, ReactNode } from 'react';
import cn from 'classnames';

import { PropsWithClassName } from '../../utils/types';

import s from './Card.module.css';

type CardProps = PropsWithClassName<{
    action?: ReactNode;
    children?: ReactNode;
}>;

export const Card: FC<CardProps> = ({ action, className, children }) => {
    return (
        <div className={cn(s.Card, className)}>
            <div style={{ marginTop: 8 }}>{action}</div>
            <div>{children}</div>
        </div>
    );
};
