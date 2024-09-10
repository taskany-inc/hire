import { Interview, Section } from '@prisma/client';
import { Badge } from '@taskany/bricks/harmony';

import { TagPaletteColor } from '../../utils/tagPalette';

import { tr } from './CandidateSelectedSectionBadge.i18n';

interface CandidateSelectedSectionBadgeProps {
    interview: Interview & { candidateSelectedSectionId: number | null };
    section: Section;
}

export const CandidateSelectedSectionBadge = ({ section, interview }: CandidateSelectedSectionBadgeProps) => {
    if (typeof interview.candidateSelectedSectionId !== 'number') {
        return null;
    }

    if (section.id === interview.candidateSelectedSectionId) {
        return (
            <Badge
                size="s"
                view="outline"
                weight="regular"
                color={TagPaletteColor.GREEN}
                text={tr('Candidate Selection')}
            />
        );
    }

    return (
        <Badge
            size="s"
            view="outline"
            weight="regular"
            color={TagPaletteColor.RED}
            text={tr('Not selected by candidate')}
        />
    );
};
