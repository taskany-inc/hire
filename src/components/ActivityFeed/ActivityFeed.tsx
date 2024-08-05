import { FC, HTMLAttributes } from 'react';
import cn from 'classnames';

import s from './ActivityFeed.module.css';

type DivAttributes = HTMLAttributes<HTMLDivElement>;

export const ActivityFeed: FC<DivAttributes> = ({ className, ...rest }) => {
    return <div className={cn(s.ActivityFeed, className)} {...rest} />;
};
export const ActivityFeedItem: FC<DivAttributes> = ({ className, ...rest }) => {
    return <div className={cn(s.ActivityFeedItem, className)} {...rest} />;
};
