import { accessChecks } from '../../../backend/access/access-checks';
import { AnalyticsFilterMenuBar } from '../../../components/analytics/AnalyticsFilterMenuBar';
import { GradesByInterviewer } from '../../../components/analytics/GradesByInterviewer';
import { HiringBySectionType } from '../../../components/analytics/HiringBySectionType';
import { LayoutMain } from '../../../components/layout/LayoutMain';
import { AnalyticsFilterContextProvider } from '../../../contexts/analytics-filter-context';
import { InferServerSideProps } from '../../../types';
import { createGetServerSideProps } from '../../../utils/create-get-ssr-props';
import { Paths } from '../../../utils/paths';

import { tr } from './hire-stream.i18n';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    stringIds: { hireStream: true },
    action: async ({ ssg, session, stringIds, handleAccessChecks }) => {
        await ssg.hireStreams.getByName.fetch({
            hireStreamName: stringIds.hireStream,
        });

        await handleAccessChecks(() => accessChecks.analytics.read(session));
    },
});

export default ({ stringIds }: InferServerSideProps<typeof getServerSideProps>) => {
    return (
        <AnalyticsFilterContextProvider>
            <LayoutMain
                pageTitle={`${tr('Hiring by section type')} ${stringIds.hireStream}`}
                aboveContainer={<AnalyticsFilterMenuBar />}
                backlink={Paths.ANALYTICS}
            />
            <HiringBySectionType hireStreamName={stringIds.hireStream} />
            <GradesByInterviewer hireStreamName={stringIds.hireStream} />
        </AnalyticsFilterContextProvider>
    );
};
