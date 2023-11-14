import { VFC } from 'react';
import { InterviewStatus } from '@prisma/client';
import { Badge } from '@taskany/bricks';

import { TagPaletteColor } from '../utils/tagPalette';

const interviewStatusToColor: Partial<Record<InterviewStatus, TagPaletteColor>> = {
    [InterviewStatus.NEW]: TagPaletteColor.YELLOW,
};

const defaultColor = TagPaletteColor.PURPLE_GREY;

export const InterviewStatusIcon: VFC<{ status: InterviewStatus }> = (interview) => (
    <Badge color={interviewStatusToColor[interview.status] ?? defaultColor}>{interview.status}</Badge>
);
