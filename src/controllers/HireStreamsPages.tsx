import { QueryResolver } from '../components/QueryResolver';
import { HireStreamList } from '../components/hire-streams/HireStreamList';
import { LayoutMain } from '../components/layout/LayoutMain';
import { useHireStreams } from '../hooks/hire-streams-hooks';
import { trpc } from '../utils/trpc-front';

import { tr } from './controllers.i18n';

const HireStreamsPages = () => {
    const hireStreamsQuery = trpc.hireStreams.getManaged.useQuery();

    return (
        <LayoutMain pageTitle={tr('Hire streams')}>
            <QueryResolver queries={[hireStreamsQuery]}>
                {([hireStreams]) => <HireStreamList hireStreams={hireStreams} />}
            </QueryResolver>
        </LayoutMain>
    );
};

export default HireStreamsPages;
