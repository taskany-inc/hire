import { ComponentPropsWithRef, forwardRef } from 'react';
import cn from 'classnames';

import s from './FiltersMenuItem.module.css';

interface FiltersMenuItemProps extends ComponentPropsWithRef<'span'> {
    active?: boolean;
    disabled?: boolean;
}

export const FiltersMenuItem = forwardRef<HTMLSpanElement, FiltersMenuItemProps>(
    ({ className, active, ...rest }, ref) => {
        return (
            <span
                className={cn(
                    s.FiltersMenuItem,
                    {
                        [s.FiltersMenuItemActive]: active,
                    },
                    className,
                )}
                ref={ref}
                {...rest}
            />
        );
    },
);
