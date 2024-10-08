import { useCallback, useState } from 'react';
import { nullable } from '@taskany/bricks';
import { Button } from '@taskany/bricks/harmony';

import { useSession } from '../../contexts/appSettingsContext';
import { trpc } from '../../trpc/trpcClient';
import { InterviewSectionSlotCalendar } from '../InterviewSectionSlotCalendar/InterviewSectionSlotCalendar';
import { LayoutMain } from '../LayoutMain/LayoutMain';

import s from './MyCalendarPage.module.css';
import { tr } from './MyCalendarPage.i18n';

export const MyCalendarPage = () => {
    const [hireStreamId, setHireStreamId] = useState<number | undefined>();

    const session = useSession();

    const rights = session?.user.admin || session?.userRoles.hasRecruiterRoles;

    const hireStreamsQuery = trpc.hireStreams.getAllowed.useQuery();

    const interviewersQuery = trpc.users.getUserList.useQuery(
        { interviewerInHireStreamId: hireStreamId },
        { enabled: !!hireStreamId },
    );

    const onMyClick = () => setHireStreamId(undefined);

    const onHireStreamChange = useCallback(
        (id: number) => {
            if (id !== hireStreamId) {
                setHireStreamId(id);
            }
        },
        [hireStreamId, setHireStreamId],
    );

    const interviwerIds = interviewersQuery.data?.map(({ id }) => id);

    return (
        <LayoutMain pageTitle={tr('Calendar')}>
            {nullable(rights, () => (
                <div className={s.MyCalendarPageButtonWrapper}>
                    <Button
                        className={s.Button}
                        size="s"
                        brick="right"
                        text={tr('My')}
                        onClick={onMyClick}
                        view={hireStreamId === undefined ? 'primary' : 'default'}
                    />
                    <div className={s.ButtonWrapper}>
                        {hireStreamsQuery.data?.map((hireStream, index) => (
                            <Button
                                className={s.Button}
                                size="s"
                                brick={index === hireStreamsQuery.data.length - 1 ? 'left' : 'center'}
                                text={hireStream.name}
                                key={hireStream.name}
                                onClick={() => onHireStreamChange(hireStream.id)}
                                view={hireStreamId === hireStream.id ? 'primary' : 'default'}
                            />
                        ))}
                    </div>
                </div>
            ))}
            <InterviewSectionSlotCalendar my={!hireStreamId} interviewerIds={interviwerIds} />
        </LayoutMain>
    );
};
