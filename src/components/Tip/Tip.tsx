import { gray7, gray8 } from '@taskany/colors';
import { Text, nullable } from '@taskany/bricks';
import cn from 'classnames';

import s from './Tip.module.css';

interface TipProps {
    title?: string;
    icon?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

export const Tip: React.FC<TipProps> = ({ children, title, icon, className }) => {
    return (
        <Text size="s" color={gray7} className={cn(s.Tip, className)}>
            {nullable(icon, (i) => (
                <span className={s.TipIcon}>{i}</span>
            ))}

            {nullable(title, (t) => (
                <Text as="span" size="s" weight="bold" color={gray8} className={s.TipTitle}>
                    {t}
                </Text>
            ))}

            {children}
        </Text>
    );
};
