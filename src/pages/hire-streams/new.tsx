import { useRouter } from 'next/router';

import { accessChecks } from '../../backend/access/access-checks';
import { HireStreamForm } from '../../components/hire-streams/HireStreamForm';
import { LayoutMain } from '../../components/layout/LayoutMain';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';
import { pageHrefs } from '../../utils/paths';

import { tr } from './hire-streams.i18n';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session, handleAccessChecks }) => {
        await handleAccessChecks(() => accessChecks.hireStream.create(session));
    },
});

const NewHireStreamPage = () => {
    const router = useRouter();

    return (
        <LayoutMain pageTitle={tr('New hire stream')}>
            <HireStreamForm afterSubmit={(hireStream) => router.push(pageHrefs.hireStream(hireStream.id))} />
        </LayoutMain>
    );
};

export default NewHireStreamPage;
