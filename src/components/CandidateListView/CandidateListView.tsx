import { FC, useCallback, useRef } from 'react';
import { Text } from '@taskany/bricks';

import { useCandidates } from '../../modules/candidateHooks';
import { useCandidateFilterContext } from '../../contexts/candidateFilterContext';
import { Stack } from '../Stack';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { CandidateCard } from '../CandidateCard/CandidateCard';

import { tr } from './CandidateListView.i18n';

export const CandidateListView: FC = () => {
    const { debouncedSearch, statuses, hireStreams } = useCandidateFilterContext();
    const hireStreamIds = hireStreams.map((hireStream) => hireStream.id);
    const candidatesQuery = useCandidates({
        search: debouncedSearch,
        statuses,
        hireStreamIds,
        limit: 20,
    });

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
