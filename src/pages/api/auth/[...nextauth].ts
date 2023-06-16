import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';

import { getAuthOptions } from '../../../utils/auth';

export default (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, getAuthOptions(req));
