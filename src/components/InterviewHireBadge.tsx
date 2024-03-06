import { VFC } from 'react';
import { InterviewStatus } from '@prisma/client';
import { Badge } from '@taskany/bricks';

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

    switch (status) {
        case InterviewStatus.NEW:
            return (
                <Badge size="l" color={TagPaletteColor.BLUE} onClick={onClick}>
                    {label}
                </Badge>
            );
        case InterviewStatus.HIRED:
            return (
                <Badge size="l" color={TagPaletteColor.GREEN} onClick={onClick}>
                    {label}
                </Badge>
            );
        case InterviewStatus.REJECTED:
            return (
                <Badge size="l" color={TagPaletteColor.MAGENTA} onClick={onClick}>
                    {label}
                </Badge>
            );
        case InterviewStatus.IN_PROGRESS:
            return (
                <Badge size="l" color={TagPaletteColor.CYAN} onClick={onClick}>
                    {label}
                </Badge>
            );
        default:
            return null;
    }
};
