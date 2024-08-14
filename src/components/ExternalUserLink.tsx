import { User } from '@prisma/client';
import { CSSProperties } from 'react';
import { Text } from '@taskany/bricks/harmony';

import config from '../config';

import { Link } from './Link';

interface ExternalUserLinkProps {
    user: User;
    style?: CSSProperties;
    className?: string;
}

export const ExternalUserLink = ({ user, style, className }: ExternalUserLinkProps) => {
    const userByEmailLink = `${config.crew.userByEmailLink}/${user.email}`;

    return (
        <Text size="m" className={className} style={style} as="span">
            <Link href={userByEmailLink} target="_blank">
                {user.name}
            </Link>
        </Text>
    );
};
