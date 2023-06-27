import { accessChecks } from '../../backend/access/access-checks';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';
import NewHireStreamPage from '../../controllers/NewHireStreamPage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session, handleAccessChecks }) => {
        await handleAccessChecks(() => accessChecks.hireStream.create(session));
    },
});

export default NewHireStreamPage;
