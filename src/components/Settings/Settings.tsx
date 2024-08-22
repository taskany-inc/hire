import { Card } from '@taskany/bricks/harmony';
import { ComponentProps, ComponentPropsWithoutRef, FC } from 'react';
import cn from 'classnames';

import s from './Settings.module.css';

type SettingsCardViewType = 'default' | 'warning' | 'danger';

export const SettingsContainer: FC<ComponentPropsWithoutRef<'div'>> = ({ className, ...rest }) => {
    return <div className={cn(s.SettingsContainer, className)} {...rest} />;
};

export const SettingsCard: FC<ComponentProps<typeof Card> & { view?: SettingsCardViewType }> = ({
    className,
    view,
    ...rest
}) => {
    return <Card className={cn(s[`SettingsCard-${view}`], className)} {...rest} />;
};
