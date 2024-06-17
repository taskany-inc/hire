import { User } from '@prisma/client';
import { IconXOutline } from '@taskany/icons';

import { UserList } from '../UserList/UserList';
import { CrewUserSelector } from '../CrewUserSelector/CrewUserSelector';
import { useEditInterviewAccessList, useInterview } from '../../modules/interviewHooks';
import { LayoutMain } from '../LayoutMain';

import s from './InterviewAccessPage.module.css';
import { tr } from './InterviewAccessPage.i18n';

interface InterviewAccesPageProps {
    interviewId: number;
}

export const InterviewAccessPage = ({ interviewId }: InterviewAccesPageProps) => {
    const interviewQuery = useInterview(interviewId);

    const editInterviewAccessList = useEditInterviewAccessList();

    const onAddRestriction = (user: User) => {
        editInterviewAccessList.mutateAsync({ type: 'RESTRICT', action: 'ADD', interviewId, userId: user.id });
    };

    const onDeleteRestriction = (user: User) => {
        editInterviewAccessList.mutateAsync({ type: 'RESTRICT', action: 'DELETE', interviewId, userId: user.id });
    };

    const onAddPermission = (user: User) => {
        editInterviewAccessList.mutateAsync({ type: 'ALLOW', action: 'ADD', interviewId, userId: user.id });
    };

    const onDeletePersmission = (user: User) => {
        editInterviewAccessList.mutateAsync({ type: 'ALLOW', action: 'DELETE', interviewId, userId: user.id });
    };

    return (
        <LayoutMain pageTitle={tr('Interview access')}>
            <UserList
                title={tr('Users with restricted access')}
                titleFragment={<CrewUserSelector placeholder={tr('Add user')} onSelect={onAddRestriction} />}
                users={interviewQuery.data?.restrictedUsers ?? []}
                action={{
                    icon: <IconXOutline size="s" />,
                    disabled: false,
                    handler: onDeleteRestriction,
                }}
                className={s.UserList}
            />
            <UserList
                title={tr('Users with allowed access')}
                titleFragment={<CrewUserSelector placeholder={tr('Add user')} onSelect={onAddPermission} />}
                users={interviewQuery.data?.allowedUsers ?? []}
                action={{
                    icon: <IconXOutline size="s" />,
                    disabled: false,
                    handler: onDeletePersmission,
                }}
            />
        </LayoutMain>
    );
};
