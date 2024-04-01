import { FiltersApplied } from '@taskany/bricks';
import { useMemo } from 'react';
import { Tag, User, ProblemDifficulty } from 'prisma/prisma-client';
import { gray7 } from '@taskany/colors';
import styled from 'styled-components';

import { arrayToAppliedString } from '../../utils';

import { tr } from './ProblemFilterApplied.i18n';

interface ProblemFilterAppliedProps {
    authors?: User[];
    authorIds?: number[];
    difficulty?: ProblemDifficulty[];
    tags?: Tag[];
    tagIds?: number[];
}

const StyledApplied = styled(FiltersApplied)`
    position: absolute;
`;

export const ProblemFilterApplied = ({ difficulty, tags, tagIds, authorIds, authors }: ProblemFilterAppliedProps) => {
    const filterAppliedString = useMemo(() => {
        let result = '';

        if (tags?.length && tagIds?.length) {
            result += arrayToAppliedString(tags, tagIds, tr('Tags: '), 'id');
        }

        if (difficulty?.length) {
            result = `${result + tr('Difficulty: ') + difficulty.join(', ')}. `;
        }

        if (authors?.length && authorIds?.length) {
            result += arrayToAppliedString(authors, authorIds, tr('Authors: '), 'id');
        }
        return result;
    }, [authors, authorIds, difficulty, tags, tagIds]);

    return (
        <StyledApplied size="s" weight="bold" color={gray7}>
            {filterAppliedString}
        </StyledApplied>
    );
};
