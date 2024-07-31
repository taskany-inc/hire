import { FC } from 'react';
import styled from 'styled-components';
import { Text } from '@taskany/bricks';
import { Button } from '@taskany/bricks/harmony';

import { pageHrefs } from '../../utils/paths';
import { CandidateWithVendorRelation } from '../../modules/candidateTypes';
import { InterviewWithHireStreamRelation } from '../../modules/interviewTypes';
import { Stack } from '../Stack';
import { Link } from '../Link';
import { CandidateBIO } from '../CandidateBIO/CandidateBIO';
import { useDistanceDate } from '../../hooks/useDateFormat';
import { CandidateInterviewCard } from '../CandidateInterviewCard';

import { tr } from './CandidateView.i18n';

const StyledTitle = styled(Text)`
    margin-top: 60px;
    margin-bottom: 50px;
`;

interface Props {
    candidate: CandidateWithVendorRelation;
    interviews: InterviewWithHireStreamRelation[];
    isShowAddButton: boolean;
}

export const CandidateView: FC<Props> = ({ candidate, interviews, isShowAddButton }) => {
    const date = useDistanceDate(candidate.createdAt);

    return (
        <>
            <Stack direction="column">
                <Text size="s" color="textSecondary" as="p" style={{ marginBottom: 10 }}>
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
                    <StyledTitle size="xxl">{tr('Interview Logs')}</StyledTitle>
                    {interviews.map((interview) => (
                        <CandidateInterviewCard interview={interview} key={interview.id} />
                    ))}
                </>
            )}
        </>
    );
};
