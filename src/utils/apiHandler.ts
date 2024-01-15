// Only used to send attaches, waits when trpc will can send files
import { NextApiRequest, NextApiResponse } from 'next';
import nc, { ErrorHandler, NextConnect } from 'next-connect';
import { urlencoded } from 'body-parser';
import pino from 'pino';
import pinoHttp from 'pino-http';

import config from '../config';

import { parseError } from './errorParsing';
import { getServerSession } from './auth';

const LOGGED_KEYS = ['id', 'method', 'url', 'query'];
const LOGGED_HEADERS = ['user-agent'];

export const getAuthChecker = () => async (req: NextApiRequest, res: NextApiResponse, next: VoidFunction) => {
    const session = await getServerSession(req, res);

    if (session) {
        next();
    } else {
        res.status(401).end();
    }
};

const pinoLog = pinoHttp(
    {
        serializers: {
            req(req: NextApiRequest) {
                const filtered = {};
                LOGGED_KEYS.forEach((k) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    filtered[k] = req[k];
                });
                LOGGED_HEADERS.forEach((h) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    filtered[h] = req.headers[h];
                });

                return filtered;
            },
        },
    },
    config.logToFileEnabled ? pino.destination('/opt/logs/pinohttp.log') : pino.destination(1),
);

const onError: ErrorHandler<NextApiRequest, NextApiResponse> = (err, req, res) => {
    const { status, message } = parseError(err);
    res.status(status).end(message);
};

export function getApiHandler(): NextConnect<NextApiRequest, NextApiResponse> {
    const app = nc<NextApiRequest, NextApiResponse>({ onError });

    app.use(urlencoded({ extended: true }));

    if (process.env.NODE_ENV !== 'development') {
        app.use(pinoLog);
    }

    return app;
}
