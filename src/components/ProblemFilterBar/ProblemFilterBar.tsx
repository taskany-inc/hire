import { ProblemDifficulty } from '@prisma/client';
import React, { ReactNode, useCallback, useRef, useState } from 'react';
import {
    FiltersMenuContainer,
    FiltersCounter,
    FiltersCounterContainer,
    FiltersPanelContainer,
    FiltersPanelContent,
    FiltersSearchContainer,
    Input,
    FiltersMenuItem,
    Button,
    FilterPopup,
    nullable,
} from '@taskany/bricks';
import styled from 'styled-components';
import { gapS } from '@taskany/colors';
import { useDebouncedCallback } from 'use-debounce';

import { useProblemCount } from '../../modules/problemHooks';
import { mapEnum } from '../../utils';
import { Filter } from '../Filter';
import { trpc } from '../../trpc/trpcClient';
import { ProblemFilterApplied } from '../ProblemFilterApplied/ProblemFilterApplied';
import { suggestionsTake, useQueryOptions } from '../../utils/suggestions';
import { useSession } from '../../contexts/appSettingsContext';
import { FilterBarAddButton } from '../FilterBarAddButton';
import { Paths } from '../../utils/paths';
import { useQueryParamList } from '../../hooks/useQueryParamList';

import { tr } from './ProblemFilterBar.i18n';

interface ProblemFilterBarProps {
    embedded?: boolean;
    loading?: boolean;
    children?: ReactNode;
}

const StyledFilterBarAddButton = styled(FilterBarAddButton)`
    margin-left: 10px;
`;

const StyledResetButton = styled(Button)`
    margin-left: auto;
    margin-right: ${gapS};
`;

export const ProblemFilterBar = ({ embedded, loading, children }: ProblemFilterBarProps) => {
    const session = useSession();
    const filterNodeRef = useRef<HTMLSpanElement>(null);
    const [filterVisible, setFilterVisible] = useState(false);
    const [getQueryParams, router] = useQueryParamList();

    const [difficultyFilter, setDifficultyFilter] = useState(getQueryParams('difficulty'));
    const [tagFilter, setTagFilter] = useState(getQueryParams('tag'));
    const [authorFilter, setAuthorFilter] = useState(getQueryParams('author'));
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const setQuery = useDebouncedCallback(() => {
        setDebouncedSearch(search);
        router.push({
            query: {
                ...router.query,
                q: search,
                difficulty: difficultyFilter,
                tag: tagFilter,
                author: authorFilter,
            },
        });
    }, 300);

    const onSearchChange = (value: string) => {
        setQuery();
        setSearch(value);
    };

    const [tagQuery, setTagQuery] = useState<string>('');
    const [authorQuery, setAuthorQuery] = useState<string>('');

    const authorIds = getQueryParams('author').map(Number);
    const tagIds = getQueryParams('tag').map(Number);
    const difficulty = getQueryParams('difficulty') as ProblemDifficulty[];

    const problemCountQuery = useProblemCount({
        search: debouncedSearch,
        difficulty,
        tagIds,
        authorIds,
    });

    const difficulties = mapEnum(ProblemDifficulty, (key) => key);
    const isFiltersEmpty = !difficulty && !tagIds.length && !authorIds.length;
    const onApplyClick = useCallback(() => {
        router.push({
            query: {
                ...router.query,
                q: search,
                difficulty: difficultyFilter,
                tag: tagFilter,
                author: authorFilter,
            },
        });
        setFilterVisible(false);
        setTagQuery('');
        setAuthorQuery('');
    }, [router, search, difficultyFilter, tagFilter, authorFilter]);

    const { data: tags = [] } = trpc.tags.suggestions.useQuery(
        { query: tagQuery, take: suggestionsTake, include: tagFilter.map((id) => Number(id)) },
        useQueryOptions,
    );
    const { data: authors = [] } = trpc.users.suggestions.useQuery(
        {
            query: authorQuery,
            take: suggestionsTake - 1,
            include: session
                ? [session.user.id, ...authorFilter.map((id) => Number(id))]
                : authorFilter.map((id) => Number(id)),
        },
        useQueryOptions,
    );

    const onResetFilers = () => {
        setTagQuery('');
        setAuthorQuery('');
        setDifficultyFilter([]);
        setTagFilter([]);
        setAuthorFilter([]);
    };

    return (
        <>
            <FiltersPanelContainer loading={loading}>
                <FiltersPanelContent>
                    <FiltersSearchContainer>
                        <Input placeholder={tr('Search')} onChange={(e) => onSearchChange(e.target.value)} />
                    </FiltersSearchContainer>
                    <FiltersCounterContainer>
                        <FiltersCounter
                            total={problemCountQuery.data?.total || 0}
                            counter={problemCountQuery.data?.count}
                        />
                    </FiltersCounterContainer>
                    <FiltersMenuContainer>
                        <FiltersMenuItem
                            ref={filterNodeRef}
                            active={!isFiltersEmpty}
                            onClick={() => setFilterVisible((p) => !p)}
                        >
                            {tr('Filter')}
                        </FiltersMenuItem>
                        {children}
                    </FiltersMenuContainer>
                    <StyledResetButton text="Reset" onClick={onResetFilers} />
                    {!embedded && <StyledFilterBarAddButton text={tr('Add problem')} link={Paths.PROBLEMS_NEW} />}
                </FiltersPanelContent>
            </FiltersPanelContainer>
            {nullable(!isFiltersEmpty, () => (
                <ProblemFilterApplied
                    tags={tags}
                    tagIds={tagIds}
                    difficulty={difficulty}
                    authors={authors}
                    authorIds={authorIds}
                />
            ))}
            <FilterPopup
                applyButtonText={tr('Apply')}
                cancelButtonText={tr('Cancel')}
                visible={filterVisible}
                onApplyClick={onApplyClick}
                filterRef={filterNodeRef}
                switchVisible={setFilterVisible}
                activeTab="state"
            >
                <Filter
                    tabName="difficulty"
                    label={tr('Dificulty')}
                    value={difficultyFilter}
                    items={difficulties.map((dif) => ({ id: dif, name: dif }))}
                    filterCheckboxName="difficulty"
                    onChange={setDifficultyFilter}
                    viewMode="union"
                />
                <Filter
                    title={tr('Suggestions')}
                    tabName="tags"
                    label={tr('Tags')}
                    placeholder={tr('Search')}
                    value={tagFilter}
                    items={tags.map((tag) => ({ id: String(tag.id), name: tag.name }))}
                    filterCheckboxName="difficulty"
                    onChange={setTagFilter}
                    onSearchChange={setTagQuery}
                    viewMode="split"
                />
                <Filter
                    title={tr('Suggestions')}
                    tabName="author"
                    label={tr('Author')}
                    placeholder={tr('Search')}
                    value={authorFilter}
                    items={authors.map((author) => ({
                        id: String(author.id),
                        name: `${author.name || author.email} ${author.id === session?.user.id ? tr('(You)') : ''}`,
                        email: author.email,
                    }))}
                    filterCheckboxName="author"
                    onChange={setAuthorFilter}
                    onSearchChange={setAuthorQuery}
                    viewMode="split"
                />
            </FilterPopup>
        </>
    );
};
