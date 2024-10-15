import { ReactNode } from 'react';
import { Text } from '@taskany/bricks/harmony';
import cn from 'classnames';

import s from './SidebarBlock.module.css';

interface SidebarBlockProps {
    title: string;
    className?: string;
    children?: ReactNode;
}

export const SidebarBlock = ({ title, className, children }: SidebarBlockProps) => {
    return (
        <div className={cn(s.SidebarBlock, className)}>
            <Text size="m" weight="semiBold" className={s.SidebarBlockTitle}>
                {title}
            </Text>
            {children}
        </div>
    );
};
