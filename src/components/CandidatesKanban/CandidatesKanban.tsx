import React, { ComponentProps, FC, ReactNode, useCallback, useMemo, useState } from 'react';
import { Badge, Counter, KanbanColumn, KanbanContainer, KanbanScroller } from '@taskany/bricks/harmony';
import { nullable, useIntersectionLoader } from '@taskany/bricks';
import { InterviewStatus } from '@prisma/client';
import { IconExpandAltSolid } from '@taskany/icons';

import { CandidateWithVendorAndInterviewWithSectionsWithCommentsWithCreatorRelations } from '../../modules/candidateTypes';
import { InterviewWithHireStreamAndSectionsAndCreatorAndCommentsRelation } from '../../modules/interviewTypes';
import {
    useCandidateFilterUrlParams,
    candidateFilterValuesToRequestData,
} from '../../hooks/useCandidateFilterUrlParams';
import { useOnChangeRef } from '../../hooks/useOnChangeRef';
import { useCandidates } from '../../modules/candidateHooks';
import { useSession } from '../../contexts/appSettingsContext';
import { statuses } from '../../utils/statuses';
import { trpc } from '../../trpc/trpcClient';
import { CandidateKanbanCard } from '../CandidateKanbanCard/CandidateKanbanCard';
import { Loader } from '../Loader/Loader';
import { HireStreamCollapsableItem } from '../HireStreamCollapsableItem/HireStreamCollapsableItem';
import { InterviewHireState } from '../InterviewHireState';
import { InterviewSectionState } from '../InterviewSectionState';
import { useSectionTypes } from '../../modules/sectionTypeHooks';
import { Link } from '../Link';
import { pageHrefs } from '../../utils/paths';

import s from './CandidatesKanban.module.css';

const columnLimit = 7;
const intersectionOptions = {
    root: null,
    rootMargin: '0px 0px 300px',
};

type LoadingState = 'loading' | 'ready' | 'loaded';
type onLoadingStateChange = (state: LoadingState) => void;

interface KanbanBaseProps {
    onLoadingStateChange?: onLoadingStateChange;
}

interface SectionsKanbanProps extends KanbanBaseProps {
    hireStreamId: number;
    status: InterviewStatus;
}

interface StatusesKanbanProps extends KanbanBaseProps {
    hireStreamId: number;
    hireStreamName: string;
    statuses: InterviewStatus[];
}

interface KanbanColumnsProps extends KanbanBaseProps {
    status: InterviewStatus;
    header: (counter: ReactNode) => ReactNode;
    hireStreamId: number;
    sectionTypeId?: number;
    renderCard: (
        candidate: CandidateWithVendorAndInterviewWithSectionsWithCommentsWithCreatorRelations,
        interview: InterviewWithHireStreamAndSectionsAndCreatorAndCommentsRelation,
    ) => ReactNode;
}

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

