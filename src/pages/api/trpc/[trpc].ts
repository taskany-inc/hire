import * as trpcNext from '@trpc/server/adapters/next';

import { createContext } from '../../../backend/trpc/context';
import { trpcRouter } from '../../../backend/trpc/routers/_trpc-router';

export default trpcNext.createNextApiHandler({
    router: trpcRouter,
    createContext,
});
