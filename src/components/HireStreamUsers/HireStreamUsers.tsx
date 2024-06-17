import { useState, VFC } from 'react';
import { HireStream } from '@prisma/client';
import { IconXOutline } from '@taskany/icons';

import {
    useAddHireStreamManagerToHireStreamMutation,
    useAddHiringLeadToHireStreamMutation,
    useAddInterviewerToSectionTypeMutation,
    useAddRecruiterToHireStreamMutation,
    useHireStreamUsers,
    useRemoveHireStreamManagerFromHireStreamMutation,
    useRemoveHiringLeadFromHireStreamMutation,
    useRemoveInterviewerFromSectionTypeMutation,
    useRemoveRecruiterFromHireStreamMutation,
} from '../../modules/rolesHooks';
import { UserRoles } from '../../utils/userRoles';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { UserList } from '../UserList/UserList';
import { Confirmation, useConfirmation } from '../Confirmation/Confirmation';
import { CrewUserSelector } from '../CrewUserSelector/CrewUserSelector';

import { tr } from './HireStreamUsers.i18n';

interface HireStreamUsersProps {
    hireStream: HireStream;
}

export const HireStreamUsers: VFC<HireStreamUsersProps> = ({ hireStream }) => {
    const hireStreamId = hireStream.id;

    const usersQuery = useHireStreamUsers(hireStream.id);
    const [userId, setUserId] = useState<null | number>();
    const [userName, setUserName] = useState<null | string>();
    const [sectionTypeId, setSectionTypeId] = useState<null | number>();

    const addHireStreamManagerMutation = useAddHireStreamManagerToHireStreamMutation(hireStream.name);
    const removeHireStreamManagerMutation = useRemoveHireStreamManagerFromHireStreamMutation(hireStream.name);
    const removeHireStreamManagerConfirmation = useConfirmation({
        message: `${tr('Take the role of hire stream manager from')} ${userName}?`,
        onAgree: async () =>
            userId &&
            removeHireStreamManagerMutation.mutate({
                hireStreamId,
                userId,
            }),
        destructive: true,
    });

    const addHiringLeadMutation = useAddHiringLeadToHireStreamMutation(hireStream.name);
    const removeHiringLeadMutation = useRemoveHiringLeadFromHireStreamMutation(hireStream.name);
    const removeHiringLeadConfirmation = useConfirmation({
        message: `${tr('Take the role of a recruiting lead from')}${userName}?`,
        onAgree: async () =>
            userId &&
            removeHiringLeadMutation.mutate({
                hireStreamId,
                userId,
            }),
        destructive: true,
    });

    const addRecruiterMutation = useAddRecruiterToHireStreamMutation(hireStream.name);
    const removeRecruiterMutation = useRemoveRecruiterFromHireStreamMutation(hireStream.name);
    const removeRecruiterConfirmation = useConfirmation({
        message: `${tr('Take the role of a recruiter from')} ${userName}?`,
        onAgree: async () =>
            userId &&
            removeRecruiterMutation.mutate({
                hireStreamId,
                userId,
            }),
        destructive: true,
    });

    const addInterviewerMutation = useAddInterviewerToSectionTypeMutation(hireStream.name);
    const removeInterviewerMutation = useRemoveInterviewerFromSectionTypeMutation(hireStream.name);
    const removeInterviewerConfirmation = useConfirmation({
        message: `${tr('Take over the role of the interviewer')}${userName}?`,
        onAgree: async () =>
            userId &&
            sectionTypeId &&
            removeInterviewerMutation.mutate({
                hireStreamId,
                userId,
                sectionTypeId,
            }),
        destructive: true,
    });

    return (
        <QueryResolver queries={[usersQuery]}>
            {([users]) => {
                const hireStreamManagers = users[UserRoles.HIRE_STREAM_MANAGER];
                const hiringLeads = users[UserRoles.HIRING_LEAD];
                const recruiters = users[UserRoles.RECRUITER];
                const interviewers = users[UserRoles.INTERVIEWER];

                return (
                    <>
                        <UserList
                            title={tr('Hiring stream managers')}
                            titleFragment={
                                <CrewUserSelector
                                    placeholder={tr('Add Recruitment Stream Manager')}
                                    onSelect={(user) =>
                                        addHireStreamManagerMutation.mutate({
                                            hireStreamId: hireStream.id,
                                            userId: user.id,
                                        })
                                    }
                                />
                            }
                            users={hireStreamManagers}
                            action={{
                                icon: <IconXOutline size="s" />,
                                disabled: removeHireStreamManagerMutation.isLoading || usersQuery.isLoading,
                                handler: (user) => {
                                    setUserId(user.id);
                                    setUserName(user.name);
                                    removeHireStreamManagerConfirmation.show();
                                },
                            }}
                        />

                        <UserList
                            title={tr('Hiring Leads')}
                            titleFragment={
                                <CrewUserSelector
                                    placeholder={tr('Add a Hiring Lead')}
                                    onSelect={(user) =>
                                        addHiringLeadMutation.mutate({
                                            hireStreamId: hireStream.id,
                                            userId: user.id,
                                        })
                                    }
                                />
                            }
                            users={hiringLeads}
                            action={{
                                icon: <IconXOutline size="s" />,
                                disabled: removeHiringLeadMutation.isLoading || usersQuery.isLoading,
                                handler: (user) => {
                                    setUserId(user.id);
                                    setUserName(user.name);
                                    removeHiringLeadConfirmation.show();
                                },
                            }}
                        />

                        <UserList
                            title={tr('Recruiters')}
                            titleFragment={
                                <CrewUserSelector
                                    placeholder={tr('Add a recruiter')}
                                    onSelect={(user) =>
                                        addRecruiterMutation.mutate({
                                            hireStreamId: hireStream.id,
                                            userId: user.id,
                                        })
                                    }
                                />
                            }
                            users={recruiters}
                            action={{
                                icon: <IconXOutline size="s" />,
                                disabled: removeRecruiterMutation.isLoading || usersQuery.isLoading,
                                handler: (user) => {
                                    setUserId(user.id);
                                    setUserName(user.name);
                                    removeRecruiterConfirmation.show();
                                },
                            }}
                        />

                        {interviewers.map(({ sectionType, users }) => (
                            <UserList
                                key={sectionType.id}
                                title={sectionType.title}
                                titleFragment={
                                    <CrewUserSelector
                                        placeholder={tr('Add Interviewer')}
                                        onSelect={(user) =>
                                            addInterviewerMutation.mutate({
                                                hireStreamId: hireStream.id,
                                                sectionTypeId: sectionType.id,
                                                userId: user.id,
                                            })
                                        }
                                    />
                                }
                                users={users}
                                action={{
                                    icon: <IconXOutline size="s" />,
                                    disabled: removeInterviewerMutation.isLoading || usersQuery.isLoading,
                                    handler: (user) => {
                                        setUserId(user.id);
                                        setUserName(user.name);
                                        setSectionTypeId(sectionType.id);
                                        removeInterviewerConfirmation.show();
                                    },
                                }}
                            />
                        ))}
                        <Confirmation {...removeHireStreamManagerConfirmation.props} />
                        <Confirmation {...removeHiringLeadConfirmation.props} />
                        <Confirmation {...removeRecruiterConfirmation.props} />
                        <Confirmation {...removeInterviewerConfirmation.props} />
                    </>
                );
            }}
        </QueryResolver>
    );
};
