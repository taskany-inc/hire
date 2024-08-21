import { FC, ReactNode } from 'react';
import { nullable } from '@taskany/bricks';

import s from './UnavailableContainer.module.css';

interface isUnavailableContaineProps {
    isUnavailable?: boolean;
    link: ReactNode;
    children?: ReactNode;
}

export const UnavailableContainer: FC<isUnavailableContaineProps> = ({ isUnavailable = false, link, children }) => {
    return nullable(
        isUnavailable,
        () => (
            <div className={s.UnavailableContainer}>
                <div className={s.UnavailableContainerVeil}>{link}</div>
                {children}
            </div>
        ),
        children,
    );
};
