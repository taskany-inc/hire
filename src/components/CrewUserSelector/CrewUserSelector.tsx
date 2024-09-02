import { ChangeEvent, useCallback, useState } from 'react';
import {
    Dropdown,
    DropdownPanel,
    DropdownTrigger,
    ListView,
    ListViewItem,
    User as HarmonyUser,
    Input,
} from '@taskany/bricks/harmony';
import { useDebounce } from 'use-debounce';
import { User } from '@prisma/client';
import { IconSearchOutline } from '@taskany/icons';

import { trpc } from '../../trpc/trpcClient';
import { CrewUserShort } from '../../modules/crewTypes';
import { AddInlineTrigger } from '../AddInlineTrigger/AddInlineTrigger';
import { useGetUserByCrewUserMutation } from '../../modules/userHooks';

import s from './CrewUserSelector.module.css';

interface CrewUserSelectorProps {
    onSelect: (user: User) => void;
    placeholder: string;
}

export const CrewUserSelector = ({ onSelect, placeholder }: CrewUserSelectorProps) => {
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 300);
    const [visibility, setVisibility] = useState(false);
    const getUserByCrewUser = useGetUserByCrewUserMutation();

    const crewUsersQuery = trpc.crew.searchUsers.useQuery(debouncedSearch, {
        enabled: Boolean(visibility && debouncedSearch),
    });

    const reset = () => {
        setSearch('');
        setVisibility(false);
    };

    const onUserSelect = useCallback(
        async (crewUser: CrewUserShort) => {
            const user = await getUserByCrewUser.mutateAsync(crewUser);
            onSelect(user);
            reset();
        },
        [onSelect, reset, getUserByCrewUser],
    );

    return (
        <div className={s.CrewUserSelector}>
            <Dropdown
                isOpen={visibility}
                onClose={() => {
                    setVisibility(false);
                    reset();
                }}
            >
                <DropdownTrigger
                    renderTrigger={(props) => (
                        <div ref={props.ref}>
                            <AddInlineTrigger text={placeholder} onClick={() => setVisibility(true)} ref={props.ref} />
                        </div>
                    )}
                />
                <DropdownPanel placement="bottom-start">
                    <Input
                        placeholder={placeholder}
                        outline
                        value={search}
                        autoFocus
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            setSearch(e.currentTarget.value);
                            setVisibility(true);
                        }}
                        iconLeft={<IconSearchOutline size="s" />}
                    />
                    <ListView>
                        {crewUsersQuery?.data?.map((user) => (
                            <ListViewItem
                                key={user.id}
                                renderItem={(props) => (
                                    <HarmonyUser
                                        className={s.ListItem}
                                        onClick={() => {
                                            onUserSelect(user);
                                        }}
                                        name={user.name}
                                        email={user.email}
                                        {...props}
                                    >
                                        {user.name || user.email}
                                    </HarmonyUser>
                                )}
                            />
                        ))}
                    </ListView>
                </DropdownPanel>
            </Dropdown>
        </div>
    );
};
