import { LayoutMain } from '../components/layout/LayoutMain';
import { AnalyticsFilterMenuBar } from '../components/analytics/AnalyticsFilterMenuBar';
import { Paths } from '../utils/paths';

import { tr } from './controllers.i18n';

export type HireStreamPageProps = {
    stringIds?: { hireStream: true };
};

export const AnalyticsHireStreamPage = ({ stringIds }: HireStreamPageProps) => {
    return (
        <LayoutMain
            pageTitle={`${tr('Hiring by section type')} ${stringIds?.hireStream}`}
            aboveContainer={<AnalyticsFilterMenuBar />}
            backlink={Paths.ANALYTICS}
        />
    );
};
