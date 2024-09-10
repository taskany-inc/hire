import { useMemo } from 'react';
import { Card, CardContent, CardInfo, Text } from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

import { generatePath, Paths } from '../../utils/paths';
import { CandidateWithVendorAndInterviewWithSectionsWithCommentsWithCreatorRelations } from '../../modules/candidateTypes';
import { useSession } from '../../contexts/appSettingsContext';
import { accessChecks } from '../../modules/accessChecks';
import config from '../../config';
import { TagChip } from '../TagChip';
import { InterviewHireBadge } from '../InterviewHireBadge';
import { CardHeader } from '../CardHeader/CardHeader';
import { Stack } from '../Stack';
import { SectionsProgress } from '../SectionsProgress/SectionsProgress';
import { useCandidateFilterUrlParams } from '../../hooks/useCandidateFilterUrlParams';
import { Link } from '../Link';

import { tr } from './CandidateCard.i18n';
import s from './CandidateCard.module.css';

interface Props {
    candidate: CandidateWithVendorAndInterviewWithSectionsWithCommentsWithCreatorRelations;
}

export const CandidateCard: React.FC<Props> = ({ candidate }) => {
    const session = useSession();
    const candidateLink =
        session && accessChecks.candidate.readOne(session, candidate).allowed
            ? generatePath(Paths.CANDIDATE, { candidateId: candidate.id })
            : undefined;

    const { setter } = useCandidateFilterUrlParams();

    const lastInterview = useMemo(() => {
        const { interviews } = candidate;

        return interviews.length > 0 ? candidate.interviews[interviews.length - 1] : undefined;
    }, [candidate]);

    return (
        <Card className={s.CandidateCard}>
            <CardInfo>
                <CardHeader
                    title={<Link href={candidateLink}>{candidate.name}</Link>}
                    chips={
                        <>
                            <SectionsProgress
                                className={s.CandidateCardChips}
                                view="circle"
                                sections={lastInterview?.sections || []}
                            />

                            <InterviewHireBadge
                                status={lastInterview?.status}
                                onClick={() => lastInterview?.status && setter('statuses', [lastInterview?.status])}
                            />

                            {lastInterview?.hireStream?.name && (
                                <TagChip
                                    tag={lastInterview?.hireStream}
                                    onClick={() =>
                                        lastInterview.hireStream &&
                                        setter('hireStreamIds', [lastInterview.hireStream.id])
                                    }
                                />
                            )}
                        </>
                    }
                    className={s.CandidateCardHeader}
                />
            </CardInfo>

            <CardContent className={s.CandidateCardContent}>
                <Stack direction="column" gap={15}>
                    <Text>
                        {tr('Employment:')}{' '}
                        <Text as="span" className={s.CandidateCardValue}>
                            {candidate.outstaffVendor?.title ?? config.defaultCandidateVendor}
                        </Text>
                    </Text>
                    {nullable(candidate.email, (e) => (
                        <Text>
                            {tr('Email: ')}
                            <Text as="span" className={s.CandidateCardValue}>
                                {e}
                            </Text>
                        </Text>
                    ))}
                    {nullable(candidate.phone, (p) => (
                        <Text>
                            {tr('Tel: ')}{' '}
                            <Text as="span" className={s.CandidateCardValue}>
                                {p}
                            </Text>
                        </Text>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
};