export const CandidatesKanbanColumn: FC<KanbanColumnsProps> = ({
    status,
    header,
    hireStreamId,
    sectionTypeId,
    onLoadingStateChange,
    renderCard,
}) => {
    const { values } = useCandidateFilterUrlParams();

    const { isFetching, hasNextPage, fetchNextPage, data } = useCandidates({
        ...candidateFilterValuesToRequestData(values),
        statuses: [status],
        sectionTypeIds: sectionTypeId ? [sectionTypeId] : undefined,
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
            <div className={s.KanbanColumnTitle}>{header(<Counter count={data?.pages[0]?.count ?? 0} />)}</div>
            {items.map((candidate) => {
                const interview = candidate.interviews.find(
                    (item) => item.hireStreamId === hireStreamId && item.status === status,
                );

                if (!interview) {
                    return null;
                }

                return renderCard(candidate, interview);
            })}
            <div ref={ref} />
        </KanbanColumn>
    );
};

const StatusesKanbanColumn: FC<Omit<KanbanColumnsProps, 'renderCard'>> = ({
    status,
    header,
    hireStreamId,
    onLoadingStateChange,
}) => {
    const session = useSession();
    const gradeVisibility =
        session?.userRoles.admin || session?.userRoles.hiringLead.some((hs) => hs.id === hireStreamId);

    const renderCard = useCallback<ComponentProps<typeof CandidatesKanbanColumn>['renderCard']>(
        (candidate, interview) => {
            const statusComment = interview.comments?.findLast((comment) => comment.status === status);
            const comment =
                statusComment?.status === 'HIRED' || statusComment?.status === 'REJECTED'
                    ? {
                          status: statusComment.status,
                          authors: [statusComment.user],
                          text: statusComment.text,
                      }
                    : undefined;

            const sections = status === 'IN_PROGRESS' ? interview.sections : undefined;

            return (
                <CandidateKanbanCard
                    key={candidate.id}
                    id={candidate.id}
                    title={candidate.name}
                    interviewId={interview.id}
                    createdAt={interview.createdAt}
                    hr={interview.creator}
                    comment={comment}
                    sections={sections}
                    gradeVisibility={gradeVisibility}
                    sectionsResultsVisibility
                />
            );
        },
        [gradeVisibility, status],
    );

    return (
        <CandidatesKanbanColumn
            key={status}
            status={status}
            hireStreamId={hireStreamId}
            header={header}
            onLoadingStateChange={onLoadingStateChange}
            renderCard={renderCard}
        />
    );
};

const StatusesKanban: FC<StatusesKanbanProps> = ({ hireStreamId, statuses, hireStreamName, onLoadingStateChange }) => {
    const [loaders, setLoaders] = useState(
        () => new Map<InterviewStatus, LoadingState>(statuses.map((status) => [status, 'ready'])),
    );

    const tableLoadingState = useMemo(() => calculateCommonLoadingState(loaders), [loaders]);

    useOnChangeRef(tableLoadingState, onLoadingStateChange);

    return (
        <>
            <KanbanContainer className={s.KanbanContainer}>
                {statuses.map((status) => (
                    <StatusesKanbanColumn
                        key={status}
                        status={status}
                        header={(counter) => (
                            <div className={s.StatusesKanbanHeader}>
                                <div className={s.KanbanColumnTitleWrapper}>
                                    <InterviewHireState status={status} />
                                    {counter}
                                </div>
                                {nullable(status === 'IN_PROGRESS', () => (
                                    <Link href={pageHrefs.sectionsDashboard(hireStreamName, status)}>
                                        <Badge
                                            className={s.ShowMore}
                                            iconLeft={<IconExpandAltSolid size="xs" />}
                                            weight="normal"
                                            text="Подробнее"
                                        />
                                    </Link>
                                ))}
                            </div>
                        )}
                        hireStreamId={hireStreamId}
                        onLoadingStateChange={(state) =>
                            setLoaders((map) => {
                                map.set(status, state);

                                return new Map(map);
                            })
                        }
                    />
                ))}
            </KanbanContainer>
            {nullable(tableLoadingState === 'loading', () => (
                <Loader />
            ))}
        </>
    );
};

const SectionsKanbanColumn: FC<Omit<KanbanColumnsProps, 'renderCard'>> = ({
    header,
    status,
    hireStreamId,
    sectionTypeId,
    onLoadingStateChange,
}) => {
    const renderCard = useCallback<ComponentProps<typeof CandidatesKanbanColumn>['renderCard']>(
        (candidate, interview) => (
            <CandidateKanbanCard
                key={candidate.id}
                id={candidate.id}
                title={candidate.name}
                interviewId={interview.id}
                createdAt={interview.createdAt}
                hr={interview.creator}
                sections={interview.sections}
            />
        ),
        [],
    );

    return (
        <CandidatesKanbanColumn
            key={status}
            status={status}
            hireStreamId={hireStreamId}
            sectionTypeId={sectionTypeId}
            header={header}
            onLoadingStateChange={onLoadingStateChange}
            renderCard={renderCard}
        />
    );
};

export const SectionsKanban: FC<SectionsKanbanProps> = ({ hireStreamId, status }) => {
    const { data = [] } = useSectionTypes(hireStreamId);
    const { values } = useCandidateFilterUrlParams();

    const sections = useMemo(
        () =>
            data && values.sectionTypeIds
                ? data.filter((section) => values.sectionTypeIds?.includes(section.id))
                : data,
        [data, values],
    );

    const [loaders, setLoaders] = useState(
        () => new Map<number, LoadingState>(data.map((section) => [section.id, 'ready'])),
    );

    const dashboardLoadingState = useMemo(() => calculateCommonLoadingState(loaders), [loaders]);

    return (
        <>
            <KanbanContainer className={s.KanbanContainer}>
                {sections.map((section) => (
                    <SectionsKanbanColumn
                        key={section.id}
                        status={status}
                        hireStreamId={hireStreamId}
                        sectionTypeId={section.id}
                        header={(counter) => (
                            <div className={s.KanbanColumnTitleWrapper}>
                                <InterviewSectionState value={section.value} title={section.title} />
                                {counter}
                            </div>
                        )}
                        onLoadingStateChange={(state) =>
                            setLoaders((map) => {
                                map.set(section.id, state);

                                return new Map(map);
                            })
                        }
                    />
                ))}
            </KanbanContainer>
            {nullable(dashboardLoadingState === 'loading', () => (
                <Loader />
            ))}
        </>
    );
};

export const CandidatesKanbanList: FC<KanbanBaseProps> = ({ onLoadingStateChange }) => {
    const { values } = useCandidateFilterUrlParams();
    const { data = [] } = trpc.hireStreams.getAllowed.useQuery();

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
        <KanbanScroller shadow={40} className={s.CandidatesKanbanScroller}>
            {rows.map((stream, i) => (
                <HireStreamCollapsableItem
                    key={stream.id}
                    name={stream.name}
                    displayName={stream.displayName}
                    visible={i === 0}
                >
                    <StatusesKanban
                        hireStreamId={stream.id}
                        hireStreamName={stream.name}
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
        </KanbanScroller>
    );
};
