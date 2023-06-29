import { Badge } from '@taskany/bricks';
import styled from 'styled-components';

import { InterviewWithHireStreamRelation } from '../../backend/modules/interview/interview-types';
import { Stack } from '../layout/Stack';
import { TagChip } from '../problems/TagChip';
import { interviewStatusLabels } from '../../utils/dictionaries';
import { InterviewStatusTagPalette } from '../../utils/tag-palette';

interface Props {
    interview: InterviewWithHireStreamRelation;
}

const StyledBadge = styled(Badge)`
    margin-top: 20px'
`;

const StyledTagChip = styled(TagChip)`
    margin-top: 20px'
`;

export function InterviewTags({ interview }: Props) {
    return (
        <Stack direction="row" gap={7} justifyContent="start">
            <StyledBadge color={InterviewStatusTagPalette[interview.status]}>
                {interviewStatusLabels[interview.status]}
            </StyledBadge>
            {interview.hireStream && <StyledTagChip tag={interview.hireStream} />}
        </Stack>
    );
}
