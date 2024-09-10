import { Fragment } from 'react';
import { nullable } from '@taskany/bricks';
import { gapL } from '@taskany/colors';
import { Button, Text } from '@taskany/bricks/harmony';

import { useVacancies } from '../../modules/crewHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { Stack } from '../Stack';
import { VacancyCard } from '../VacancyCard/VacancyCard';
import { useVacancyFilterUrlParams, vacancyFilterValuesToRequestData } from '../../hooks/useVacancyFilterUrlParams';
import { Vacancy } from '../../modules/crewTypes';

import { tr } from './VacancyList.i18n';
import s from './VacancyList.module.css';

interface VacancyListProps {
    onSelect?: (vacancy: Vacancy) => void;
}

export const VacancyList = ({ onSelect }: VacancyListProps) => {
    const { values } = useVacancyFilterUrlParams();
    const vacanciesQuery = useVacancies(vacancyFilterValuesToRequestData(values));
    const { isLoading, hasNextPage, fetchNextPage } = vacanciesQuery;

    return (
        <QueryResolver queries={[vacanciesQuery]}>
            {([{ pages }]) => (
                <Stack direction="column" gap={gapL} className={s.VacancyListCards}>
                    {pages.map((page, i) => (
                        <Fragment key={i}>
                            {nullable(page.count === 0, () => (
                                <Text>{tr('Nothing found')}</Text>
                            ))}
                            {page.vacancies.map((vacancy) => (
                                <VacancyCard key={vacancy.id} vacancy={vacancy} onSelect={onSelect} />
                            ))}
                        </Fragment>
                    ))}
                    {nullable(hasNextPage, () => (
                        <Button
                            className={s.VacancyListLoadMoreButton}
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
