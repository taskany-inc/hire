import { FC } from 'react';
import { Button, Text } from '@taskany/bricks/harmony';

import { pageHrefs } from '../../utils/paths';
import { CandidateWithVendorRelation } from '../../modules/candidateTypes';
import { InterviewWithHireStreamRelation } from '../../modules/interviewTypes';
import { Stack } from '../Stack';
import { Link } from '../Link';
import { CandidateBIO } from '../CandidateBIO/CandidateBIO';
import { useDistanceDate } from '../../hooks/useDateFormat';
import { CandidateInterviewCard } from '../CandidateInterviewCard/CandidateInterviewCard';

import { tr } from './CandidateView.i18n';
import s from './CandidateView.module.css';

interface Props {
    candidate: CandidateWithVendorRelation;
    interviews: InterviewWithHireStreamRelation[];
    isShowAddButton: boolean;
}

export const CandidateView: FC<Props> = ({ candidate, interviews, isShowAddButton }) => {
    const date = useDistanceDate(candidate.createdAt);

    return (
        <>
            <Stack direction="column" justifyContent="flex-start">
                <Text size="s" as="p" style={{ marginBottom: 10 }}>
                    {tr('Added')} {date}
                </Text>
                <CandidateBIO candidate={candidate} />
                {isShowAddButton && (
                    <Link href={pageHrefs.candidateInterviewCreate(candidate.id)}>
                        <Button view="primary" text={tr('Add interview')} />
                    </Link>
                )}
            </Stack>

            {interviews.length > 0 && (
                <>
                    <Text size="xxl" className={s.CandidateViewTitle}>
                        {tr('Interview Logs')}
                    </Text>
                    {interviews.map((interview) => (
                        <CandidateInterviewCard interview={interview} key={interview.id} />
                    ))}
                </>
            )}
        </>
    );
};
