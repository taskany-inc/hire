import { VacancyFilterContextProvider } from '../../contexts/vacancyFilterContext';
import { LayoutMain } from '../LayoutMain';
import { VacancyFilterBar } from '../VacancyFilterBar/VacancyFilterBar';
import { VacancyList } from '../VacancyList/VacancyList';

import { tr } from './VacanciesPage.i18n';

export const VacanciesPage = () => {
    return (
        <VacancyFilterContextProvider>
            <LayoutMain pageTitle={tr('Vacancies')} aboveContainer={<VacancyFilterBar />}>
                <VacancyList />
            </LayoutMain>
        </VacancyFilterContextProvider>
    );
};
