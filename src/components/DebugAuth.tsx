import { FC } from 'react';
import { useRouter } from 'next/router';
import { User } from '@prisma/client';
import styled from 'styled-components';
import { gray1 } from '@taskany/colors';
import { Button, Text, UserPic } from '@taskany/bricks';

import { Paths } from '../utils/paths';
import { AUTH_DEBUG_COOKIE_NAME } from '../utils/auth';
import { readBooleanFromMetaTag } from '../utils/frontend';
import { yearInSeconds } from '../utils';

type DebugAuthProps = {
    users: User[];
};

const StyledUserCards = styled.div`
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
    gap: 8px;

    &:hover {
        background-color: ${gray1};
    }
`;

export const DebugAuth: FC<DebugAuthProps> = ({ users }) => {
    const router = useRouter();

    const onUserSelect = (email: string) => {
        document.cookie = `${AUTH_DEBUG_COOKIE_NAME}=${email};path=/;max-age=${yearInSeconds};SameSite=Strict`;
        router.replace(Paths.HOME);
    };

    const onNextAuthClick = () => {
        document.location.href = Paths.AUTH_SIGNIN;
    };

    const isNextAuthEnabled = readBooleanFromMetaTag('isNextAuthEnabled');

    return (
        <div>
            {isNextAuthEnabled && (
                <Button
                    view="primary"
                    style={{ marginBottom: 32 }}
                    onClick={onNextAuthClick}
                    text="Log in with Next Auth"
                />
            )}

            <Text size="xl" style={{ marginBottom: 12 }}>
                Select the user under which you want to log in
            </Text>

            <StyledUserCards>
                {users.map((user) => {
                    const { email } = user;

                    return (
                        <StyledCard
                            style={{ cursor: email ? 'pointer' : 'disabled' }}
                            key={user.id}
                            onClick={email ? () => onUserSelect(email) : undefined}
                        >
                            <UserPic email={email} />
                            <Text>{user.name}</Text>
                        </StyledCard>
                    );
                })}
            </StyledUserCards>
        </div>
    );
};
