import { VFC } from 'react';
import { InterviewStatus } from '@prisma/client';
import { Badge } from '@taskany/bricks';

import { TagPaletteColor } from '../../utils/tag-palette';
import { interviewStatusLabels } from '../../utils/dictionaries';

type InterviewHireBadgeProps = {
    status?: InterviewStatus;
    onClick?: () => void;
};

export const InterviewHireBadge: VFC<InterviewHireBadgeProps> = ({ status, onClick }) => {
    if (!status) {
        return null;
    }

    const label = interviewStatusLabels[status];

    switch (status) {
        case InterviewStatus.NEW:
            return (
                <Badge color={TagPaletteColor.BLUE} onClick={onClick}>
                    {label}
                </Badge>
            );
        case InterviewStatus.HIRED:
            return (
                <Badge color={TagPaletteColor.GREEN} onClick={onClick}>
                    {label}
                </Badge>
            );
        case InterviewStatus.REJECTED:
            return (
                <Badge color={TagPaletteColor.MAGENTA} onClick={onClick}>
                    {label}
                </Badge>
            );
        case InterviewStatus.IN_PROGRESS:
            return (
                <Badge color={TagPaletteColor.CYAN} onClick={onClick}>
                    {label}
                </Badge>
            );
        default:
            return null;
    }
};
