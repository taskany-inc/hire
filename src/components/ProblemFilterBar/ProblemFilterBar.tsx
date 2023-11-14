import { ProblemDifficulty } from '@prisma/client';
import React, { VFC } from 'react';

import { useProblemFilterContext } from '../../contexts/problemFilterContext';
import { useProblemCount } from '../../modules/problemHooks';
import { mapEnum } from '../../utils';
import { Paths } from '../../utils/paths';
import { FilterBarAddButton } from '../FilterBarAddButton';
import { FiltersPanel } from '../FiltersPanel/FiltersPanel';

import { tr } from './ProblemFilterBar.i18n';

type ProblemFilterBarProps = {
    embedded?: boolean;
};

export const ProblemFilterBar: VFC<ProblemFilterBarProps> = ({ embedded }) => {
    const {
        debouncedSearch,
        setSearch,
        setAuthor,
        difficulty,
        tagIds,
        author,
        setDifficulty,
        clearFilters,
        setTagIds,
    } = useProblemFilterContext();

    const problemCountQuery = useProblemCount({
        search: debouncedSearch,
        difficulty,
        tagIds,
        authorId: author?.id,
    });

    const difficulties = mapEnum(ProblemDifficulty, (key) => key);

    return (
        <FiltersPanel
            onClearFilters={clearFilters}
            onSearchChange={(e) => setSearch(e.target.value)}
            count={problemCountQuery.data}
            tagsFilter={tagIds}
            onTagChange={setTagIds}
            difficultyFilter={difficulty}
            onDifficultyChange={setDifficulty}
            onAuthorChange={setAuthor}
            author={author}
            difficulties={difficulties}
        >
            {!embedded && <FilterBarAddButton text={tr('Add problem')} link={Paths.PROBLEMS_NEW} />}
        </FiltersPanel>
    );
};
