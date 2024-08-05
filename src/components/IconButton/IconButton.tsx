import { ComponentPropsWithRef, forwardRef } from 'react';
import cn from 'classnames';

import s from './IconButton.module.css';

export const IconButton = forwardRef<HTMLButtonElement, ComponentPropsWithRef<'button'>>(
    ({ className, ...rest }, ref) => {
        return <button className={cn(s.IconButton, className)} ref={ref} {...rest} />;
    },
);
