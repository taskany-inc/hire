import { sectionTypeDbService } from '../../backend/modules/section-type/section-type-db-service';
import { LayoutMain } from '../../components/layout/LayoutMain';
import { DebugRoles } from '../../components/DebugRoles';
import { InferServerSideProps } from '../../types';
import { standConfig } from '../../utils/stand';
import { Paths } from '../../utils/paths';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';
import { useHireStreams } from '../../hooks/hire-streams-hooks';
import { QueryResolver } from '../../components/QueryResolver';

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

const DebugRolesPage = ({ sectionTypes }: InferServerSideProps<typeof getServerSideProps>) => {
    const hireStreamsQuery = useHireStreams();

    return (
        <LayoutMain pageTitle="Set roles by debug cookie">
            <QueryResolver queries={[hireStreamsQuery]}>
                {([hireStreams]) => <DebugRoles hireStreams={hireStreams} sectionTypes={sectionTypes} />}
            </QueryResolver>
        </LayoutMain>
    );
};

export default DebugRolesPage;
