import { Badge } from '@taskany/bricks';
import { gapS } from '@taskany/colors';

import { InterviewWithHireStreamRelation } from '../../modules/interviewTypes';
import { interviewStatusLabels } from '../../utils/dictionaries';
import { InterviewStatusTagPalette } from '../../utils/tagPalette';
import { Stack } from '../Stack';
import { TagChip } from '../TagChip';

import s from './InterviewTags.module.css';

interface Props {
    interview: InterviewWithHireStreamRelation;
}

export function InterviewTags({ interview }: Props) {
    return (
        <Stack direction="row" gap={10} style={{ marginTop: gapS }} justifyContent="start">
            <Badge size="l" color={InterviewStatusTagPalette[interview.status]}>
                {interviewStatusLabels[interview.status]}
            </Badge>
            {interview.hireStream && <TagChip className={s.InterviewTagsTagChip} tag={interview.hireStream} />}
        </Stack>
    );
}
