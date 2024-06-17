import { ChangeEvent, useState } from 'react';
import { User } from '@prisma/client';
import { ComboBox, FiltersMenuItem, Input, UserMenuItem } from '@taskany/bricks';
import { Button } from '@taskany/bricks/harmony';
import { useDebounce } from 'use-debounce';

import { trpc } from '../../trpc/trpcClient';
import { CrewUserShort } from '../../modules/crewTypes';
import { useGetUserByCrewUserMutation } from '../../modules/userHooks';

import s from './CrewUserSelector.module.css';
import { tr } from './CrewUserSelector.i18n';

interface CrewUserSelectorProps {
    onSelect: (user: User) => void;
    placeholder: string;
}

export const CrewUserSelector = ({ onSelect, placeholder }: CrewUserSelectorProps) => {
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 300);
    const [crewUser, setCrewUser] = useState<CrewUserShort | undefined>(undefined);
    const [user, setUser] = useState<User | undefined>(undefined);
    const [visibility, setVisibility] = useState(false);
    const getUserByCrewUser = useGetUserByCrewUserMutation();

    const crewUsersQuery = trpc.crew.searchUsers.useQuery(debouncedSearch, {
        enabled: Boolean(visibility && debouncedSearch),
    });

    const reset = () => {
        setCrewUser(undefined);
        setUser(undefined);
        setSearch('');
        setVisibility(false);
    };

    const onUserSelect = async (crewUser: CrewUserShort) => {
        setCrewUser(crewUser);
        const user = await getUserByCrewUser.mutateAsync(crewUser);
        onSelect(user);
        reset();
    };

    const onAddClick = () => {
        user && onSelect(user);
        reset();
    };

    return (
        <div className={s.CrewUserSelector}>
            <ComboBox
                text={placeholder}
                onClickOutside={(cb) => cb()}
                renderInput={(props) => (
                    <Input
                        autoFocus
                        placeholder={placeholder}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            setSearch(e.currentTarget.value);
                            setVisibility(true);
                        }}
                        {...props}
                    />
                )}
                visible={visibility}
                onChange={onUserSelect}
                renderItem={(props) => (
                    <UserMenuItem
                        key={props.item.id}
                        name={props.item.name}
                        email={props.item.email}
                        onClick={props.onClick}
                    />
                )}
                renderTrigger={(props) => {
                    return crewUser ? (
                        <UserMenuItem
                            name={crewUser.name || crewUser.email}
                            email={crewUser.email}
                            onClick={props.onClick}
                        />
                    ) : (
                        <FiltersMenuItem {...props}>{props.text}</FiltersMenuItem>
                    );
                }}
                items={crewUsersQuery.data}
            />
            {crewUser && <Button text={tr('Add')} view="primary" onClick={onAddClick} />}
            {crewUser && <Button text={tr('Cancel')} onClick={reset} />}
        </div>
    );
};
