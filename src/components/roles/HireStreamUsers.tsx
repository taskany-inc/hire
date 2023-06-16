import { useState, VFC } from 'react';
import { HireStream } from '@prisma/client';
import { CrossIcon } from '@taskany/bricks';

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
} from '../../hooks/roles-hooks';
import { UserRoles } from '../../backend/user-roles';
import { QueryResolver } from '../QueryResolver';
import { UserList } from '../users/UserList';
import { idObjsToIds } from '../../backend/utils';
import { Confirmation, useConfirmation } from '../Confirmation';

import { AddUserToRole } from './AddUserToRole';

type HireStreamUsersProps = {
    hireStream: HireStream;
};

export const HireStreamUsers: VFC<HireStreamUsersProps> = ({ hireStream }) => {
    const usersQuery = useHireStreamUsers(hireStream.id);
    const [hireStreamId, setHireStreamId] = useState<null | number>();
    const [userId, setUserId] = useState<null | number>();
    const [userName, setUserName] = useState<null | string>();
    const [sectionTypeId, setSectionTypeId] = useState<null | number>();

    const addHireStreamManagerMutation = useAddHireStreamManagerToHireStreamMutation(hireStream.name);
    const removeHireStreamManagerMutation = useRemoveHireStreamManagerFromHireStreamMutation(hireStream.name);
    const removeHireStreamManagerConfirmation = useConfirmation({
        message: `Take the role of hire stream manager from ${userName}?`,
        onAgree: async () =>
            hireStreamId &&
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
        message: `Take the role of a recruiting lead from ${userName}?`,
        onAgree: async () =>
            hireStreamId &&
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
        message: `Take the role of a recruiter from ${userName}?`,
        onAgree: async () =>
            hireStreamId &&
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
        message: `Take over the role of the interviewer ${userName}?`,
        onAgree: async () =>
            hireStreamId &&
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
                            title="Hiring stream managers"
                            titleFragment={
                                <AddUserToRole
                                    title={`Add Recruitment Stream Manager to stream ${hireStream.name}`}
                                    onSelect={(user) =>
                                        addHireStreamManagerMutation.mutate({
                                            hireStreamId: hireStream.id,
                                            userId: user.id,
                                        })
                                    }
                                    filterByIds={idObjsToIds(hireStreamManagers)}
                                />
                            }
                            users={hireStreamManagers}
                            action={{
                                icon: <CrossIcon size="s" />,
                                disabled: removeHireStreamManagerMutation.isLoading || usersQuery.isLoading,
                                handler: (user) => {
                                    setHireStreamId(hireStream.id);
                                    setUserId(user.id);
                                    setUserName(user.name);
                                    removeHireStreamManagerConfirmation.show();
                                },
                            }}
                        />

                        <UserList
                            title="Hiring Leads"
                            titleFragment={
                                <AddUserToRole
                                    title={`Add a Hiring Lead to a stream${hireStream.name}`}
                                    onSelect={(user) =>
                                        addHiringLeadMutation.mutate({ hireStreamId: hireStream.id, userId: user.id })
                                    }
                                    filterByIds={idObjsToIds(hiringLeads)}
                                />
                            }
                            users={hiringLeads}
                            action={{
                                icon: <CrossIcon size="s" />,
                                disabled: removeHiringLeadMutation.isLoading || usersQuery.isLoading,
                                handler: (user) => {
                                    setHireStreamId(hireStream.id);
                                    setUserId(user.id);
                                    setUserName(user.name);
                                    removeHiringLeadConfirmation.show();
                                },
                            }}
                        />

                        <UserList
                            title="Recruiters"
                            titleFragment={
                                <AddUserToRole
                                    title={`Add a recruiter to the stream ${hireStream.name}`}
                                    onSelect={(user) =>
                                        addRecruiterMutation.mutate({ hireStreamId: hireStream.id, userId: user.id })
                                    }
                                    filterByIds={idObjsToIds(recruiters)}
                                />
                            }
                            users={recruiters}
                            action={{
                                icon: <CrossIcon size="s" />,
                                disabled: removeRecruiterMutation.isLoading || usersQuery.isLoading,
                                handler: (user) => {
                                    setHireStreamId(hireStream.id);
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
                                    <AddUserToRole
                                        title={`Add Interviewer to Section Type ${sectionType.title} of hire stream ${hireStream.name}`}
                                        onSelect={(user) =>
                                            addInterviewerMutation.mutate({
                                                hireStreamId: hireStream.id,
                                                sectionTypeId: sectionType.id,
                                                userId: user.id,
                                            })
                                        }
                                        filterByIds={idObjsToIds(users)}
                                    />
                                }
                                users={users}
                                action={{
                                    icon: <CrossIcon size="s" />,
                                    disabled: removeInterviewerMutation.isLoading || usersQuery.isLoading,
                                    handler: (user) => {
                                        setHireStreamId(hireStream.id);
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
