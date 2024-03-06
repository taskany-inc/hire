import { InterviewEventWithRelations } from '../../modules/interviewEventTypes';
import { InterviewHistory } from '../InterviewHistory';
import { LayoutMain } from '../LayoutMain';

import { tr } from './InterviewHistoryPage.i18n';

export interface InterviewHistoryPageProps {
    interviewHistory: InterviewEventWithRelations[];
}

const InterviewHistoryPage = ({ interviewHistory }: InterviewHistoryPageProps) => (
    <LayoutMain pageTitle={tr('History of changes')}>
        <InterviewHistory interviewHistory={interviewHistory} />
    </LayoutMain>
);

export default InterviewHistoryPage;
