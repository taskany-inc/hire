import React, { FC } from 'react';
import { nullable } from '@taskany/bricks';

import { Spinner } from '../Spinner/Spinner';

import s from './LoadingContainer.module.css';

export const LoadingContainer: FC<{ isSpinnerVisible: boolean; children: React.ReactNode }> = ({
    isSpinnerVisible,
    children,
}) => {
    return nullable(
        isSpinnerVisible,
        () => (
            <div className={s.LoadingContainerContainer}>
                <div className={s.LoadingContainerSpinnerWrapper}>
                    <Spinner />
                </div>
                {children}
            </div>
        ),
        children,
    );
};
