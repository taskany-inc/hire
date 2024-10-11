import { Switch, SwitchControl } from '@taskany/bricks/harmony';
import { useCallback, useState } from 'react';
import { nullable } from '@taskany/bricks';

import { HistorySubject } from '../../modules/historyEventTypes';
import { trpc } from '../../trpc/trpcClient';
import { HistoryRecord } from '../HistoryRecord/HistoryRecord';

import s from './SectionActivity.module.css';
import { tr } from './SectionActivity.i18n';

interface SectionActivityProps {
    interviewId: number;
    sectionId: number;
    problemSolution: React.ReactNode;
}

type AllowedTabs = 'history' | 'activity';

export const SectionActivity = ({ sectionId, problemSolution }: SectionActivityProps) => {
    const [activeTab, setActiveTab] = useState<AllowedTabs>('activity');

    const historyEventsQuery = trpc.historyEvents.getHistoryEvents.useQuery({
        subject: HistorySubject.SECTION,
        subjectId: String(sectionId),
    });

    const historyEvents = historyEventsQuery.data ?? [];

    const handleTabChange = useCallback((_: React.SyntheticEvent<HTMLButtonElement>, active: string) => {
        setActiveTab(active as AllowedTabs);
    }, []);

    const events = historyEventsQuery.data ?? [];

    return (
        <div className={s.ActivityPageContainer}>
            <Switch className={s.Switch} name="interviewTabs" value="activity" animated onChange={handleTabChange}>
                <SwitchControl className={s.ActivityTab} value="activity" count={events.length} text={tr('Problems')} />
                <SwitchControl
                    className={s.ActivityTab}
                    value="history"
                    count={historyEvents.length}
                    text={tr('History')}
                />
            </Switch>
            {nullable(
                activeTab === 'activity',
                () => problemSolution,
                <div className={s.ActivityContainer}>
                    {events.map((event) => (
                        <HistoryRecord key={event.id} event={event} />
                    ))}
                </div>,
            )}
        </div>
    );
};
