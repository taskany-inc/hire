import { Switch, SwitchControl } from '@taskany/bricks/harmony';
import { useCallback, useState } from 'react';
import { nullable } from '@taskany/bricks';

import { HistorySubject } from '../../modules/historyEventTypes';
import { trpc } from '../../trpc/trpcClient';
import { InterviewSectionListItem } from '../InterviewSectionListItem/InterviewSectionListItem';
import { Comment } from '../Comment/Comment';
import InterviewCommentCreateForm from '../InterviewCommentCreationForm/InterviewCommentCreationForm';
import { InterviewWithRelations } from '../../modules/interviewTypes';
import { HistoryRecord } from '../HistoryRecord/HistoryRecord';

import s from './InterviewActivity.module.css';
import { tr } from './InterviewActivity.i18n';

interface InterviewActivityProps {
    interview: InterviewWithRelations;
}

type AllowedTabs = 'history' | 'activity';

export const InterviewActivity = ({ interview }: InterviewActivityProps) => {
    const [activeTab, setActiveTab] = useState<AllowedTabs>('activity');

    const historyEventsQuery = trpc.historyEvents.getHistoryEvents.useQuery({
        subject: HistorySubject.INTERVIEW,
        subjectId: String(interview.id),
    });

    const historyEvents = historyEventsQuery.data ?? [];

    const handleTabChange = useCallback((_: React.SyntheticEvent<HTMLButtonElement>, active: string) => {
        setActiveTab(active as AllowedTabs);
    }, []);

    const { activityFeed } = interview;

    return (
        <div className={s.ActivityPageContainer}>
            <Switch name="interviewTabs" value="activity" animated onChange={handleTabChange}>
                <SwitchControl
                    className={s.ActivityTab}
                    value="activity"
                    count={activityFeed.length}
                    text={tr('Activity')}
                />
                <SwitchControl
                    className={s.ActivityTab}
                    value="history"
                    count={historyEvents.length}
                    text={tr('History')}
                />
            </Switch>
            {nullable(
                activeTab === 'activity',
                () => (
                    <div className={s.ActivityContainer}>
                        {activityFeed.map((item) =>
                            item.type === 'comment' ? (
                                <Comment
                                    key={`comment - ${item.value.id}`}
                                    comment={item.value}
                                    status={item.value.status ?? undefined}
                                />
                            ) : (
                                <InterviewSectionListItem
                                    key={`section-${item.value.id}`}
                                    section={item.value}
                                    interview={interview}
                                />
                            ),
                        )}

                        <InterviewCommentCreateForm interview={interview} />
                    </div>
                ),
                <div className={s.ActivityContainer}>
                    {historyEvents.map((event) => (
                        <HistoryRecord key={event.id} event={event} />
                    ))}
                </div>,
            )}
        </div>
    );
};
