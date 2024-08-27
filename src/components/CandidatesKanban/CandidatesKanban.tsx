import { FC, useMemo, useState } from 'react';
import { KanbanColumn, KanbanContainer } from '@taskany/bricks/harmony';
import { InterviewStatus } from '@prisma/client';

import {
    useCandidateFilterUrlParams,
    candidateFilterValuesToRequestData,
} from '../../hooks/useCandidateFilterUrlParams';
import { useIntersectionLoader } from '../../hooks/useIntersectionLoader';
import { useOnChangeRef } from '../../hooks/useOnChangeRef';
import { useCandidates } from '../../modules/candidateHooks';
import { statuses } from '../../utils/statuses';
import { trpc } from '../../trpc/trpcClient';
import { CandidateKanbanCard, CandidateKanbanCardComment } from '../CandidateKanbanCard/CandidateKanbanCard';
import { HireStreamCollapsableItem } from '../HireStreamCollapsableItem/HireStreamCollapsableItem';
import { InterviewHireState } from '../InterviewHireState';

import s from './CandidatesKanban.module.css';

const columnLimit = 7;
const intersectionOptions = {
    root: null,
    rootMargin: '0px 0px 300px',
};

type LoadingState = 'loading' | 'ready' | 'loaded';
type onLoadingStateChange = (state: LoadingState) => void;

const calculateCommonLoadingState = (map: Map<unknown, LoadingState>): LoadingState => {
    const loadingStates = new Set(map.values());

    if (loadingStates.has('loading')) {
        return 'loading';
    }

    if (loadingStates.size === 1 && loadingStates.has('loaded')) {
        return 'loaded';
    }
    return 'ready';
};

export const CandidatesKanbanColumn: FC<{
    status: InterviewStatus;
    hireStreamId: number;
    onLoadingStateChange: onLoadingStateChange;
}> = ({ status, hireStreamId, onLoadingStateChange }) => {
    const { values } = useCandidateFilterUrlParams();

    const { isFetching, hasNextPage, fetchNextPage, data } = useCandidates({
        ...candidateFilterValuesToRequestData(values),
        statuses: [status],
        hireStreamIds: [hireStreamId],
        limit: columnLimit,
    });

    const loadingState = useMemo(() => {
        if (isFetching) {
            return 'loading';
        }
        if (hasNextPage) {
            return 'ready';
        }
        return 'loaded';
    }, [isFetching, hasNextPage]);

    useOnChangeRef(loadingState, onLoadingStateChange);

    const items = useMemo(() => {
        const pages = data?.pages || [];
        const items = pages[0]?.items;

        return pages.reduce<typeof items>((acc, cur) => {
            acc.push(...cur.items);

            return acc;
        }, []);
    }, [data]);

    const ref = useIntersectionLoader<HTMLDivElement>(
        () => fetchNextPage(),
        Boolean(!isFetching && hasNextPage),
        intersectionOptions,
    );

    return (
        <KanbanColumn>
            <div className={s.KanbanColumnTitle}>
                <InterviewHireState status={status} />
            </div>
            {items.map((candidate) => {
                const interview = candidate.interviews.find(
                    (item) => item.hireStreamId === hireStreamId && item.status === status,
                );

                if (!interview) {
                    return null;
                }

                const statusComment = interview.comments?.findLast((comment) => comment.status === status);
                const statusCommentNode =
                    statusComment?.status === 'HIRED' || statusComment?.status === 'REJECTED' ? (
                        <CandidateKanbanCardComment
                            status={statusComment.status}
                            author={statusComment.user}
                            text={statusComment.text}
                        />
                    ) : undefined;

                return (
                    <CandidateKanbanCard
                        key={candidate.id}
                        id={candidate.id}
                        title={candidate.name}
                        interviewId={interview.id}
                        createdAt={interview.createdAt}
                        hr={interview.creator}
                        comment={statusCommentNode}
                    />
                );
            })}
            <div ref={ref} />
        </KanbanColumn>
    );
};

const CandidatesKanban: FC<{
    streamId: number;
    statuses: InterviewStatus[];
    onLoadingStateChange?: onLoadingStateChange;
}> = ({ streamId, statuses, onLoadingStateChange }) => {
    const [loaders, setLoaders] = useState(
        () => new Map<InterviewStatus, LoadingState>(statuses.map((status) => [status, 'ready'])),
    );

    const tableLoadingState = useMemo(() => calculateCommonLoadingState(loaders), [loaders]);

    useOnChangeRef(tableLoadingState, onLoadingStateChange);

    return (
        <KanbanContainer className={s.KanbanContainer}>
            {statuses.map((status) => (
                <CandidatesKanbanColumn
                    key={status}
                    status={status}
                    hireStreamId={streamId}
                    onLoadingStateChange={(state) =>
                        setLoaders((map) => {
                            map.set(status, state);

                            return new Map(map);
                        })
                    }
                />
            ))}
        </KanbanContainer>
    );
};

export const CandidatesKanbanList: FC<{ onLoadingStateChange?: onLoadingStateChange }> = ({ onLoadingStateChange }) => {
    const { values } = useCandidateFilterUrlParams();
    const { data = [] } = trpc.hireStreams.getManaged.useQuery();

    const [loaders, setLoaders] = useState(
        () => new Map<number, LoadingState>(data.map((stream) => [stream.id, 'ready'])),
    );

    const dashboardLoadingState = useMemo(() => calculateCommonLoadingState(loaders), [loaders]);

    useOnChangeRef(dashboardLoadingState, onLoadingStateChange);

    const { rows, columns } = useMemo(
        () => ({
            rows:
                data && values.hireStreamIds
                    ? data.filter((stream) => values.hireStreamIds?.includes(stream.id))
                    : data,
            columns:
                data && values.statuses ? statuses.filter((status) => values.statuses?.includes(status)) : statuses,
        }),
        [data, values],
    );

    return (
        <>
            {rows.map((stream, i) => (
                <HireStreamCollapsableItem key={stream.id} id={stream.id} name={stream.name} visible={i === 0}>
                    <CandidatesKanban
                        streamId={stream.id}
                        statuses={columns}
                        onLoadingStateChange={(state) =>
                            setLoaders((map) => {
                                map.set(stream.id, state);

                                return new Map(map);
                            })
                        }
                    />
                </HireStreamCollapsableItem>
            ))}
        </>
    );
};