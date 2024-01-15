import { sectionTypeMethods } from '../../modules/sectionTypeMethods';
import { Paths } from '../../utils/paths';
import { createGetServerSideProps } from '../../utils/createGetSSRProps';
import DebugRolesPage from '../../components/DebugRolesPage/DebugRolesPage';
import config from '../../config';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ context, ssg }) => {
        if (!config.debugCookieEnabled) {
            context.res.writeHead(302, { Location: Paths.HOME });
        }

        await ssg.hireStreams.getAll.fetch();
        const sectionTypes = await sectionTypeMethods.getAll({});

        return { sectionTypes };
    },
});

export default DebugRolesPage;
