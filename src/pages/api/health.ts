import { NextApiRequest, NextApiResponse } from 'next';

import { getApiHandler } from '../../backend/api-handler.util';

const handler = getApiHandler().get(async (_req: NextApiRequest, res: NextApiResponse) => {
    res.status(200).json('Ok');
});

export default handler;
