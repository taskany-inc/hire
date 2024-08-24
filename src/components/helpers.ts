import { SectionWithInterviewRelation } from '../modules/interviewTypes';
import { symbols } from '../utils/symbols';

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
