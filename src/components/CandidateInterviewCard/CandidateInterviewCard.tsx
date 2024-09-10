import { FC } from 'react';
import { nullable } from '@taskany/bricks';
import { CardInfo, Card, CardContent, Text } from '@taskany/bricks/harmony';

import { generatePath, Paths } from '../../utils/paths';
import { InterviewWithHireStreamRelation } from '../../modules/interviewTypes';
import { useFormatDateToLocaleString } from '../../hooks/useDateFormat';
import { CardHeader } from '../CardHeader/CardHeader';
import { InterviewTags } from '../InterviewTags/InterviewTags';
import Md from '../Md';
import { Link } from '../Link';

import { tr } from './CandidateInterviewCard.i18n';
import s from './CandidateInterviewCard.module.css';

interface Props {
    interview: InterviewWithHireStreamRelation;
}

export const CandidateInterviewCard: FC<Props> = ({ interview }) => {
    const date = useFormatDateToLocaleString(interview.createdAt);

    return (
        <Card className={s.CandidateInterviewCard}>
            <CardInfo>
                <CardHeader
                    title={
                        <Link
                            href={generatePath(Paths.INTERVIEW, {
                                interviewId: interview.id,
                            })}
                        >{`#${interview.id}`}</Link>
                    }
                    subTitle={date}
                    chips={<InterviewTags interview={interview} />}
                    className={s.CandidateInterviewCardHeader}
                />
            </CardInfo>
            <CardContent>
                {nullable(
                    interview.description,
                    (d) => (
                        <Md>{d}</Md>
                    ),
                    <Text className={s.CandidateInterviewCardNoDescription}>{tr('No description yet')}</Text>,
                )}
            </CardContent>
        </Card>
    );
};
