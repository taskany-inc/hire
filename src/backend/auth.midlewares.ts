import { NextApiRequest, NextApiResponse } from 'next';

import { getServerSession } from '../utils/auth';

export const getAuthChecker = () => async (req: NextApiRequest, res: NextApiResponse, next: VoidFunction) => {
    const session = await getServerSession(req, res);

    if (session) {
        next();
    } else {
        res.status(401).end();
    }
};
