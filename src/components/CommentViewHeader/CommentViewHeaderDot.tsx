import React, { FC, HTMLAttributes } from 'react';
import cn from 'classnames';
import { Dot } from '@taskany/bricks/harmony';

import s from './CommentViewHeader.module.css';

export const CommentViewHeaderDot: FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => (
    <Dot size="s" className={cn(s.CommentViewHeaderDot, className)} {...rest} />
);
