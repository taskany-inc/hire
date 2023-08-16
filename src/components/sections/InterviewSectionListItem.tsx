import { Section } from '@prisma/client';
import { Badge } from '@taskany/bricks';

import { generatePath, Paths } from '../../utils/paths';
import { SectionStatusTagPalette } from '../../utils/tag-palette';
import {
    InterviewWithRelations,
    SectionWithSectionTypeAndInterviewerAndSolutionsRelations,
} from '../../backend/modules/interview/interview-types';
import { ListItem } from '../interviews/ListItem';
import { SectionStatus } from '../../utils/dictionaries';

import { CandidateSelectedSectionBadge } from './CandidateSelectedSectionBadge';
import { SectionSubtitle } from './SectionSubtitle';

const getSectionChip = (section: Section) => {
    if (section.feedback) {
        return section.hire ? SectionStatus.HIRE : SectionStatus.NO_HIRE;
    }

    return SectionStatus.NEW;
};

interface Props {
    section: SectionWithSectionTypeAndInterviewerAndSolutionsRelations;
    interview: InterviewWithRelations;
}

// TODO: disable return value linting
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function InterviewSectionListItem({ section, interview }: Props) {
    const sectionChip = getSectionChip(section);
    const isSelected = section.id === interview.candidateSelectedSectionId;

    return (
        <ListItem
            key={section.id}
            title={section.sectionType.title}
            subtitle={<SectionSubtitle section={section} />}
            link={generatePath(Paths.SECTION, {
                interviewId: interview.id,
                sectionId: section.id,
            })}
            chips={
                <>
                    <Badge size={'xl'} color={SectionStatusTagPalette[sectionChip]}>
                        {sectionChip}
                    </Badge>

                    {isSelected && <CandidateSelectedSectionBadge section={section} interview={interview} />}
                </>
            }
            markdown={section.feedback ?? ''}
        />
    );
}
