import { Paths } from '../../utils/paths';
import { LayoutMain } from '../LayoutMain';
import { HiringBySectionType } from '../HiringBySectionType/HiringBySectionType';
import { GradesByInterviewer } from '../GradesByInterviewer/GradesByInterviewer';
import { AnalyticsFilterContextProvider } from '../../contexts/analyticsFilterContext';
import { AnalyticsFilterMenuBar } from '../AnalyticsFilterMenuBar/AnalyticsFilterMenuBar';

import { tr } from './AnalyticsHireStreamPage.i18n';

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
