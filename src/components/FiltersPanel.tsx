import React from 'react';
import styled from 'styled-components';
import { InterviewStatus, User, ProblemDifficulty } from '@prisma/client';
import { gapM, gapS, gray5 } from '@taskany/colors';
import { nullable } from '@taskany/bricks/utils/nullable';
import { Input, Badge } from '@taskany/bricks';

import { useTags } from '../hooks/tag-hooks';

import { ProblemAuthorFilter } from './ProblemAuthorFilter';
import { DifficultyFilterDropdown } from './DifficultyFilterDropdown';
import { TagFilterDropdown } from './TagFilterDropdown';
import { HireStreamFilterDropdown } from './HireStreamFilterDropdown';
import { InterviewStatusFilterDropdown } from './InterviewStatusFilterDropdown';
import { FiltersMenuItem } from './FiltersMenuItem';
import { AnaliticsPeriodFilterDropdown } from './AnaliticsPeriodFilterDropdown';

import { tr } from './components.i18n';

interface FiltersPanelProps {
    count?: number;
    streams?: React.ComponentProps<typeof HireStreamFilterDropdown>['streams'];
    statuses?: React.ComponentProps<typeof InterviewStatusFilterDropdown>['statuses'];
    author?: User | null;

    periods?: Array<string>;
    difficulties?: Array<ProblemDifficulty>;
    difficultyFilter?: ProblemDifficulty;
    tagsFilter?: Array<number>;
    streamFilter?: React.ComponentProps<typeof HireStreamFilterDropdown>['value'];
    statusFilter?: Array<InterviewStatus>;
    searchFilter?: string;
    periodFilter?: string;
    children?: React.ReactNode;

    onClearFilters?: () => void;

    onAuthorChange?: React.ComponentProps<typeof ProblemAuthorFilter>['onChange'];
    onSearchChange?: React.ComponentProps<typeof Input>['onChange'];
    onStatusChange?: React.ComponentProps<typeof InterviewStatusFilterDropdown>['onChange'];
    onDifficultyChange?: React.ComponentProps<typeof DifficultyFilterDropdown>['onChange'];
    onStreamChange?: React.ComponentProps<typeof HireStreamFilterDropdown>['onChange'];
    onTagChange?: React.ComponentProps<typeof TagFilterDropdown>['onChange'];
    onPeriodChange?: React.ComponentProps<typeof AnaliticsPeriodFilterDropdown>['onChange'];
}

const StyledFiltersPanel = styled.div`
    margin: ${gapM} 0;
    padding: ${gapS} 0;

    background-color: ${gray5};
`;

const StyledFiltersContent = styled.div`
    padding: 10px 40px 0;
    padding-top: 0;

    display: grid;
    grid-template-columns: 2fr 9fr 1fr;
    align-items: center;
`;

const StyledFiltersMenuWrapper = styled.div`
    display: flex;
    align-items: center;

    padding-left: ${gapS};
`;

const StyledFiltersMenu = styled.div`
    padding-left: ${gapM};
`;

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
    count,
    statuses,
    streams,
    author,
    difficulties,
    periods,
    streamFilter,
    difficultyFilter,
    periodFilter,
    tagsFilter,
    searchFilter,
    statusFilter,
    onPeriodChange,
    onStatusChange,
    onSearchChange,
    onDifficultyChange,
    onStreamChange,
    onTagChange,
    onAuthorChange,
    onClearFilters,
    children,
}) => {
    const tagsQuery = useTags();

    return (
        <StyledFiltersPanel>
            <StyledFiltersContent>
                <Input
                    disabled={!onSearchChange}
                    placeholder={tr('Search')}
                    value={searchFilter}
                    onChange={onSearchChange}
                />

                <StyledFiltersMenuWrapper>
                    {nullable(count, () => (
                        <Badge size="m">{count}</Badge>
                    ))}

                    <StyledFiltersMenu>
                        {nullable(onClearFilters, (onClearFilters) => (
                            <FiltersMenuItem onClick={onClearFilters}>All</FiltersMenuItem>
                        ))}

                        {nullable(statuses, (statuses) => (
                            <InterviewStatusFilterDropdown
                                text={tr('Status')}
                                statuses={statuses}
                                value={statusFilter}
                                onChange={onStatusChange}
                            />
                        ))}

                        {nullable(difficulties, (d) => (
                            <DifficultyFilterDropdown
                                text={tr('Difficulty')}
                                difficulties={d}
                                value={difficultyFilter}
                                onChange={onDifficultyChange}
                            />
                        ))}
                        {nullable(streams, (s) => (
                            <HireStreamFilterDropdown
                                text={tr('Hire streams')}
                                streams={s}
                                value={streamFilter}
                                onChange={onStreamChange}
                            />
                        ))}
                        {tagsFilter && onTagChange && tagsQuery.data && (
                            <TagFilterDropdown
                                text={tr('Tags')}
                                value={tagsFilter}
                                tags={tagsQuery.data ?? []}
                                onChange={onTagChange}
                            />
                        )}
                        {nullable(onAuthorChange, (onAuthorChange) => (
                            <ProblemAuthorFilter author={author} onChange={onAuthorChange} />
                        ))}
                        {nullable(periods, (periods) => (
                            <AnaliticsPeriodFilterDropdown
                                periods={periods}
                                value={periodFilter}
                                onChange={onPeriodChange}
                            />
                        ))}
                    </StyledFiltersMenu>
                </StyledFiltersMenuWrapper>

                {nullable(children, (ch) => (
                    <div style={{ textAlign: 'right' }}>{ch}</div>
                ))}
            </StyledFiltersContent>
        </StyledFiltersPanel>
    );
};
