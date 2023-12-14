import { FiltersApplied } from '@taskany/bricks';
import { useMemo } from 'react';
import { Tag, User, ProblemDifficulty } from 'prisma/prisma-client';
import { gray7 } from '@taskany/colors';

import { tr } from './ProblemFilterApplied.i18n';

type ProblemFilterAppliedProps = {
    authors?: User[];
    authorIds?: number[];
    difficulty?: ProblemDifficulty[];
    tags?: Tag[];
    tagIds?: number[];
};

export const ProblemFilterApplied = ({ difficulty, tags, tagIds, authorIds, authors }: ProblemFilterAppliedProps) => {
    const filterAppliedString = useMemo(() => {
        let result = '';

        if (tags?.length && tagIds?.length) {
            result = `${
                result +
                tr('Tags: ') +
                tags
                    .filter((tag) => tagIds?.includes(tag.id))
                    .map((t) => t.name)
                    .join(', ')
            }. `;
        }

        if (difficulty?.length) {
            result = `${result + tr('Difficulty: ') + difficulty.join(', ')}. `;
        }

        if (authors?.length && authorIds?.length) {
            result = `${
                result +
                tr('Authors: ') +
                authors
                    .filter((author) => authorIds?.includes(author.id))
                    .map((a) => a.name || a.email)
                    .join(', ')
            }. `;
        }
        return result;
    }, [authors, authorIds, difficulty, tags, tagIds]);

    return (
        <FiltersApplied size="s" weight="bold" color={gray7}>
            {filterAppliedString}
        </FiltersApplied>
    );
};
