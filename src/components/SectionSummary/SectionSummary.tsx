import { VFC } from 'react';
import { Text } from '@taskany/bricks';

import { InterviewWithCandidateRelation } from '../../modules/interviewTypes';
import { SectionWithRelationsAndResults } from '../../modules/sectionTypes';
import { Stack } from '../Stack';
import { AddProblemToSection } from '../AddProblemToSection/AddProblemToSection';
import { SectionFeedback } from '../SectionFeedback/SectionFeedback';

import { tr } from './SectionSummary.i18n';

interface SectionSummaryProps {
    interview: InterviewWithCandidateRelation;
    section: SectionWithRelationsAndResults;
    isEditable: boolean;
    hasTasks: boolean;
}

export const SectionSummary: VFC<SectionSummaryProps> = ({ interview, section, isEditable, hasTasks }) => {
    const interviewId = interview.id;
    const isProblemCreationAvailable = isEditable && hasTasks;

    return (
        <Stack direction="column" gap="15px" justifyItems="flex-start">
            {isProblemCreationAvailable && <AddProblemToSection interviewId={interviewId} />}
            <>
                <Text size="s" color="textSecondary">
                    {tr('Section feedback')}
                </Text>
                <SectionFeedback section={section} isEditable={isEditable} candidateId={interview.candidateId} />
            </>
        </Stack>
    );
};
