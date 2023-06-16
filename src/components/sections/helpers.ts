import { Section } from '@prisma/client';

import { SectionWithInterviewRelation } from '../../backend/modules/interview/interview-types';
import { symbols } from '../../utils/symbols';
import { SectionStatus } from '../../utils/dictionaries';

export const getSectionChip = (section: Section): SectionStatus => {
    if (section.feedback) {
        return section.hire ? SectionStatus.HIRE : SectionStatus.NO_HIRE;
    }

    return SectionStatus.NEW;
};

export function getFullSectionTitle(section: SectionWithInterviewRelation): string {
    const { interview, interviewId, sectionType } = section;
    const { candidate } = interview;

    return `${candidate.name} #${interviewId} ${symbols.emDash} ${sectionType.title}`;
}

export function getSectionTitle(section: SectionWithInterviewRelation): string {
    const { interviewId, sectionType } = section;

    return `#${interviewId} ${symbols.emDash} ${sectionType.title}`;
}

export function getShortSectionTitle(section: SectionWithInterviewRelation): string {
    const { sectionType } = section;

    return `${sectionType.title}`;
}
