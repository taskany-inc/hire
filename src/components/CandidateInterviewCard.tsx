import { FC } from 'react';

import { generatePath, Paths } from '../utils/paths';
import { InterviewWithHireStreamRelation } from '../modules/interviewTypes';
import { useFormatDateToLocaleString } from '../hooks/useDateFormat';

import { Card } from './Card/Card';
import { CardHeader } from './CardHeader';
import { MarkdownRenderer } from './MarkdownRenderer/MarkdownRenderer';
import { InterviewTags } from './InterviewTags';
import { CardContent } from './CardContent';

interface Props {
    interview: InterviewWithHireStreamRelation;
}

export const CandidateInterviewCard: FC<Props> = ({ interview }) => {
    const date = useFormatDateToLocaleString(interview.createdAt);

    return (
        <Card>
            <CardHeader
                title={`#${interview.id}`}
                subTitle={date}
                link={generatePath(Paths.INTERVIEW, {
                    interviewId: interview.id,
                })}
                chips={<InterviewTags interview={interview} />}
            />
            <CardContent>
                <MarkdownRenderer value={interview.description ?? ''} />
            </CardContent>
        </Card>
    );
};
