import { VFC } from 'react';

import { InterviewEventWithRelations } from '../modules/interviewEventTypes';

import { Stack } from './Stack';
import { InterviewHistoryCard } from './InterviewHistoryCard/InterviewHistoryCard';

interface InterviewCardProps {
    interviewHistory: InterviewEventWithRelations[];
}

export const InterviewHistory: VFC<InterviewCardProps> = ({ interviewHistory }) => (
    <Stack direction="column" gap={12}>
        {interviewHistory.map((item) => (
            <InterviewHistoryCard key={item.id} interviewChangeEvent={item} />
        ))}
    </Stack>
);
