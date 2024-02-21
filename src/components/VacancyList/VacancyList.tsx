import { Fragment } from 'react';
import styled from 'styled-components';
import { Button, Text, nullable } from '@taskany/bricks';
import { gapL } from '@taskany/colors';

import { useVacancies } from '../../modules/crewHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { Stack } from '../Stack';
import { VacancyCard } from '../VacancyCard/VacancyCard';
import { useVacancyFilterContext } from '../../contexts/vacancyFilterContext';

import { tr } from './VacancyList.i18n';

const StyledLoadMoreButton = styled(Button)`
    justify-self: flex-start;
`;

export const VacancyList = () => {
    const { debouncedSearch, statuses, hireStreamIds } = useVacancyFilterContext();
    const vacanciesQuery = useVacancies({
        archived: false,
        statuses,
        search: debouncedSearch,
        hireStreamIds,
    });
    const { isLoading, hasNextPage, fetchNextPage } = vacanciesQuery;

    return (
        <QueryResolver queries={[vacanciesQuery]}>
            {([{ pages }]) => (
                <Stack direction="column" gap={gapL}>
                    {pages.map((page, i) => (
                        <Fragment key={i}>
                            {nullable(page.count === 0, () => (
                                <Text>{tr('Nothing found')}</Text>
                            ))}
                            {page.vacancies.map((vacancy) => (
                                <VacancyCard key={vacancy.id} vacancy={vacancy} />
                            ))}
                        </Fragment>
                    ))}
                    {nullable(hasNextPage, () => (
                        <StyledLoadMoreButton
                            text={tr('Load more')}
                            onClick={() => fetchNextPage()}
                            disabled={isLoading}
                        />
                    ))}
                    {nullable(isLoading, () => (
                        <Text>{tr('Loading vacancies')}</Text>
                    ))}
                </Stack>
            )}
        </QueryResolver>
    );
};
