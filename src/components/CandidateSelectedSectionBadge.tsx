import { VFC } from 'react';
import { Interview, Section } from '@prisma/client';
import { Badge } from '@taskany/bricks';

import { TagPaletteColor } from '../utils/tagPalette';

interface Props {
    interview: Interview & { candidateSelectedSectionId: number | null };
    section: Section;
}

export const CandidateSelectedSectionBadge: VFC<Props> = ({ section, interview }) => {
    if (typeof interview.candidateSelectedSectionId !== 'number') {
        return null;
    }

    if (section.id === interview.candidateSelectedSectionId) {
        return (
            <Badge ellipsis={true} size="l" color={TagPaletteColor.GREEN}>
                Candidate Selection
            </Badge>
        );
    }

    return (
        <Badge ellipsis={true} size="l" color={TagPaletteColor.RED}>
            Not selected by candidate
        </Badge>
    );
};
