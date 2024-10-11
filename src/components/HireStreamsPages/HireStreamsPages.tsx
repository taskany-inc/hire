import { trpc } from '../../trpc/trpcClient';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { HireStreamList } from '../HireStreamList/HireStreamList';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { pageHrefs } from '../../utils/paths';

import { tr } from './HireStreamsPages.i18n';

const HireStreamsPages = () => {
    const hireStreamsQuery = trpc.hireStreams.getManaged.useQuery();

    return (
        <LayoutMain pageTitle={tr('Hire streams')}>
            <QueryResolver queries={[hireStreamsQuery]}>
                {([hireStreams]) => (
                    <HireStreamList hireStreams={hireStreams} getLink={(stream) => pageHrefs.hireStream(stream.name)} />
                )}
            </QueryResolver>
        </LayoutMain>
    );
};

export default HireStreamsPages;
