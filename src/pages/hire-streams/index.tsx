import { accessChecks } from '../../backend/access/access-checks';
import { HireStreamList } from '../../components/hire-streams/HireStreamList';
import { LayoutMain } from '../../components/layout/LayoutMain';
import { QueryResolver } from '../../components/QueryResolver';
import { useHireStreams } from '../../hooks/hire-streams-hooks';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';

import { tr } from './hire-streams.i18n';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session, ssg, handleAccessChecks }) => {
        await ssg.hireStreams.getAll.fetch();

        await handleAccessChecks(() => accessChecks.hireStream.read(session));
    },
});

const HireStreamsPages = () => {
    const hireStreamsQuery = useHireStreams();

    return (
        <LayoutMain pageTitle={tr('Hire streams')}>
            <QueryResolver queries={[hireStreamsQuery]}>
                {([hireStreams]) => <HireStreamList hireStreams={hireStreams} />}
            </QueryResolver>
        </LayoutMain>
    );
};

export default HireStreamsPages;
