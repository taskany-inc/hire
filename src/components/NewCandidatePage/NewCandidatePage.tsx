import { useOutstaffVendors } from '../../modules/candidateHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { AddOrUpdateCandidate } from '../AddOrUpdateCandidate/AddOrUpdateCandidate';
import { LayoutMain } from '../LayoutMain';

import { tr } from './NewCandidatePage.i18n';

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
