import { Paths } from '../../utils/paths';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { HiringBySectionType } from '../HiringBySectionType/HiringBySectionType';
import { GradesByInterviewer } from '../GradesByInterviewer/GradesByInterviewer';
import { AnalyticsFilterBar } from '../AnalyticsFilterBar/AnalyticsFilterBar';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { useHireStreams } from '../../modules/hireStreamsHooks';

import { tr } from './AnalyticsHireStreamPage.i18n';
import s from './AnalyticsHireStreamPage.module.css';

export interface HireStreamPageProps {
    stringIds: Record<'hireStream', string>;
}

export const AnalyticsHireStreamPage = ({ stringIds }: HireStreamPageProps) => {
    const hireStreamsQuery = useHireStreams();

    return (
        <QueryResolver queries={[hireStreamsQuery]}>
            {([hireStreams]) => (
                <LayoutMain
                    pageTitle={`${tr('Hiring by section type')} ${stringIds.hireStream}`}
                    filterBar={<AnalyticsFilterBar hireStreams={hireStreams} title={tr('Hiring by section type')} />}
                    backlink={Paths.ANALYTICS}
                >
                    <div className={s.AnalyticsHireStreamPage}>
                        <HiringBySectionType hireStreamName={stringIds.hireStream} />
                        <GradesByInterviewer hireStreamName={stringIds.hireStream} />
                    </div>
                </LayoutMain>
            )}
        </QueryResolver>
    );
};
