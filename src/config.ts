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

export default {
    defaultPageURL: process.env.HOME_URL,
    database: {
        url: process.env.DATABASE_URL,
    },
    jwtPublicKey: process.env.JWT_PUBLIC_KEY,
    defaultCandidateVendor: process.env.NEXT_PUBLIC_DEFAULT_CANDIDATE_VENDOR,
    gravatar: {
        host: process.env.NEXT_PUBLIC_GRAVATAR_HOST,
    },
    nextAuth: {
        secret: process.env.NEXTAUTH_SECRET,
        keycloak: {
            id: process.env.KEYCLOAK_ID,
            secret: process.env.KEYCLOAK_SECRET,
            issuer: process.env.KEYCLOAK_ISSUER,
            jwsAlgorithm: process.env.KEYCLOAK_JWS_ALGORITHM,
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
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT,
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        bucket: process.env.S3_BUCKET,
    },
    nodemailer: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        authPass: process.env.MAIL_PASS,
        authUser: process.env.MAIL_USER,
        enabled: Boolean(process.env.MAIL_PASS && process.env.MAIL_USER),
    },
    pluginMenuItems: parsePluginMenuItems(process.env.NEXT_PUBLIC_PLUGIN_MENU_ITEMS),
    debugCookieEnabled: process.env.NEXT_PUBLIC_DEBUG_COOKIE_ENABLE,
    logToFileEnabled: process.env.LOG_TO_FILE_ENABLE,
    crew: {
        url: process.env.NEXT_PUBLIC_CREW_URL,
        apiToken: process.env.CREW_API_TOKEN,
        sectionAchiementId: process.env.CREW_SECTIONS_ACHIEVEMENT,
        techUserEmail: process.env.CREW_TECHNICAL_USER_EMAIL,
        sectionAmountForAchievement: Number(process.env.SECTION_AMOUNT_FOR_ACHIEVEMENT) || 5,
        userByEmailLink: process.env.NEXT_PUBLIC_LINK_TO_USER_BY_EMAIL,
    },
    aiAssistant: {
        apiUrl: process.env.AI_ASSISTANT_API_URL,
        authUrl: process.env.AI_ASSISTANT_AUTH_URL,
        authHeader: process.env.AI_ASSISTANT_AUTH_HEADER,
        authScope: process.env.AI_ASSISTANT_AUTH_SCOPE,
        model: process.env.AI_ASSISTANT_MODEL,
        cvParsePrompt: process.env.AI_ASSISTANT_CV_PARSE_PROMPT,
    },
    code: {
        url: process.env.CODE_URL,
        apiToken: process.env.CODE_API_TOKEN,
        claimSessionLink: process.env.CODE_SESSION_CLAIM_LINK,
        enabled: Boolean(process.env.CODE_URL && process.env.CODE_API_TOKEN && process.env.CODE_SESSION_CLAIM_LINK),
    },
};
