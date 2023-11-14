import { externalUsersMethods } from '../../modules/extUsersMethods';
import { externalUserSearchSchema } from '../../modules/extUsersTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const externalUserRouter = router({
    search: protectedProcedure.input(externalUserSearchSchema).query(({ input }) => {
        return externalUsersMethods.searchUsers(input.search ?? '');
    }),
});
