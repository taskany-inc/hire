import { Badge } from '@taskany/bricks/harmony';
import { ComponentProps, FC, HTMLAttributes } from 'react';

import {
    InterviewWithRelations,
    SectionWithSectionTypeAndInterviewerAndSolutionsRelations,
} from '../../modules/interviewTypes';
import { interviewStatusLabels, sectionStatusToCommentStatus } from '../../utils/dictionaries';
import { SectionStatusTagPalette } from '../../utils/tagPalette';
import { CommentView } from '../CommentView/CommentView';
import { CommentViewHeader } from '../CommentViewHeader/CommentViewHeader';
import { CommentViewHeaderTitle } from '../CommentViewHeader/CommentViewHeaderTitle';
import { CandidateSelectedSectionBadge } from '../CandidateSelectedSectionBadge/CandidateSelectedSectionBadge';
import { generatePath, Paths } from '../../utils/paths';
import { usePreviewContext } from '../../contexts/previewContext';

import { tr } from './InterviewSectionListItem.i18n';

interface InterviewSectionListItemProps extends HTMLAttributes<HTMLDivElement> {
    section: SectionWithSectionTypeAndInterviewerAndSolutionsRelations;
    interview: InterviewWithRelations;
}

export const getCommentStatus = (
    section: SectionWithSectionTypeAndInterviewerAndSolutionsRelations,
): NonNullable<ComponentProps<typeof CommentView>['status']> => {
    if (section.feedback) {
        return section.hire ? 'HIRED' : 'REJECTED';
    }

    return 'NEW';
};

export const InterviewSectionListItem: FC<InterviewSectionListItemProps> = ({ section, interview }) => {
    const status = getCommentStatus(section);
    const { showSectionPreview } = usePreviewContext();
    const sectionStatus = sectionStatusToCommentStatus[status];
    const isSelected = true; // section.id === interview.candidateSelectedSectionId;
    const headerLink = generatePath(Paths.SECTION, {
        interviewId: interview.id,
        sectionId: section.id,
    });

    return (
        <CommentView
            view="transparent"
            author={section.interviewer}
            text={section.feedback ?? undefined}
            placeholder={tr('No provided feedback')}
            status={status}
            header={
                <CommentViewHeader
                    author={section.interviewer}
                    authorRole={tr('Interviewer')}
                    date={section.updatedAt}
                    subtitle={section.description ?? ''}
                    dot
                >
                    <CommentViewHeaderTitle onClick={() => showSectionPreview(section.id)} link={headerLink}>
                        {section.sectionType.title}
                    </CommentViewHeaderTitle>
                    <Badge
                        size="s"
                        view="outline"
                        weight="regular"
                        color={SectionStatusTagPalette[sectionStatus]}
                        text={interviewStatusLabels[status]}
                    />
                    {isSelected && <CandidateSelectedSectionBadge section={section} interview={interview} />}
                </CommentViewHeader>
            }
        />
    );
};
