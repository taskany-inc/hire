import { QueryResolver } from '../components/QueryResolver';
import { AddOrUpdateCandidate } from '../components/candidates/AddOrUpdateCandidate';
import { LayoutMain } from '../components/layout/LayoutMain';
import { useOutstaffVendors } from '../hooks/candidate-hooks';

import { tr } from './controllers.i18n';

const NewCandidatePage = () => {
    const outstaffVendorsQuery = useOutstaffVendors();

    return (
        <LayoutMain pageTitle={tr('New candidate')}>
            <QueryResolver queries={[outstaffVendorsQuery]}>
                {([outstaffVendors]) => <AddOrUpdateCandidate variant="new" outstaffVendors={outstaffVendors} />}
            </QueryResolver>
        </LayoutMain>
    );
};

export default NewCandidatePage;
