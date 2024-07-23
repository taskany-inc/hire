import cn from 'classnames';

import s from './SwitchSolutionOrderButton.module.css';

interface SwitchSolutionsOrderButtonProps {
    disabled?: boolean;
    onClick: () => void;
    direction: 'up' | 'down';
}

export const SwitchSolutionsOrderButton = ({ direction, onClick, disabled }: SwitchSolutionsOrderButtonProps) => {
    const ariaLabel = `go ${direction === 'up' ? 'up' : 'down'}`;

    return (
        <>
            <button
                className={cn(s.OrderButton, direction === 'up' ? s.OrderButtonUp : s.OrderButtonDown, {
                    [s.OrderButtonDisabled]: disabled,
                })}
                disabled={disabled}
                type="button"
                aria-label={ariaLabel}
                onClick={onClick}
            />
        </>
    );
};
