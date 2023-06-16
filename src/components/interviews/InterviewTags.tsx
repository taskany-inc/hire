import { Badge } from '@taskany/bricks';

import { InterviewWithHireStreamRelation } from '../../backend/modules/interview/interview-types';
import { Stack } from '../layout/Stack';
import { TagChip } from '../problems/TagChip';
import { interviewStatusLabels } from '../../utils/dictionaries';
import { InterviewStatusTagPalette } from '../../utils/tag-palette';

interface Props {
    interview: InterviewWithHireStreamRelation;
}

export function InterviewTags({ interview }: Props) {
    return (
        <Stack direction="row" gap={7} justifyContent="start">
            <Badge color={InterviewStatusTagPalette[interview.status]} style={{ marginTop: 20 }}>
                {interviewStatusLabels[interview.status]}
            </Badge>
            {interview.hireStream && <TagChip tag={interview.hireStream} style={{ marginTop: 20 }} />}
        </Stack>
    );
}
