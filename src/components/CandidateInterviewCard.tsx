import { FC } from 'react';
import { nullable } from '@taskany/bricks';

import { generatePath, Paths } from '../utils/paths';
import { InterviewWithHireStreamRelation } from '../modules/interviewTypes';
import { useFormatDateToLocaleString } from '../hooks/useDateFormat';

import { Card } from './Card/Card';
import { CardHeader } from './CardHeader/CardHeader';
import { InterviewTags } from './InterviewTags/InterviewTags';
import { CardContent } from './CardContent';
import Md from './Md';

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
                {nullable(interview.description ?? '', (d) => (
                    <Md>{d}</Md>
                ))}
            </CardContent>
        </Card>
    );
};
