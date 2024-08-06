/* stylelint-disable order/order */
import React from 'react';
import { Text, StateDot } from '@taskany/bricks';
import cn from 'classnames';

import s from './ColorizedMenuItem.module.css';

export const ColorizedMenuItem: React.FC<{
    title?: string;
    hoverColor?: boolean;
    focused?: boolean;
    checked?: boolean;
    onClick?: () => void;
    stateDotColor?: string;
}> = ({ hoverColor, title, focused, checked, onClick, stateDotColor }) => {
    return (
        <div
            className={cn(s.ColorizedMenuItem, {
                [s.ColorizedMenuItemFocused]: focused && !hoverColor,
                [s.ColorizedMenuItemHoverColor]: hoverColor,
                [s.ColorizedMenuItemChecked]: hoverColor && (focused || checked),
            })}
            onClick={onClick}
        >
            <div className={s.ColorizedMenuItemNoWrap}>
                <StateDot size="s" color={stateDotColor} />
            </div>
            <Text size="s" weight="bold" className={s.ColorizedMenuItemItemInfo}>
                {title}
            </Text>
        </div>
    );
};
