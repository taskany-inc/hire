import config from '../config';

export const getAuthorLink = (email: string) =>
    config.crew.userByEmailLink ? `${config.crew.userByEmailLink}/${email}` : null;
