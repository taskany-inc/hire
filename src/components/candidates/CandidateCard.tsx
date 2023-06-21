import { useMemo } from 'react';
import { Text } from '@taskany/bricks';
import { gray10 } from '@taskany/colors';

import { Card } from '../card/Card';
import { CardHeader } from '../card/CardHeader';
import { generatePath, Paths } from '../../utils/paths';
import { CandidateWithVendorAndInterviewWithSectionsRelations } from '../../backend/modules/candidate/candidate-types';
import { InterviewHireBadge } from '../interviews/InterviewHireBadge';
import { useCandidateFilterContext } from '../../contexts/candidate-filter-context';
import { TagChip } from '../problems/TagChip';
import { InterviewWithHireStreamRelation } from '../../backend/modules/interview/interview-types';
import { useSession } from '../../contexts/app-settings-context';
import { accessChecks } from '../../backend/access/access-checks';
import config from '../../backend/config';
import { Stack } from '../layout/Stack';
import { CardContent } from '../card/CardContent';

import { tr } from './candidates.i18n';

interface Props {
    candidate: CandidateWithVendorAndInterviewWithSectionsRelations;
}

export const CandidateCard: React.FC<Props> = ({ candidate }) => {
    const session = useSession();
    const candidateLink =
        session && accessChecks.candidate.readOne(session, candidate).allowed
            ? generatePath(Paths.CANDIDATE, { candidateId: candidate.id })
            : undefined;

    const { setStatuses, setHireStreams } = useCandidateFilterContext();

    const lastInterview = useMemo<InterviewWithHireStreamRelation | undefined>(() => {
        const { interviews } = candidate;

        return interviews.length > 0 ? candidate.interviews[interviews.length - 1] : undefined;
    }, [candidate]);

    return (
        <Card>
            <CardHeader
                title={candidate.name}
                link={candidateLink}
                chips={
                    <>
                        <InterviewHireBadge
                            status={lastInterview?.status}
                            onClick={() => lastInterview?.status && setStatuses([lastInterview?.status])}
                        />
                        {lastInterview?.hireStream?.name && (
                            <TagChip
                                tag={lastInterview?.hireStream}
                                onClick={() => lastInterview.hireStream && setHireStreams([lastInterview.hireStream])}
                            />
                        )}
                    </>
                }
            />
            <CardContent>
                <Stack direction="column" gap={15}>
                    <Text color={gray10}>
                        {tr('Employment:')}{' '}
                        <Text as="span">{candidate.outstaffVendor?.title ?? config.defaultCandidateVendor}</Text>
                    </Text>
                    {candidate.email && (
                        <Text color={gray10}>
                            {tr('Email: ')}
                            <Text as="span">{candidate.email}</Text>
                        </Text>
                    )}
                    {candidate.phone && (
                        <Text color={gray10}>
                            {tr('Tel:')} <Text as="span"> {candidate.phone}</Text>
                        </Text>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};
