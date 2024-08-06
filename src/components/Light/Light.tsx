import { ComponentPropsWithRef, forwardRef } from 'react';
import cn from 'classnames';

import s from './Light.module.css';

export const Light = forwardRef<HTMLSpanElement, ComponentPropsWithRef<'span'>>(({ className, ...rest }, ref) => {
    return <span className={cn(s.Light, className)} ref={ref} {...rest} />;
});
