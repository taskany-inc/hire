import { LayoutMain } from '../LayoutMain/LayoutMain';
import { VacancyFilterBar } from '../VacancyFilterBar/VacancyFilterBar';
import { VacancyList } from '../VacancyList/VacancyList';

import { tr } from './VacanciesPage.i18n';

export const VacanciesPage = () => {
    return (
        <LayoutMain pageTitle={tr('Vacancies')} aboveContainer={<VacancyFilterBar />}>
            <VacancyList />
        </LayoutMain>
    );
};
