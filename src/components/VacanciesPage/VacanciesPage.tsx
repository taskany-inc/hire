import { LayoutMain } from '../LayoutMain';
import { VacancyList } from '../VacancyList/VacancyList';

import { tr } from './VacanciesPage.i18n';

export const VacanciesPage = () => {
    return (
        <LayoutMain pageTitle={tr('Vacancies')}>
            <VacancyList />
        </LayoutMain>
    );
};
