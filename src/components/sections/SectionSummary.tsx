import { VFC } from 'react';
import { Text } from '@taskany/bricks';

import { InterviewWithCandidateRelation } from '../../backend/modules/interview/interview-types';
import { SectionWithRelationsAndResults } from '../../backend/modules/section/section-types';
import { Stack } from '../layout/Stack';

import { AddProblemToSection } from './AddProblemToSection';
import { SectionFeedback } from './SectionFeedback';

import { tr } from './sections.i18n';

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
