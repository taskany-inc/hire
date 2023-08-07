import { Paths } from '../../utils/paths';
import { standConfig } from '../../utils/stand';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';
import { userDbService } from '../../backend/modules/user/user-db-service';
import DebugAuthPage from '../../controllers/DebugAuthPage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: false,
    action: async ({ context }) => {
        const users = await userDbService.getAll();

        if (!standConfig.isDebugCookieAllowed) {
            context.res.writeHead(302, { Location: Paths.HOME }).end();
        }

        return { users };
    },
});

export default DebugAuthPage;
