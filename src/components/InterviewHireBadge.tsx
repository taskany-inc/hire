import { VFC } from 'react';
import { InterviewStatus } from '@prisma/client';
import { Badge } from '@taskany/bricks/harmony';

import { TagPaletteColor } from '../utils/tagPalette';
import { interviewStatusLabels } from '../utils/dictionaries';

interface InterviewHireBadgeProps {
    status?: InterviewStatus;
    onClick?: () => void;
}

export const InterviewHireBadge: VFC<InterviewHireBadgeProps> = ({ status, onClick }) => {
    if (!status) {
        return null;
    }

    const label = interviewStatusLabels[status];

    const color = {
        [InterviewStatus.NEW]: TagPaletteColor.BLUE,
        [InterviewStatus.HIRED]: TagPaletteColor.GREEN,
        [InterviewStatus.REJECTED]: TagPaletteColor.MAGENTA,
        [InterviewStatus.IN_PROGRESS]: TagPaletteColor.CYAN,
    }[status];

    return <Badge color={color} size="s" weight="regular" view="outline" onClick={onClick} text={label} />;
};
