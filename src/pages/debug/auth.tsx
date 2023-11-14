import { Paths } from '../../utils/paths';
import { standConfig } from '../../utils/stand';
import { createGetServerSideProps } from '../../utils/createGetSSRProps';
import { userMethods } from '../../modules/userMethods';
import DebugAuthPage from '../../components/DebugAuthPage/DebugAuthPage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: false,
    action: async ({ context }) => {
        const users = await userMethods.getAll();

        if (!standConfig.isDebugCookieAllowed) {
            context.res.writeHead(302, { Location: Paths.HOME }).end();
        }

        return { users };
    },
});

export default DebugAuthPage;
