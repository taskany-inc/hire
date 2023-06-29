import { GetServerSidePropsContext, NextApiRequest } from 'next';
import { User } from '@prisma/client';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import KeycloakProvider from 'next-auth/providers/keycloak';
// eslint-disable-next-line camelcase
import { type NextAuthOptions, unstable_getServerSession, Session } from 'next-auth';

import { prisma } from '../backend';
import { userDbService } from '../backend/modules/user/user-db-service';
import { externalUsersDebugService } from '../backend/modules/ext-users/ext-users-debug-service';
import config from '../backend/config';
import { standConfig } from '../utils/stand';
import { UserRolesInfo } from '../backend/user-roles';

import { ErrorWithStatus } from '.';

import { tr } from './utils.i18n';

export const AUTH_DEBUG_COOKIE_NAME = 'interview-auth-debug';
export const ROLE_DEBUG_COOKIE_NAME = 'interview-role-debug';

const getDebugUser = async (cookies: NextApiRequest['cookies']): Promise<User | undefined> => {
    const cookie =
        standConfig.isDebugCookieAllowed && AUTH_DEBUG_COOKIE_NAME in cookies
            ? cookies[AUTH_DEBUG_COOKIE_NAME]
            : undefined;

    return cookie ? userDbService.getByEmail(cookie) : undefined;
};

const getDebugRoles = (cookies: NextApiRequest['cookies']): Promise<UserRolesInfo> | undefined => {
    const cookie =
        standConfig.isDebugCookieAllowed && ROLE_DEBUG_COOKIE_NAME in cookies
            ? cookies[ROLE_DEBUG_COOKIE_NAME]
            : undefined;

    return cookie ? externalUsersDebugService.getUserRolesFromDebugCookie(cookie) : undefined;
};

const getUser = async (id: number, req: GetServerSidePropsContext['req']): Promise<User> => {
    const authDebugUser = await getDebugUser(req.cookies);

    if (authDebugUser) {
        return authDebugUser;
    }

    if (standConfig.isNextAuthEnabled) {
        return userDbService.find(id);
    }

    throw new ErrorWithStatus(tr('No auth option is available'), 400);
};

const getUserRoles = async (id: number, req: GetServerSidePropsContext['req']): Promise<UserRolesInfo> => {
    const debugRoles = await getDebugRoles(req.cookies);

    return debugRoles || userDbService.getUserRoles(id);
};

const providers: NextAuthOptions['providers'] = [
    // https://next-auth.js.org/providers/keycloak
    KeycloakProvider({
        clientId: config.nextAuth.keycloak.id,
        clientSecret: config.nextAuth.keycloak.secret,
        issuer: config.nextAuth.keycloak.issuer,
        client: {
            authorization_signed_response_alg: config.nextAuth.keycloak.jwsAlgorithm,
            id_token_signed_response_alg: config.nextAuth.keycloak.jwsAlgorithm,
        },
        allowDangerousEmailAccountLinking: true,
    }),
];

// https://next-auth.js.org/configuration/options
export const getAuthOptions = (req: GetServerSidePropsContext['req']): NextAuthOptions => ({
    secret: config.nextAuth.secret,
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'jwt' },
    providers,
    debug: true,
    callbacks: {
        session: async ({ session, token, user }) => {
            const id = (session.user.id || token?.id || user.id) as number;
            const dbUser = await getUser(id, req);
            const userRoles = await getUserRoles(id, req);

            return {
                ...session,
                user: dbUser,
                userRoles,
            };
        },

        jwt: async ({ token, user }) => {
            return user
                ? {
                      ...token,
                      id: user.id,
                  }
                : token;
        },
    },
});

export const getServerSession = async (
    req: GetServerSidePropsContext['req'],
    res: GetServerSidePropsContext['res'],
): Promise<Session | null> => {
    const session = await unstable_getServerSession(req, res, getAuthOptions(req));
    const debugUser = await getDebugUser(req.cookies);
    const debugRoles = await getDebugRoles(req.cookies);

    const user = debugUser ?? session?.user;
    const userRoles =
        debugRoles ?? session?.userRoles ?? (await externalUsersDebugService.getUserRolesFromDebugCookie(''));
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    const expires = session?.expires ?? date.toISOString();

    if (user) {
        return { user, userRoles, expires };
    }

    return null;
};

declare module 'next-auth' {
    interface Session {
        user: User;
        userRoles: UserRolesInfo;
    }
}
