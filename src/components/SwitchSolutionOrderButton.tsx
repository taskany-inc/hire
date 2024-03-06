import styled from 'styled-components';
import { gray0 } from '@taskany/colors';

interface SwitchSolutionsOrderButtonProps {
    disabled?: boolean;
    onClick: () => void;
    direction: 'up' | 'down';
}

const StyledButton = styled.button<SwitchSolutionsOrderButtonProps>`
    border-bottom: ${({ disabled }) => (disabled ? 'solid 2px gray' : 'solid 1px white')};
    border-right: ${({ disabled }) => (disabled ? 'solid 2px gray' : 'solid 1px white')};
    border-left: none;
    border-top: none;
    background-color: transparent;
    width: 20px;
    height: 20px;
    transform: ${({ direction }) =>
        direction === 'up' ? 'translateY(10%) rotate(225deg)' : 'rotate(45deg) translateY(-80%)'};

    &:hover {
        border-bottom: ${({ disabled }) => (disabled ? 'solid 2px gray' : `solid 2px ${gray0}`)};
        border-right: ${({ disabled }) => (disabled ? 'solid 2px gray' : `solid 2px ${gray0}`)};
        cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    }
`;
export const SwitchSolutionsOrderButton = ({ direction, onClick, disabled }: SwitchSolutionsOrderButtonProps) => {
    const ariaLabel = `go ${direction === 'up' ? 'up' : 'down'}`;

    return (
        <StyledButton
            direction={direction}
            disabled={disabled}
            type="button"
            aria-label={ariaLabel}
            onClick={onClick}
        />
    );
};
