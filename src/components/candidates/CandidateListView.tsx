import { FC, useCallback, useRef } from 'react';
import { Text } from '@taskany/bricks';

import { useCandidates } from '../../hooks/candidate-hooks';
import { useCandidateFilterContext } from '../../contexts/candidate-filter-context';
import { Stack } from '../layout/Stack';
import { QueryResolver } from '../QueryResolver';

import { CandidateCard } from './CandidateCard';
import { tr } from './candidates.i18n';

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
                            {candidates.pages.map((page) => (
                                <>
                                    {page.total === 0 ? (
                                        <Text>{tr('Nothing found')} 😔</Text>
                                    ) : (
                                        page.items.map((candidate) => (
                                            <CandidateCard candidate={candidate} key={candidate.id} />
                                        ))
                                    )}
                                </>
                            ))}
                            <div ref={ref}>{isFetching && <Text>{tr('Loading candidates')} ⏳</Text>}</div>
                        </>
                    );
                }}
            </QueryResolver>
        </Stack>
    );
};
