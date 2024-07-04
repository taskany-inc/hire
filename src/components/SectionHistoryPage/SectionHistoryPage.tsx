import { HistorySubject } from '../../modules/historyEventTypes';
import { trpc } from '../../trpc/trpcClient';
import { HistoryRecord } from '../HistoryRecord/HistoryRecord';
import { LayoutMain } from '../LayoutMain/LayoutMain';

import s from './SectionHistoryPage.module.css';
import { tr } from './SectionHistoryPage.i18n';

interface SectionHistoryPageProps {
    interviewId: number;
    sectionId: number;
}

export const SectionHistoryPage = ({ sectionId }: SectionHistoryPageProps) => {
    const historyEventsQuery = trpc.historyEvents.getHistoryEvents.useQuery({
        subject: HistorySubject.SECTION,
        subjectId: String(sectionId),
    });

    const events = historyEventsQuery.data ?? [];

    return (
        <LayoutMain pageTitle={tr('History of changes')}>
            <div className={s.SectionHistoryPageContainer}>
                {events.map((event) => (
                    <HistoryRecord key={event.id} event={event} />
                ))}
            </div>
        </LayoutMain>
    );
};
