import { User } from '@prisma/client';
import { CSSProperties } from 'react';
import { Text, Link } from '@taskany/bricks';

import config from '../backend/config';

type ExternalUserLinkProps = {
    user: User;
    style?: CSSProperties;
};

export const ExternalUserLink = ({ user, style }: ExternalUserLinkProps) => {
    const userByEmailLink = config.sourceUsers.sourceOfUsersUrl + user.email;

    return (
        <Text style={style} as="span">
            <Link inline href={userByEmailLink} target="_blank">
                {user.name}
            </Link>
        </Text>
    );
};
