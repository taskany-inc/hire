import * as trpcNext from '@trpc/server/adapters/next';

import { createContext } from '../../../trpc/trpcContext';
import { trpcRouter } from '../../../trpc/routers';

export default trpcNext.createNextApiHandler({
    router: trpcRouter,
    createContext,
});
