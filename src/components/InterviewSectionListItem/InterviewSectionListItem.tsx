import { Badge } from '@taskany/bricks';
import { FC, HTMLAttributes } from 'react';

import {
    InterviewWithRelations,
    SectionWithSectionTypeAndInterviewerAndSolutionsRelations,
} from '../../modules/interviewTypes';
import { interviewStatusLabels, SectionStatus } from '../../utils/dictionaries';
import { SectionStatusTagPalette } from '../../utils/tagPalette';
import { CommentStatus, CommentView } from '../CommentView/CommentView';
import { CommentViewHeader } from '../CommentViewHeader/CommentViewHeader';
import { CommentViewHeaderTitle } from '../CommentViewHeader/CommentViewHeaderTitle';
import { CandidateSelectedSectionBadge } from '../CandidateSelectedSectionBadge';
import { generatePath, Paths } from '../../utils/paths';

import { tr } from './InterviewSectionListItem.i18n';

interface InterviewSectionListItemProps extends HTMLAttributes<HTMLDivElement> {
    section: SectionWithSectionTypeAndInterviewerAndSolutionsRelations;
    interview: InterviewWithRelations;
}

const getCommentStatus = (section: SectionWithSectionTypeAndInterviewerAndSolutionsRelations): CommentStatus => {
    if (section.feedback) {
        return section.hire ? 'HIRED' : 'REJECTED';
    }

    return 'NEW';
};

const sectionStatusToCommentStatus = {
    HIRED: SectionStatus.HIRE,
    NEW: SectionStatus.NEW,
    REJECTED: SectionStatus.NO_HIRE,
};

export const InterviewSectionListItem: FC<InterviewSectionListItemProps> = ({ section, interview }) => {
    const status = getCommentStatus(section);
    const sectionStatus = sectionStatusToCommentStatus[status];
    const isSelected = section.id === interview.candidateSelectedSectionId;
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
                    <CommentViewHeaderTitle link={headerLink}>{section.sectionType.title}</CommentViewHeaderTitle>
                    <Badge size="l" color={SectionStatusTagPalette[sectionStatus]}>
                        {interviewStatusLabels[status]}
                    </Badge>
                    {isSelected && <CandidateSelectedSectionBadge section={section} interview={interview} />}
                </CommentViewHeader>
            }
        />
    );
};
