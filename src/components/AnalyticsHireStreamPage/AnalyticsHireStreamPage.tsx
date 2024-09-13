import { Paths } from '../../utils/paths';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { HiringBySectionType } from '../HiringBySectionType/HiringBySectionType';
import { GradesByInterviewer } from '../GradesByInterviewer/GradesByInterviewer';
import { AnalyticsFilterMenuBar } from '../AnalyticsFilterMenuBar/AnalyticsFilterMenuBar';

import { tr } from './AnalyticsHireStreamPage.i18n';
import s from './AnalyticsHireStreamPage.module.css';

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
            <div className={s.AnalyticsHireStreamPage}>
                <HiringBySectionType hireStreamName={stringIds.hireStream} />
                <GradesByInterviewer hireStreamName={stringIds.hireStream} />
            </div>
        </LayoutMain>
    );
};
