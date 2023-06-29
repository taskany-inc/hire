import { InterviewEventWithRelations } from '../backend/modules/interview-event/interview-event-types';
import { InterviewHistory } from '../components/interviews/InterviewHistory/InterviewHistory';
import { LayoutMain } from '../components/layout/LayoutMain';

import { tr } from './controllers.i18n';

export type InterviewHistoryPageProps = {
    interviewHistory: InterviewEventWithRelations[];
};

const InterviewHistoryPage = ({ interviewHistory }: InterviewHistoryPageProps) => (
    <LayoutMain pageTitle={tr('History of changes')}>
        <InterviewHistory interviewHistory={interviewHistory} />
    </LayoutMain>
);

export default InterviewHistoryPage;
