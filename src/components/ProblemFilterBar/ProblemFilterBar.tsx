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
    FilterPopup,
    nullable,
} from '@taskany/bricks';
import styled from 'styled-components';
import { Button } from '@taskany/bricks/harmony';

import { useProblemCount } from '../../modules/problemHooks';
import { mapEnum } from '../../utils';
import { Filter } from '../Filter';
import { trpc } from '../../trpc/trpcClient';
import { ProblemFilterApplied } from '../ProblemFilterApplied/ProblemFilterApplied';
import { suggestionsTake, useQueryOptions } from '../../utils/suggestions';
import { useSession } from '../../contexts/appSettingsContext';
import { FilterBarAddButton } from '../FilterBarAddButton';
import { Paths } from '../../utils/paths';
import { useProblemFilterUrlParams } from '../../hooks/useProblemFilterUrlParams';

import { tr } from './ProblemFilterBar.i18n';
import s from './ProblemFilterBar.module.css';

interface ProblemFilterBarProps {
    embedded?: boolean;
    loading?: boolean;
    children?: ReactNode;
}

const StyledFilterBarAddButton = styled(FilterBarAddButton)`
    margin-left: 10px;
`;

export const ProblemFilterBar = ({ embedded, loading, children }: ProblemFilterBarProps) => {
    const session = useSession();
    const filterNodeRef = useRef<HTMLSpanElement>(null);
    const [filterVisible, setFilterVisible] = useState(false);
    const { values, setter, setSearch, clearParams } = useProblemFilterUrlParams();

    const [difficultyFilter, setDifficultyFilter] = useState(values.difficulty);
    const [tagFilter, setTagFilter] = useState(values.tag);
    const [authorFilter, setAuthorFilter] = useState(values.author ?? []);

    const [tagQuery, setTagQuery] = useState<string>('');
    const [authorQuery, setAuthorQuery] = useState<string>('');

    const problemCountQuery = useProblemCount({
        search: values.search,
        difficulty: values.difficulty as ProblemDifficulty[],
        tagIds: values.tag,
        authorIds: values.author,
    });

    const difficulties = mapEnum(ProblemDifficulty, (key) => key);

    const isFiltersEmpty = !difficultyFilter && !tagFilter && !authorFilter.length;

    const onApplyClick = useCallback(() => {
        setter('author', authorFilter);
        setter('difficulty', difficultyFilter);
        setter('tag', tagFilter);
        setFilterVisible(false);
        setTagQuery('');
        setAuthorQuery('');
    }, [setter, authorFilter, difficultyFilter, tagFilter]);

    const { data: tags = [] } = trpc.tags.suggestions.useQuery(
        { query: tagQuery, take: suggestionsTake, include: tagFilter },
        useQueryOptions,
    );
    const { data: authors = [] } = trpc.users.suggestions.useQuery(
        {
            query: authorQuery,
            take: suggestionsTake - 1,
            include: session ? [session.user.id, ...authorFilter] : authorFilter,
        },
        useQueryOptions,
    );

    const onResetFilers = () => {
        setTagQuery('');
        setAuthorQuery('');
        clearParams();
    };

    return (
        <>
            <FiltersPanelContainer loading={loading}>
                <FiltersPanelContent>
                    <FiltersSearchContainer>
                        <Input
                            placeholder={tr('Search')}
                            defaultValue={values.search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
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
                    <Button className={s.ProblemFilterBarResetButton} text="Reset" onClick={onResetFilers} />
                    {!embedded && <StyledFilterBarAddButton text={tr('Add problem')} link={Paths.PROBLEMS_NEW} />}
                </FiltersPanelContent>
            </FiltersPanelContainer>
            {nullable(!isFiltersEmpty, () => (
                <ProblemFilterApplied
                    tags={tags}
                    tagIds={values.tag}
                    difficulty={values.difficulty as ProblemDifficulty[]}
                    authors={authors}
                    authorIds={values.author}
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
                    value={tagFilter?.map(String)}
                    items={tags.map((tag) => ({ id: String(tag.id), name: tag.name }))}
                    filterCheckboxName="difficulty"
                    onChange={(v) => setTagFilter(v.map(Number))}
                    onSearchChange={setTagQuery}
                    viewMode="split"
                />
                <Filter
                    title={tr('Suggestions')}
                    tabName="author"
                    label={tr('Author')}
                    placeholder={tr('Search')}
                    value={authorFilter?.map(String)}
                    items={authors.map((author) => ({
                        id: String(author.id),
                        name: `${author.name || author.email} ${author.id === session?.user.id ? tr('(You)') : ''}`,
                        email: author.email,
                    }))}
                    filterCheckboxName="author"
                    onChange={(v) => setAuthorFilter(v.map(Number))}
                    onSearchChange={setAuthorQuery}
                    viewMode="split"
                />
            </FilterPopup>
        </>
    );
};
