import cn from 'classnames';
import { IconDownOutline, IconUpOutline } from '@taskany/icons';
import { Button } from '@taskany/bricks/harmony';

import s from './SwitchSolutionOrderButton.module.css';

interface SwitchSolutionsOrderButtonProps {
    disabled?: boolean;
    onClick: () => void;
    direction: 'up' | 'down';
}

export const SwitchSolutionsOrderButton = ({ direction, onClick, disabled }: SwitchSolutionsOrderButtonProps) => {
    const ariaLabel = `go ${direction === 'up' ? 'up' : 'down'}`;

    return (
        <Button
            className={cn(s.OrderButton, {
                [s.OrderButtonDisabled]: disabled,
            })}
            size="xs"
            aria-label={ariaLabel}
            type="button"
            onClick={onClick}
            disabled={disabled}
            iconRight={direction === 'up' ? <IconUpOutline size="s" /> : <IconDownOutline size="s" />}
        />
    );
};
