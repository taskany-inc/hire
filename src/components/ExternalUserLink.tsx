import { User } from '@prisma/client';
import { CSSProperties } from 'react';
import { Text } from '@taskany/bricks';

import config from '../config';

import { Link } from './Link';

interface ExternalUserLinkProps {
    user: User;
    style?: CSSProperties;
}

export const ExternalUserLink = ({ user, style }: ExternalUserLinkProps) => {
    const userByEmailLink = `${config.sourceUsers.userByEmailLink}/${user.email}`;

    return (
        <Text style={style} as="span">
            <Link href={userByEmailLink} target="_blank">
                {user.name}
            </Link>
        </Text>
    );
};
