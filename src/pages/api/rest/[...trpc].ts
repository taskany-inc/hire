import { createOpenApiNextHandler } from 'trpc-openapi';

import { restRouter } from '../../../trpc/routers/restRouter';
import { createContext } from '../../../trpc/trpcContext';

export default createOpenApiNextHandler({ router: restRouter, createContext });
