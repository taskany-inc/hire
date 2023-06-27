import { SectionTypeWithHireStream } from '../backend/modules/section-type/section-type-types';
import { DebugRoles } from '../components/DebugRoles';
import { QueryResolver } from '../components/QueryResolver';
import { LayoutMain } from '../components/layout/LayoutMain';
import { useHireStreams } from '../hooks/hire-streams-hooks';

import { tr } from './controllers.i18n';

export type DebugRolesPageProps = {
    sectionTypes: SectionTypeWithHireStream[];
};
const DebugRolesPage = ({ sectionTypes }: DebugRolesPageProps) => {
    const hireStreamsQuery = useHireStreams();

    return (
        <LayoutMain pageTitle={tr('Set roles by debug cookie')}>
            <QueryResolver queries={[hireStreamsQuery]}>
                {([hireStreams]) => <DebugRoles hireStreams={hireStreams} sectionTypes={sectionTypes} />}
            </QueryResolver>
        </LayoutMain>
    );
};

export default DebugRolesPage;
