import { FC } from 'react';
import { textColor } from '@taskany/colors';

import s from './Spinner.module.css';

export const Spinner: FC = () => {
    return (
        <svg viewBox="0 0 50 50" color={textColor} className={s.SpinnerSyledSpinner}>
            <circle className="path" cx="25" cy="25" r="20" fill="none" stroke={textColor} strokeWidth="5" />
        </svg>
    );
};
