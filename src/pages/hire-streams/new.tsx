import { accessChecks } from '../../modules/accessChecks';
import { createGetServerSideProps } from '../../utils/createGetSSRProps';
import NewHireStreamPage from '../../components/NewHireStreamPage/NewHireStreamPage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session, handleAccessChecks }) => {
        await handleAccessChecks(() => accessChecks.hireStream.create(session));
    },
});

export default NewHireStreamPage;
