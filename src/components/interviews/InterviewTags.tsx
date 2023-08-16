import { Badge } from '@taskany/bricks';
import styled from 'styled-components';
import { gapL, gapS } from '@taskany/colors';

import { InterviewWithHireStreamRelation } from '../../backend/modules/interview/interview-types';
import { Stack } from '../layout/Stack';
import { TagChip } from '../problems/TagChip';
import { interviewStatusLabels } from '../../utils/dictionaries';
import { InterviewStatusTagPalette } from '../../utils/tag-palette';

interface Props {
    interview: InterviewWithHireStreamRelation;
}

const StyledBadge = styled(Badge)`
    margin-top: ${gapL}'
`;

const StyledTagChip = styled(TagChip)`
    margin-top: 20px'
`;

export function InterviewTags({ interview }: Props) {
    return (
        <Stack direction="row" gap={10} style={{ marginTop: gapS }} justifyContent="start">
            <StyledBadge size="l" color={InterviewStatusTagPalette[interview.status]}>
                {interviewStatusLabels[interview.status]}
            </StyledBadge>
            {interview.hireStream && <StyledTagChip tag={interview.hireStream} />}
        </Stack>
    );
}
