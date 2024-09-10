import { User as UserType } from '@prisma/client';
import { CSSProperties, useMemo, useState, ReactNode } from 'react';
import { useDebounce } from 'use-debounce';
import { textColor } from '@taskany/colors';
import { nullable } from '@taskany/bricks';
import { Text, Input, User } from '@taskany/bricks/harmony';

import { IconButton } from '../IconButton/IconButton';

import { tr } from './UserList.i18n';
import s from './UserList.module.css';

interface UserListProps {
    title?: string;
    titleFragment?: ReactNode;
    users: UserType[];
    action?: {
        icon: ReactNode;
        handler: (user: UserType) => void;
        disabled?: boolean;
    };
    showFilter?: boolean;
    className?: string;
    style?: CSSProperties;
}

export const UserList = ({ title, titleFragment, users, action, showFilter, className, style }: UserListProps) => {
    const [filter, setFilter] = useState('');
    const [debouncedFilter] = useDebounce(filter, 300);

    const filteredUsers = useMemo(() => {
        if (!showFilter || !debouncedFilter) {
            return users;
        }

        return users.filter(
            (u) => u.name?.toLowerCase().includes(debouncedFilter) || u.email.toLowerCase().includes(debouncedFilter),
        );
    }, [showFilter, debouncedFilter, users]);

    return (
        <div className={className} style={style}>
            {(title || titleFragment) && (
                <div className={s.UserListTitleWrapper}>
                    <Text size="xl" className={s.UserListTitle}>
                        {title}
                    </Text>
                    {titleFragment}
                </div>
            )}
            {showFilter && (
                <div className={s.UserListFromInput}>
                    <Input
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder={tr('Filter by name or email')}
                    />
                </div>
            )}
            <div className={s.UserListCardsContainer}>
                {nullable(users.length === 0, () => (
                    <Text className={s.UserListTextMessage}>{tr('No users')}</Text>
                ))}
                {filteredUsers.map((user) => (
                    <div key={user.id} className={s.UserListCard}>
                        <User name={user.name} email={user.email} />
                        {action && (
                            <IconButton
                                disabled={action.disabled}
                                onClick={() => action.handler(user)}
                                style={{ marginLeft: 'auto', color: textColor }}
                            >
                                {action.icon}
                            </IconButton>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
