import React, { FC, HTMLAttributes } from 'react';
import cn from 'classnames';

import s from './CommentViewHeader.module.css';

export const CommentViewHeaderContainer: FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...rest }) => (
    <div className={cn(s.CommentViewHeaderContainer, className)} {...rest}>
        {children}
    </div>
);
