import React, { FC, HTMLAttributes } from 'react';
import cn from 'classnames';

import s from './CommentViewHeader.module.css';

export const CommentViewHeaderMetaInfo: FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...rest }) => (
    <div className={cn(s.CommentViewHeaderMetaInfo, className)} {...rest}>
        {children}
    </div>
);
