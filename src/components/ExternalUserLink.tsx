import { ComponentProps } from 'react';
import { nullable } from '@taskany/bricks';

import { getAuthorLink } from '../utils/user';

import { Link } from './Link';

interface User {
    email: string;
    name?: string | null;
}

interface ExternalUserLinkProps {
    user: User;
}

export const ExternalUserLink = ({ user, ...rest }: ExternalUserLinkProps & ComponentProps<typeof Link>) => {
    const userByEmailLink = getAuthorLink(user.email);
    const authorName = user.name ?? user.email;

    return nullable(
        userByEmailLink,
        (link) => (
            <Link href={link} target="_blank" {...rest}>
                {authorName}
            </Link>
        ),
        authorName,
    );
};
