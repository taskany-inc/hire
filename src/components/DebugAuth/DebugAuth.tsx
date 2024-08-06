import { FC } from 'react';
import { useRouter } from 'next/router';
import { User } from '@prisma/client';
import { Text, UserPic } from '@taskany/bricks';
import { Button } from '@taskany/bricks/harmony';

import { Paths } from '../../utils/paths';
import { AUTH_DEBUG_COOKIE_NAME } from '../../utils/auth';
import { readBooleanFromMetaTag } from '../../utils/frontend';
import { yearInSeconds } from '../../utils';

import { tr } from './DebugAuth.i18n';
import s from './DebugAuth.module.css';

interface DebugAuthProps {
    users: User[];
}

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
                    text={tr('Log in with Next Auth')}
                />
            )}

            <Text size="xl" style={{ marginBottom: 12 }}>
                {tr('Select the user under which you want to log in')}
            </Text>

            <div className={s.DebugAuthUserCards}>
                {users.map((user) => {
                    const { email } = user;

                    return (
                        <div
                            style={{ cursor: email ? 'pointer' : 'disabled' }}
                            key={user.id}
                            onClick={email ? () => onUserSelect(email) : undefined}
                            className={s.DebugAuthCard}
                        >
                            <UserPic email={email} />
                            <Text>{user.name}</Text>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
