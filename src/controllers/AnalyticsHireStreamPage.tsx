import { LayoutMain } from '../components/layout/LayoutMain';
import { AnalyticsFilterMenuBar } from '../components/analytics/AnalyticsFilterMenuBar';
import { Paths } from '../utils/paths';

import { tr } from './controllers.i18n';

export type HireStreamPageProps = {
    hireStreamName?: string;
};

export const AnalyticsHireStreamPage = ({ hireStreamName }: HireStreamPageProps) => {
    return (
        <LayoutMain
            pageTitle={`${tr('Hiring by section type')} ${hireStreamName}`}
            aboveContainer={<AnalyticsFilterMenuBar />}
            backlink={Paths.ANALYTICS}
        />
    );
};
