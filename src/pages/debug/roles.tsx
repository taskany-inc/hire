import { sectionTypeDbService } from '../../backend/modules/section-type/section-type-db-service';
import { standConfig } from '../../utils/stand';
import { Paths } from '../../utils/paths';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';
import DebugRolesPage from '../../controllers/DebugRolesPage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ context, ssg }) => {
        if (!standConfig.isDebugCookieAllowed) {
            context.res.writeHead(302, { Location: Paths.HOME });
        }

        await ssg.hireStreams.getAll.fetch();
        const sectionTypes = await sectionTypeDbService.getAll({});

        return { sectionTypes };
    },
});

export default DebugRolesPage;
