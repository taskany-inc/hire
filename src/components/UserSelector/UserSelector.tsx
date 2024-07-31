import { useState } from 'react';
import { User } from '@prisma/client';
import styled from 'styled-components';
import { useDebounce } from 'use-debounce';
import { Button } from '@taskany/bricks/harmony';

import { trpc } from '../../trpc/trpcClient';
import { Role } from '../../modules/userTypes';
import { UserComboBox } from '../UserComboBox';

import { tr } from './UserSelector.i18n';
import s from './UserSelector.module.css';

const StyledWrapper = styled.div`
    display: flex;
    align-items: center;
`;

interface UserSelectorProps {
    onSelect: (user: User) => void;
    placeholder: string;
    role?: Role;
    sectionTypeOrHireStreamId?: number;
}

export const UserSelector = ({ placeholder, onSelect, sectionTypeOrHireStreamId, role }: UserSelectorProps) => {
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 300);
    const [user, setUser] = useState<User | undefined>(undefined);

    const usersQuery = trpc.users.getUserList.useQuery(
        { search: debouncedSearch, limit: 20, role, sectionTypeOrHireStreamId },
        {
            cacheTime: 0,
            staleTime: 0,
        },
    );

    const onUserSelect = (user: User) => {
        setUser(user);
        setSearch('');
    };

    const onAddClick = () => {
        user && onSelect(user);
        setUser(undefined);
    };

    const onCancelClick = () => {
        setUser(undefined);
        setSearch('');
    };

    return (
        <StyledWrapper>
            <UserComboBox
                items={usersQuery.data}
                onChange={onUserSelect}
                setInputValue={setSearch}
                value={user}
                placeholder={placeholder}
            />
            {user && <Button className={s.UserSelectorButton} text={tr('Add')} view="primary" onClick={onAddClick} />}
            {user && <Button className={s.UserSelectorButton} text={tr('Cancel')} onClick={onCancelClick} />}
        </StyledWrapper>
    );
};
