import { SectionTypeWithHireStream } from '../../modules/sectionTypeTypes';
import { useHireStreams } from '../../modules/hireStreamsHooks';
import { DebugRoles } from '../DebugRoles/DebugRoles';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { LayoutMain } from '../LayoutMain/LayoutMain';

import { tr } from './DebugRolesPage.i18n';

export interface DebugRolesPageProps {
    sectionTypes: SectionTypeWithHireStream[];
}
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
