import { useState } from 'react';
import { IconXOutline } from '@taskany/icons';

import {
    useAddProblemEditorToRolesMutation,
    useRemoveProblemEditorToRolesMutation,
    useProblemEditorsList,
} from '../../modules/rolesHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { UserList } from '../UserList/UserList';
import { CrewUserSelector } from '../CrewUserSelector/CrewUserSelector';
import { Confirmation, useConfirmation } from '../Confirmation/Confirmation';

import { tr } from './ProblemEditorList.i18n';

export const ProblemEditorsList = () => {
    const [userId, setUserId] = useState<null | number>();
    const [userName, setUserName] = useState<null | string>();
    const problemEditorsListQuery = useProblemEditorsList();
    const addProblemEditorMutation = useAddProblemEditorToRolesMutation();
    const removeProblemEditorMutation = useRemoveProblemEditorToRolesMutation();

    const removeProblemEditorConfirmation = useConfirmation({
        message: `${tr('Take the role of problem editor from')} ${userName}?`,
        onAgree: async () =>
            userId &&
            removeProblemEditorMutation.mutate({
                userId,
            }),
        destructive: true,
    });

    return (
        <QueryResolver queries={[problemEditorsListQuery]}>
            {([users]) => {
                return (
                    <>
                        <UserList
                            title={tr('Problem Editors')}
                            users={users}
                            titleFragment={
                                <CrewUserSelector
                                    placeholder={tr('Add problem editor role')}
                                    onSelect={(user) =>
                                        addProblemEditorMutation.mutate({
                                            userId: user.id,
                                        })
                                    }
                                />
                            }
                            action={{
                                icon: <IconXOutline size="s" />,
                                disabled: removeProblemEditorMutation.isLoading,
                                handler: (user) => {
                                    setUserId(user.id);
                                    setUserName(user.name);
                                    removeProblemEditorConfirmation.show();
                                },
                            }}
                        />
                        <Confirmation {...removeProblemEditorConfirmation.props} />
                    </>
                );
            }}
        </QueryResolver>
    );
};
