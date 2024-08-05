import { FC, ReactNode } from 'react';

import s from './UnavailableContainer.module.css';

interface isUnavailableContaineProps {
    isUnavailable?: boolean;
    link: ReactNode;
    children?: ReactNode;
}

export const UnavailableContainer: FC<isUnavailableContaineProps> = ({ isUnavailable = false, link, children }) => {
    return (
        <div className={s.UnavailableContainer}>
            {isUnavailable && <div className={s.UnavailableContainerVeil}>{link}</div>}
            {children}
        </div>
    );
};
