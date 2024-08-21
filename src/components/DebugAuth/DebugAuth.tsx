import { FC } from 'react';
import { useRouter } from 'next/router';
import { User as UserType } from '@prisma/client';
import { Button, Text, User } from '@taskany/bricks/harmony';

import { Paths } from '../../utils/paths';
import { AUTH_DEBUG_COOKIE_NAME } from '../../utils/auth';
import { yearInSeconds } from '../../utils';

import { tr } from './DebugAuth.i18n';
import s from './DebugAuth.module.css';

interface DebugAuthProps {
    users: UserType[];
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

    return (
        <div>
            <Button view="primary" onClick={onNextAuthClick} text={tr('Log in with Next Auth')} />

            <Text size="xl" className={s.DebugAuthMessage}>
                {tr('Select the user under which you want to log in')}
            </Text>

            <div className={s.DebugAuthUserCards}>
                {users.map((user) => {
                    const { email } = user;

                    return (
                        <User
                            name={user.name}
                            email={user.email}
                            style={{ cursor: email ? 'pointer' : 'disabled' }}
                            key={user.id}
                            onClick={email ? () => onUserSelect(email) : undefined}
                        />
                    );
                })}
            </div>
        </div>
    );
};
