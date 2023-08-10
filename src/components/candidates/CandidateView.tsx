import { FC } from 'react';
import styled from 'styled-components';
import { Text, Link, Button } from '@taskany/bricks';

import { generatePath, pageHrefs, Paths } from '../../utils/paths';
import { distanceDate, formatDateToLocaleString } from '../../utils/date';
import { Card } from '../card/Card';
import { CardHeader } from '../card/CardHeader';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { CandidateWithVendorRelation } from '../../backend/modules/candidate/candidate-types';
import { InterviewTags } from '../interviews/InterviewTags';
import { InterviewWithHireStreamRelation } from '../../backend/modules/interview/interview-types';
import { Stack } from '../layout/Stack';
import { CardContent } from '../card/CardContent';

import { CandidateBIO } from './CandidateBIO';
import { tr } from './candidates.i18n';

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
    return (
        <>
            <Stack direction="column">
                <Text size="s" color="textSecondary" as="p" style={{ marginBottom: 10 }}>
                    {tr('Added')} {distanceDate(candidate.createdAt)}
                </Text>
                <CandidateBIO candidate={candidate} />
                {isShowAddButton && (
                    <Link inline href={pageHrefs.candidateInterviewCreate(candidate.id)}>
                        <Button outline view="primary" text={tr('Add interview')} />
                    </Link>
                )}
            </Stack>

            {interviews.length > 0 && (
                <>
                    <StyledTitle size="xxl">{tr('Interview Logs')}</StyledTitle>
                    {interviews.map((interview) => (
                        <Card key={interview.id}>
                            <CardHeader
                                title={`#${interview.id}`}
                                subTitle={formatDateToLocaleString(interview.createdAt)}
                                link={generatePath(Paths.INTERVIEW, {
                                    interviewId: interview.id,
                                })}
                                chips={<InterviewTags interview={interview} />}
                            />
                            <CardContent>
                                <MarkdownRenderer value={interview.description ?? ''} />
                            </CardContent>
                        </Card>
                    ))}
                </>
            )}
        </>
    );
};
