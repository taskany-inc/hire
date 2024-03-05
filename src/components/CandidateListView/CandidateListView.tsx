import { FC, useCallback, useRef } from 'react';
import { Text } from '@taskany/bricks';

import { useCandidates } from '../../modules/candidateHooks';
import { Stack } from '../Stack';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { CandidateCard } from '../CandidateCard/CandidateCard';
import {
    candidateFilterValuesToRequestData,
    useCandidateFilterUrlParams,
} from '../../hooks/useCandidateFilterUrlParams';

import { tr } from './CandidateListView.i18n';

export const CandidateListView: FC = () => {
    const { values } = useCandidateFilterUrlParams();
    const candidatesQuery = useCandidates(candidateFilterValuesToRequestData(values));

    const { isFetching, hasNextPage, fetchNextPage } = candidatesQuery;

    const observer = useRef<IntersectionObserver | null>(null);
    const ref = useCallback(
        (node: HTMLDivElement) => {
            if (isFetching) return;

            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            });

            if (node) observer.current.observe(node);
        },
        [hasNextPage, fetchNextPage, isFetching],
    );

    return (
        <Stack direction="column" gap={6} style={{ marginTop: 40 }}>
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
                            <div ref={ref}>{isFetching && <Text>{tr('Loading candidates')} ⏳</Text>}</div>
                        </>
                    );
                }}
            </QueryResolver>
        </Stack>
    );
};
