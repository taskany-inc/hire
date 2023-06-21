import { DebugAuth } from '../../components/DebugAuth';
import { LayoutMain } from '../../components/layout/LayoutMain';
import { Paths } from '../../utils/paths';
import { standConfig } from '../../utils/stand';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';
import { userDbService } from '../../backend/modules/user/user-db-service';
import { InferServerSideProps } from '../../types';

import { tr } from './debug.i18n';

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

const DebugAuthPage = ({ users }: InferServerSideProps<typeof getServerSideProps>) => {
    return (
        <LayoutMain pageTitle={tr('Auth by debug cookie')}>
            <DebugAuth users={users} />
        </LayoutMain>
    );
};

export default DebugAuthPage;
