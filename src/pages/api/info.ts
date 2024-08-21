import { NextApiRequest, NextApiResponse } from 'next';

import { getApiHandler } from '../../utils/apiHandler';
import config from '../../config';
import { getServerSession } from '../../utils/auth';

const handler = getApiHandler().get(async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res);
    const info = {
        session,
        defaultPageURL: config.defaultPageURL,
        defaultCandidateVendor: config.defaultCandidateVendor,
        jwtPublicKey: config.jwtPublicKey,
        gravatar: config.gravatar,
        sourceUsers: config.sourceUsers,
        mattermost: config.mattermost,
        pluginMenuItems: config.pluginMenuItems,
        debugCookieEnabled: config.debugCookieEnabled,
        logToFileEnabled: config.logToFileEnabled,
        mailEnabled: config.nodemailer.enabled,
        crewUrl: config.crew.url,
    };
    res.status(200).json(info);
});

export default handler;
