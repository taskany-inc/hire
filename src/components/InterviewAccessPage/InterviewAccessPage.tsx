import { User } from '@prisma/client';
import { IconXOutline } from '@taskany/icons';

import { UserList } from '../UserList/UserList';
import { UserSelector } from '../UserSelector/UserSelector';
import { useEditInterviewAccessList, useInterview } from '../../modules/interviewHooks';
import { LayoutMain } from '../LayoutMain';

import { tr } from './InterviewAccessPage.i18n';

interface InterviewAccesPageProps {
    interviewId: number;
}

export const InterviewAccessPage = ({ interviewId }: InterviewAccesPageProps) => {
    const interviewQuery = useInterview(interviewId);

    const editInterviewAccessList = useEditInterviewAccessList();

    const onSelect = (user: User) => {
        editInterviewAccessList.mutateAsync({ action: 'ADD', interviewId, userId: user.id });
    };

    const onDelete = (user: User) => {
        editInterviewAccessList.mutateAsync({ action: 'DELETE', interviewId, userId: user.id });
    };

    return (
        <LayoutMain pageTitle={tr('Interview access restriction')}>
            <UserList
                title={tr('Users with restricted access')}
                titleFragment={<UserSelector placeholder={tr('Add user')} onSelect={onSelect} />}
                users={interviewQuery.data?.restrictedUsers ?? []}
                action={{
                    icon: <IconXOutline size="s" />,
                    disabled: false,
                    handler: onDelete,
                }}
            />
        </LayoutMain>
    );
};
