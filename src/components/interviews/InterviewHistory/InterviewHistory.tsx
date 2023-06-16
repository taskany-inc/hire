import { VFC } from 'react';

import { InterviewEventWithRelations } from '../../../backend/modules/interview-event/interview-event-types';
import { Stack } from '../../layout/Stack';

import { InterviewHistoryCard } from './InterviewHistoryCard';

type InterviewCardProps = { interviewHistory: InterviewEventWithRelations[] };

export const InterviewHistory: VFC<InterviewCardProps> = ({ interviewHistory }) => (
    <Stack direction="column" gap={12}>
        {interviewHistory.map((item) => (
            <InterviewHistoryCard key={item.id} interviewChangeEvent={item} />
        ))}
    </Stack>
);
