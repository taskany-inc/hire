import { User } from '@prisma/client';
import { CSSProperties, useMemo, useState, VFC, ReactNode } from 'react';
import styled from 'styled-components';
import { useDebounce } from 'use-debounce';
import { gray4, textColor } from '@taskany/colors';
import { Text, UserPic, Input, nullable } from '@taskany/bricks';

import { ExternalUserLink } from '../ExternalUserLink';
import { IconButton } from '../IconButton';

import { tr } from './UserList.i18n';

const StyledCardsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    margin: 0 -22px;
`;

const StyledCard = styled.div`
    padding: 12px 22px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    width: 300px;
    gap: 8px;

    &:hover {
        background-color: ${gray4};
    }
`;

const StyledFromInput = styled.div`
    margin-bottom: 12px;
`;

const StyledTitleWrapper = styled.div`
    display: flex;
    align-items: center;
`;

const StyledTitle = styled(Text)`
    margin-bottom: 6px;
    margin-right: 12px;
`;

const StyledTextMessage = styled(Text)`
    margin-left: 22px;
`;

interface UserListProps {
    title?: string;
    titleFragment?: ReactNode;
    users: User[];
    action?: {
        icon: ReactNode;
        handler: (user: User) => void;
        disabled?: boolean;
    };
    showFilter?: boolean;
    className?: string;
    style?: CSSProperties;
}

export const UserList: VFC<UserListProps> = ({ title, titleFragment, users, action, showFilter, className, style }) => {
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
                <StyledTitleWrapper>
                    <StyledTitle size="xl">{title}</StyledTitle>
                    {titleFragment}
                </StyledTitleWrapper>
            )}
            {showFilter && (
                <StyledFromInput>
                    <Input
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder={tr('Filter by name or email')}
                    />
                </StyledFromInput>
            )}
            <StyledCardsContainer>
                {nullable(users.length === 0, () => (
                    <StyledTextMessage>{tr('No users')}</StyledTextMessage>
                ))}
                {filteredUsers.map((user) => (
                    <StyledCard key={user.id}>
                        <UserPic name={user.name} email={user.email} />
                        <ExternalUserLink user={user} />
                        {action && (
                            <IconButton
                                disabled={action.disabled}
                                onClick={() => action.handler(user)}
                                style={{ marginLeft: 'auto', color: textColor }}
                            >
                                {action.icon}
                            </IconButton>
                        )}
                    </StyledCard>
                ))}
            </StyledCardsContainer>
        </div>
    );
};
