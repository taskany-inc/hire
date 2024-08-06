import React, { FC } from 'react';

import { Spinner } from '../Spinner';

import s from './LoadingContainer.module.css';

export const LoadingContainer: FC<{ isSpinnerVisible: boolean; children: React.ReactNode }> = ({
    isSpinnerVisible,
    children,
}) => {
    return (
        <div className={s.Container}>
            {isSpinnerVisible && (
                <div className={s.LoadingContainer}>
                    <Spinner />
                </div>
            )}
            {children}
        </div>
    );
};
