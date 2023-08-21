import { useCallback, useRef, useState, VFC } from 'react';
import { User } from '@prisma/client';
import { ModalPreview, AddIcon, useClickOutside, useKeyboard, KeyCode } from '@taskany/bricks';

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

    const wrapperRef = useRef<HTMLDivElement>(null);
    const onClickOutside = useCallback(() => {
        if (open) {
            setOpen(false);
        }
    }, [setOpen, open]);

    const usersQuery = useUserList({});
    useClickOutside(wrapperRef, onClickOutside);

    const [onESC] = useKeyboard(
        [KeyCode.Escape],
        (event) => {
            if (event.target && wrapperRef.current?.contains(event.target as Node) && open) {
                setOpen(false);
            }
        },
        {
            capture: true,
            event: 'keydown',
        },
    );
    return (
        <div ref={wrapperRef}>
            <AddIcon size="s" onClick={() => setOpen(true)} />
            <ModalPreview visible={open} onClose={() => setOpen(false)}>
                <QueryResolver queries={[usersQuery]}>
                    {([users]) => (
                        <UserList
                            {...onESC}
                            users={users.filter((user) => !filterByIds.includes(user.id))}
                            title={title}
                            action={{ icon: <AddIcon size="s" />, handler: onSelect }}
                            showFilter
                            style={{ width: 600, margin: '24px 32px' }}
                        />
                    )}
                </QueryResolver>
            </ModalPreview>
        </div>
    );
};
