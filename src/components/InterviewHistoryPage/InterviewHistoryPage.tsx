import { HistorySubject } from '../../modules/historyEventTypes';
import { trpc } from '../../trpc/trpcClient';
import { HistoryRecord } from '../HistoryRecord/HistoryRecord';
import { LayoutMain } from '../LayoutMain/LayoutMain';

import s from './InterviewHistoryPage.module.css';
import { tr } from './InterviewHistoryPage.i18n';

interface InterviewHistoryPageProps {
    interviewId: number;
}

const InterviewHistoryPage = ({ interviewId }: InterviewHistoryPageProps) => {
    const historyEventsQuery = trpc.historyEvents.getHistoryEvents.useQuery({
        subject: HistorySubject.INTERVIEW,
        subjectId: String(interviewId),
    });

    const events = historyEventsQuery.data ?? [];

    return (
        <LayoutMain pageTitle={tr('History of changes')}>
            <div className={s.InterviewHistoryPageContainer}>
                {events.map((event) => (
                    <HistoryRecord key={event.id} event={event} />
                ))}
            </div>
        </LayoutMain>
    );
};

export default InterviewHistoryPage;
