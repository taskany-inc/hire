import { useState, VFC } from 'react';
import { User } from '@prisma/client';
import { ModalPreview, AddIcon } from '@taskany/bricks';

import { UserList } from '../users/UserList';
import { useUserList } from '../../hooks/user-hooks';
import { QueryResolver } from '../QueryResolver';

type AddUserToRoleProps = {
    title: string;
    onSelect: (user: User) => void;
    filterByIds: number[];
};

export const AddUserToRole: VFC<AddUserToRoleProps> = ({ title, onSelect, filterByIds }) => {
    const [open, setOpen] = useState(false);

    const usersQuery = useUserList();

    return (
        <>
            <AddIcon size="s" onClick={() => setOpen(true)} />
            <ModalPreview visible={open} onClose={() => setOpen(false)}>
                <QueryResolver queries={[usersQuery]}>
                    {([users]) => (
                        <UserList
                            users={users.filter((user) => !filterByIds.includes(user.id))}
                            title={title}
                            action={{ icon: <AddIcon size="s" />, handler: onSelect }}
                            showFilter
                            style={{ width: 600, margin: '24px 32px' }}
                        />
                    )}
                </QueryResolver>
            </ModalPreview>
        </>
    );
};
