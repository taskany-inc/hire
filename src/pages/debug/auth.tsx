import { Paths } from '../../utils/paths';
import { createGetServerSideProps } from '../../utils/createGetSSRProps';
import { userMethods } from '../../modules/userMethods';
import DebugAuthPage from '../../components/DebugAuthPage/DebugAuthPage';
import config from '../../config';

export const getServerSideProps = createGetServerSideProps({
    requireSession: false,
    action: async ({ context }) => {
        const users = await userMethods.getAll();

        if (!config.debugCookieEnabled) {
            context.res.writeHead(302, { Location: Paths.HOME }).end();
        }

        return { users };
    },
});

export default DebugAuthPage;
