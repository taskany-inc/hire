import { useMemo } from 'react';
import { Text } from '@taskany/bricks';
import { gray10 } from '@taskany/colors';

import { generatePath, Paths } from '../../utils/paths';
import { CandidateWithVendorAndInterviewWithSectionsRelations } from '../../modules/candidateTypes';
import { InterviewWithHireStreamRelation } from '../../modules/interviewTypes';
import { useSession } from '../../contexts/appSettingsContext';
import { accessChecks } from '../../modules/accessChecks';
import config from '../../config';
import { TagChip } from '../TagChip';
import { InterviewHireBadge } from '../InterviewHireBadge';
import { CardHeader } from '../CardHeader/CardHeader';
import { Card } from '../Card/Card';
import { Stack } from '../Stack';
import { CardContent } from '../CardContent';
import { useCandidateFilterUrlParams } from '../../hooks/useCandidateFilterUrlParams';
import { Link } from '../Link';

import { tr } from './CandidateCard.i18n';

interface Props {
    candidate: CandidateWithVendorAndInterviewWithSectionsRelations;
}

export const CandidateCard: React.FC<Props> = ({ candidate }) => {
    const session = useSession();
    const candidateLink =
        session && accessChecks.candidate.readOne(session, candidate).allowed
            ? generatePath(Paths.CANDIDATE, { candidateId: candidate.id })
            : undefined;

    const { setter } = useCandidateFilterUrlParams();

    const lastInterview = useMemo<InterviewWithHireStreamRelation | undefined>(() => {
        const { interviews } = candidate;

        return interviews.length > 0 ? candidate.interviews[interviews.length - 1] : undefined;
    }, [candidate]);

    return (
        <Card>
            <CardHeader
                title={<Link href={candidateLink}>{candidate.name}</Link>}
                chips={
                    <>
                        <InterviewHireBadge
                            status={lastInterview?.status}
                            onClick={() => lastInterview?.status && setter('statuses', [lastInterview?.status])}
                        />
                        {lastInterview?.hireStream?.name && (
                            <TagChip
                                tag={lastInterview?.hireStream}
                                onClick={() =>
                                    lastInterview.hireStream && setter('hireStreamIds', [lastInterview.hireStream.id])
                                }
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
                            {tr('Tel: ')} <Text as="span"> {candidate.phone}</Text>
                        </Text>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};
