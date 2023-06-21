import { AddOrUpdateCandidate } from '../../components/candidates/AddOrUpdateCandidate';
import { LayoutMain } from '../../components/layout/LayoutMain';
import { accessChecks } from '../../backend/access/access-checks';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';
import { useOutstaffVendors } from '../../hooks/candidate-hooks';
import { QueryResolver } from '../../components/QueryResolver';

import { tr } from './candidates.i18n';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg, session, handleAccessChecks }) => {
        await ssg.candidates.getOutstaffVendors.fetch();

        await handleAccessChecks(() => accessChecks.candidate.create(session));
    },
});

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
