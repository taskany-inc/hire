const getEnvVariableOrThrow = (varName: string, options?: { allowEmptyString?: boolean }): string => {
    if (typeof window !== 'undefined' && !varName.startsWith('NEXT_PUBLIC')) {
        return '';
    }

    if (process.env.CI) {
        return '';
    }

    const envVar = process.env[varName];

    if (envVar === undefined) {
        throw new Error(`Cannot find environment variable "${varName}"`);
    }

    if (!options?.allowEmptyString && envVar.length === 0) {
        throw new Error(`Environment variable "${varName}" should not be an empty string`);
    }

    return envVar;
};

const parsePluginMenuItems = (variable: string | undefined): { text: string; path: string }[] => {
    if (!variable) {
        return [];
    }
    try {
        const parsed = JSON.parse(variable);

        return parsed;
    } catch (e) {
        return [];
    }
};

const parseCustomGrades = (variable: string | undefined): string[] | undefined => {
    if (!variable) {
        return;
    }
    try {
        const parsed = JSON.parse(variable);

        return parsed;
    } catch (e) {
        return;
    }
};

export default {
    defaultPageURL: getEnvVariableOrThrow('HOME_URL'),
    database: {
        url: getEnvVariableOrThrow('DATABASE_URL'),
    },
    jwtPublicKey: getEnvVariableOrThrow('JWT_PUBLIC_KEY'),
    defaultCandidateVendor: process.env.NEXT_PUBLIC_DEFAULT_CANDIDATE_VENDOR,
    gravatar: {
        url: getEnvVariableOrThrow('GRAVATAR_URL'),
    },
    sourceUsers: {
        sourceOfUsersUrl: process.env.SOURCE_OF_USERS_URL,
        sourceOfUsersByEmail: process.env.SOURCE_OF_USERS_BY_EMAIL,
        sendEmail: process.env.SEND_EMAIL,
        searchUsersList: process.env.SEARCHE_USERS_LIST,
        sourceOffUsersAccessToken: getEnvVariableOrThrow('SOURCE_OF_USERS_ACCESS_TOKEN'),
    },
    nextAuth: {
        secret: getEnvVariableOrThrow('NEXTAUTH_SECRET'),
        keycloak: {
            id: getEnvVariableOrThrow('KEYCLOAK_ID'),
            secret: getEnvVariableOrThrow('KEYCLOAK_SECRET'),
            issuer: getEnvVariableOrThrow('KEYCLOAK_ISSUER'),
            jwsAlgorithm: getEnvVariableOrThrow('KEYCLOAK_JWS_ALGORITHM'),
        },
    },
    mattermost: {
        hireSupportChannel: `${process.env.NEXT_PUBLIC_MATTERMOST_URL}channels/sd-hire-support`,
    },
    prisma: {
        options: {
            log: process.env.PRISMA_LOG === 'query' ? ['query'] : [],
        },
    },
    s3: {
        region: getEnvVariableOrThrow('S3_REGION'),
        endpoint: getEnvVariableOrThrow('S3_ENDPOINT'),
        accessKeyId: getEnvVariableOrThrow('S3_ACCESS_KEY_ID'),
        secretAccessKey: getEnvVariableOrThrow('S3_SECRET_ACCESS_KEY'),
        bucket: getEnvVariableOrThrow('S3_BUCKET'),
    },
    pluginMenuItems: parsePluginMenuItems(process.env.NEXT_PUBLIC_PLUGIN_MENU_ITEMS),
    customGrades: parseCustomGrades(process.env.NEXT_PUBLIC_CUSTOM_GRADE_OPTIONS),
};
