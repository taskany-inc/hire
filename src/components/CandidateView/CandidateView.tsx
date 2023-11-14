import { FC } from 'react';
import styled from 'styled-components';
import { Text, Button } from '@taskany/bricks';

import { generatePath, pageHrefs, Paths } from '../../utils/paths';
import { distanceDate, formatDateToLocaleString } from '../../utils/date';
import { CandidateWithVendorRelation } from '../../modules/candidateTypes';
import { InterviewWithHireStreamRelation } from '../../modules/interviewTypes';
import { Card } from '../Card';
import { CardHeader } from '../CardHeader';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { InterviewTags } from '../InterviewTags';
import { Stack } from '../Stack';
import { CardContent } from '../CardContent';
import { Link } from '../Link';
import { CandidateBIO } from '../CandidateBIO/CandidateBIO';

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
    return (
        <>
            <Stack direction="column">
                <Text size="s" color="textSecondary" as="p" style={{ marginBottom: 10 }}>
                    {tr('Added')} {distanceDate(candidate.createdAt)}
                </Text>
                <CandidateBIO candidate={candidate} />
                {isShowAddButton && (
                    <Link href={pageHrefs.candidateInterviewCreate(candidate.id)}>
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
