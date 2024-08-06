import React, { FC } from 'react';

import { Spinner } from '../Spinner/Spinner';

import s from './LoadingContainer.module.css';

export const LoadingContainer: FC<{ isSpinnerVisible: boolean; children: React.ReactNode }> = ({
    isSpinnerVisible,
    children,
}) => {
    return (
        <div className={s.LoadingContainerContainer}>
            {isSpinnerVisible && (
                <div className={s.LoadingContainerSpinnerWrapper}>
                    <Spinner />
                </div>
            )}
            {children}
        </div>
    );
};
