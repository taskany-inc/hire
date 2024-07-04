import { Paths } from '../../utils/paths';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { HiringBySectionType } from '../HiringBySectionType/HiringBySectionType';
import { GradesByInterviewer } from '../GradesByInterviewer/GradesByInterviewer';
import { AnalyticsFilterMenuBar } from '../AnalyticsFilterMenuBar/AnalyticsFilterMenuBar';

import { tr } from './AnalyticsHireStreamPage.i18n';

export interface HireStreamPageProps {
    stringIds: Record<'hireStream', string>;
}

export const AnalyticsHireStreamPage = ({ stringIds }: HireStreamPageProps) => {
    return (
        <LayoutMain
            pageTitle={`${tr('Hiring by section type')} ${stringIds.hireStream}`}
            aboveContainer={<AnalyticsFilterMenuBar />}
            backlink={Paths.ANALYTICS}
        >
            <HiringBySectionType hireStreamName={stringIds.hireStream} />
            <GradesByInterviewer hireStreamName={stringIds.hireStream} />
        </LayoutMain>
    );
};
