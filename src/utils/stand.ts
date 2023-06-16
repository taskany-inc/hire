export type Stand = 'unknown' | 'local' | 'pr' | 'dev' | 'ift' | 'prom';

const getStand = (): Stand => {
    const workflowName = process.env.WORKFLOW_NAME;
    const serviceEnvironment = process.env.SERVICE_ENVIRONMENT;

    if (process.env.NODE_ENV === 'development') {
        return 'local';
    }

    if (workflowName === 'pr' && serviceEnvironment === 'dev') {
        return 'pr';
    }

    if (workflowName === 'dev' && serviceEnvironment === 'dev') {
        return 'dev';
    }

    if (workflowName === 'release' && serviceEnvironment === 'ift') {
        return 'ift';
    }

    if (workflowName === 'release') {
        return 'prom';
    }

    return 'unknown';
};

export const stand = getStand();

export type StandConfig = {
    isNextAuthEnabled: boolean;
    isDebugCookieAllowed: boolean;
    isLogToFileEnabled: boolean;
};

const standConfigs: Record<Stand, StandConfig> = {
    unknown: {
        isNextAuthEnabled: true,
        isDebugCookieAllowed: false,
        isLogToFileEnabled: false,
    },
    local: {
        isNextAuthEnabled: false,
        isDebugCookieAllowed: true,
        isLogToFileEnabled: false,
    },
    pr: {
        isNextAuthEnabled: false,
        isDebugCookieAllowed: true,
        isLogToFileEnabled: true,
    },
    dev: {
        isNextAuthEnabled: true,
        isDebugCookieAllowed: true,
        isLogToFileEnabled: true,
    },
    ift: {
        isNextAuthEnabled: true,
        isDebugCookieAllowed: true,
        isLogToFileEnabled: true,
    },
    prom: {
        isNextAuthEnabled: true,
        isDebugCookieAllowed: false,
        isLogToFileEnabled: true,
    },
};

export const standConfig = standConfigs[stand];
