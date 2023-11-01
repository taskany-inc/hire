import { FormCard } from '@taskany/bricks';
import { danger0, gapL, gray4, warn0 } from '@taskany/colors';
import styled from 'styled-components';

type SettingsCardViewType = 'default' | 'warning' | 'danger';

const colorsMap: Record<SettingsCardViewType, string> = {
    default: gray4,
    warning: warn0,
    danger: danger0,
};

export const SettingsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${gapL};
    margin: 0 ${gapL};
    max-width: 850px;
`;

export const SettingsCard = styled(FormCard)<{ view?: SettingsCardViewType }>`
    border-color: ${({ view = 'default' }) => colorsMap[view]};
`;
