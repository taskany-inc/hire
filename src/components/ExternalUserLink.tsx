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

export const ExternalUserLink = ({ user }: ExternalUserLinkProps) => {
    const userByEmailLink = getAuthorLink(user.email);
    const authorName = user.name ?? user.email;

    return nullable(
        userByEmailLink,
        (link) => (
            <Link href={link} target="_blank">
                {authorName}
            </Link>
        ),
        authorName,
    );
};
