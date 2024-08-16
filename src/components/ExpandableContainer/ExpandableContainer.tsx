import { ReactNode } from 'react';
import { nullable } from '@taskany/bricks';
import { Text } from '@taskany/bricks/harmony';
import { IconDownSmallOutline, IconUpSmallOutline } from '@taskany/icons';
import cn from 'classnames';

import { useElementSize } from '../../hooks/useElementSize';
import { useToggle } from '../../hooks/useToggle';

import s from './ExpandableContainer.module.css';
import { tr } from './ExpandableContainer.i18n';

interface ExpandableContainerProps {
    height?: number;
    children: ReactNode;
}

export const ExpandableContainer = ({ height = 300, children }: ExpandableContainerProps) => {
    const [ref, rect] = useElementSize();
    const [expanded, toggleExpanded] = useToggle(false);

    const icon = expanded ? <IconUpSmallOutline size="s" /> : <IconDownSmallOutline size="s" />;
    const text = expanded ? tr('Collapse') : tr('Expand');

    const showExpander = rect.height > height;

    return (
        <div style={{ maxHeight: expanded ? undefined : height }} className={s.ExpandableContainer}>
            <div ref={ref}>{children}</div>

            {nullable(showExpander, () => (
                <div
                    className={cn(s.ExpandableContainerExpander, { [s.ExpandableContainerExpanderOnTop]: !expanded })}
                    onClick={toggleExpanded}
                >
                    {icon}
                    <Text size="xs">{text}</Text>
                    {icon}
                </div>
            ))}
        </div>
    );
};
