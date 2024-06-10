import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { nullable, Button } from '@taskany/bricks';
import { gapS } from '@taskany/colors';

import { useSession } from '../../contexts/appSettingsContext';
import { trpc } from '../../trpc/trpcClient';
import { InterviewSectionSlotCalendar } from '../InterviewSectionSlotCalendar/InterviewSectionSlotCalendar';
import { LayoutMain } from '../LayoutMain';

import { tr } from './MyCalendarPage.i18n';

const StyledButtonWrapper = styled.div`
    margin-bottom: ${gapS};
`;

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
                <StyledButtonWrapper>
                    <Button
                        brick="right"
                        text={tr('My')}
                        onClick={onMyClick}
                        view={hireStreamId === undefined ? 'primary' : 'default'}
                    />
                    {hireStreamsQuery.data?.map((hireStream, index) => (
                        <Button
                            brick={index === hireStreamsQuery.data.length - 1 ? 'left' : 'center'}
                            text={hireStream.name}
                            key={hireStream.name}
                            onClick={() => onHireStreamChange(hireStream.id)}
                            view={hireStreamId === hireStream.id ? 'primary' : 'default'}
                        />
                    ))}
                </StyledButtonWrapper>
            ))}
            <InterviewSectionSlotCalendar my={!hireStreamId} interviewerIds={interviwerIds} />
        </LayoutMain>
    );
};
