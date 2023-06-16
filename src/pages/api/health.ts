import { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '../../backend';
import { getApiHandler } from '../../backend/api-handler.util';

const handler = getApiHandler().get(async (_req: NextApiRequest, res: NextApiResponse) => {
    await prisma.problem.findFirst();
    res.status(200).json('Ok');
});

export default handler;
