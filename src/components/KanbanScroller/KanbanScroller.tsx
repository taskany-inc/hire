import React, { FC, HTMLAttributes } from 'react';

import s from './KanbanScroller.module.css';

export const KanbanScroller: FC<{ shadow?: number } & HTMLAttributes<HTMLDivElement>> = ({ children, shadow = 0 }) => {
    const style = { '--kanban-shadow-height': `${shadow}px` } as React.CSSProperties;

    return (
        <div className={s.KanbanShadow} style={style}>
            <div className={s.KanbanScroller}>{children}</div>
        </div>
    );
};
