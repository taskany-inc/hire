import { User } from '@prisma/client';
import { CSSProperties } from 'react';
import { Text } from '@taskany/bricks';

import config from '../backend/config';

import { Link } from './Link';

type ExternalUserLinkProps = {
    user: User;
    style?: CSSProperties;
};

export const ExternalUserLink = ({ user, style }: ExternalUserLinkProps) => {
    const userByEmailLink = config.sourceUsers.sourceOfUsersUrl + user.email;

    return (
        <Text style={style} as="span">
            <Link href={userByEmailLink} target="_blank">
                {user.name}
            </Link>
        </Text>
    );
};
