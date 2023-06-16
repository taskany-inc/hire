import { externalUsersService } from '../../modules/ext-users/ext-users-service';
import { externalUserSearchSchema } from '../../modules/ext-users/ext-users-types';
import { protectedProcedure, router } from '../trpc-back';

export const externalUserRouter = router({
    search: protectedProcedure.input(externalUserSearchSchema).query(({ input }) => {
        return externalUsersService.searchUsers(input.search ?? '');
    }),
});
