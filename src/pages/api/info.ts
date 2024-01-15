import { NextApiRequest, NextApiResponse } from 'next';

import { getApiHandler } from '../../utils/apiHandler';
import config from '../../config';
import { getServerSession } from '../../utils/auth';

const handler = getApiHandler().get(async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res);
    const info = {
        workflowName: process.env.WORKFLOW_NAME,
        serviceEnvironment: process.env.SERVICE_ENVIRONMENT,
        session,
        defaultPageURL: config.defaultPageURL,
        jwtPublicKey: config.jwtPublicKey,
        gravatar: config.gravatar,
        sourceUsers: config.sourceUsers,
        mattermost: config.mattermost,
        debugCookieEnabled: config.debugCookieEnabled,
        nextAuthEnabled: config.nextAuthEnabled,
        logToFileEnabled: config.logToFileEnabled,
        mailEnabled: config.nodemailer.enabled,
    };
    res.status(200).json(info);
});

export default handler;
