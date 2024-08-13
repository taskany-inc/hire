import { Badge } from '@taskany/bricks/harmony';

import { InterviewWithHireStreamRelation } from '../../modules/interviewTypes';
import { interviewStatusLabels } from '../../utils/dictionaries';
import { InterviewStatusTagPalette } from '../../utils/tagPalette';
import { TagChip } from '../TagChip';

import s from './InterviewTags.module.css';

interface Props {
    interview: InterviewWithHireStreamRelation;
}

export function InterviewTags({ interview }: Props) {
    return (
        <>
            <Badge
                size="s"
                view="outline"
                color={InterviewStatusTagPalette[interview.status]}
                text={interviewStatusLabels[interview.status]}
                weight="regular"
            />
            {interview.hireStream && <TagChip className={s.InterviewTagsTagChip} tag={interview.hireStream} />}
        </>
    );
}
