import { LayoutMain } from '../components/layout/LayoutMain';
import { AnalyticsFilterMenuBar } from '../components/analytics/AnalyticsFilterMenuBar';
import { Paths } from '../utils/paths';
import { HiringBySectionType } from '../components/analytics/HiringBySectionType';
import { GradesByInterviewer } from '../components/analytics/GradesByInterviewer';
import { AnalyticsFilterContextProvider } from '../contexts/analytics-filter-context';

import { tr } from './controllers.i18n';

export type HireStreamPageProps = {
    stringIds: Record<'hireStream', string>;
};

export const AnalyticsHireStreamPage = ({ stringIds }: HireStreamPageProps) => {
    return (
        <AnalyticsFilterContextProvider>
            <LayoutMain
                pageTitle={`${tr('Hiring by section type')} ${stringIds.hireStream}`}
                aboveContainer={<AnalyticsFilterMenuBar />}
                backlink={Paths.ANALYTICS}
            >
                <HiringBySectionType hireStreamName={stringIds.hireStream} />
                <GradesByInterviewer hireStreamName={stringIds.hireStream} />
            </LayoutMain>
        </AnalyticsFilterContextProvider>
    );
};
