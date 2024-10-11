import { Switch, SwitchControl } from '@taskany/bricks/harmony';
import { useCallback, useState } from 'react';
import { nullable } from '@taskany/bricks';

import { useSolutions } from '../../modules/solutionHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { SectionProblemSolutions } from '../SectionProblemSolutions/SectionProblemSolutions';
import { HistorySubject } from '../../modules/historyEventTypes';
import { trpc } from '../../trpc/trpcClient';
import { HistoryRecord } from '../HistoryRecord/HistoryRecord';

import s from './SectionActivity.module.css';
import { tr } from './SectionActivity.i18n';

interface SectionActivityProps {
    interviewId: number;
    sectionId: number;
    hasTasks?: boolean;
    isEditable: boolean;
}

type AllowedTabs = 'history' | 'problems';

export const SectionActivity = ({ sectionId, hasTasks, interviewId, isEditable }: SectionActivityProps) => {
    const [activeTab, setActiveTab] = useState<AllowedTabs>('problems');

    const historyEventsQuery = trpc.historyEvents.getHistoryEvents.useQuery({
        subject: HistorySubject.SECTION,
        subjectId: String(sectionId),
    });
    const solutionsQuery = useSolutions({ sectionId });

    const historyEvents = historyEventsQuery.data ?? [];

    const handleTabChange = useCallback((_: React.SyntheticEvent<HTMLButtonElement>, active: string) => {
        setActiveTab(active as AllowedTabs);
    }, []);

    const events = historyEventsQuery.data ?? [];
    return (
        <div className={s.ActivityPageContainer}>
            <Switch className={s.Switch} name="interviewTabs" value="problems" animated onChange={handleTabChange}>
                <SwitchControl className={s.ActivityTab} value="problems" text={tr('Problems')} />
                <SwitchControl
                    className={s.ActivityTab}
                    value="history"
                    count={historyEvents.length}
                    text={tr('History')}
                />
            </Switch>
            {nullable(
                activeTab === 'problems',
                () =>
                    nullable(hasTasks, () => (
                        <QueryResolver queries={[solutionsQuery]}>
                            {([solutions]) => (
                                <SectionProblemSolutions
                                    sectionId={sectionId}
                                    solutions={solutions}
                                    interviewId={interviewId}
                                    isEditable={isEditable}
                                />
                            )}
                        </QueryResolver>
                    )),
                <div className={s.ActivityContainer}>
                    {events.map((event) => (
                        <HistoryRecord key={event.id} event={event} />
                    ))}
                </div>,
            )}
        </div>
    );
};
