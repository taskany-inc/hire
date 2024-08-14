import { FC } from 'react';
import { Text } from '@taskany/bricks';

import { useCandidates } from '../../modules/candidateHooks';
import {
    candidateFilterValuesToRequestData,
    useCandidateFilterUrlParams,
} from '../../hooks/useCandidateFilterUrlParams';
import { useIntersectionLoader } from '../../hooks/useIntersectionLoader';
import { CandidatesLoader } from '../CandidatesLoader/CandidatesLoader';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { CandidateCard } from '../CandidateCard/CandidateCard';
import { Stack } from '../Stack';

import { tr } from './CandidateListView.i18n';

export const CandidateListView: FC = () => {
    const { values } = useCandidateFilterUrlParams();
    const candidatesQuery = useCandidates(candidateFilterValuesToRequestData(values));

    const { isFetching, hasNextPage, fetchNextPage } = candidatesQuery;

    const ref = useIntersectionLoader<HTMLDivElement>(() => fetchNextPage(), Boolean(!isFetching && hasNextPage));

    return (
        <Stack direction="column" gap={6}>
            <QueryResolver queries={[candidatesQuery]}>
                {([candidates]) => {
                    return (
                        <>
                            {candidates.pages.map((page, index) => (
                                <div key={`page-${index}`}>
                                    {page.total === 0 ? (
                                        <Text>{tr('Nothing found')} 😔</Text>
                                    ) : (
                                        page.items.map((candidate) => (
                                            <CandidateCard candidate={candidate} key={candidate.id} />
                                        ))
                                    )}
                                </div>
                            ))}
                            <div ref={ref}>{isFetching && <CandidatesLoader />}</div>
                        </>
                    );
                }}
            </QueryResolver>
        </Stack>
    );
};
