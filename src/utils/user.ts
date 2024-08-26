import config from '../config';

export interface Author {
    name: string | null;
    email: string;
}

export const getAuthorLink = (author: Author) =>
    config.crew.userByEmailLink ? `${config.crew.userByEmailLink}/${author?.email}` : null;
