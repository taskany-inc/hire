import { NextApiRequest, NextApiResponse } from 'next';

import { getApiHandler } from '../../utils/apiHandler';
import config from '../../config';
import { getServerSession } from '../../utils/auth';
import { stand, standConfig } from '../../utils/stand';

const handler = getApiHandler().get(async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res);
    const info = {
        workflowName: process.env.WORKFLOW_NAME,
        serviceEnvironment: process.env.SERVICE_ENVIRONMENT,
        session,
        stand,
        standConfig,
        defaultPageURL: config.defaultPageURL,
        jwtPublicKey: config.jwtPublicKey,
        gravatar: config.gravatar,
        sourceUsers: config.sourceUsers,
        mattermost: config.mattermost,
    };
    res.status(200).json(info);
});

export default handler;
